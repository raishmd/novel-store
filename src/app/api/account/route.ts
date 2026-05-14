import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { compare, hash } from "bcryptjs"

async function withRetry<T>(fn: () => Promise<T>, retries = 2): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn()
    } catch (err) {
      if (i === retries - 1) throw err
      await new Promise(r => setTimeout(r, 1500))
    }
  }
  throw new Error("unreachable")
}

export async function PUT(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 })
  }

  try {
    const { currentPassword, newEmail, newPassword } = await request.json()

    const user = await withRetry(() => prisma.user.findUnique({ where: { id: session.user.id } }))
    if (!user || !user.password) {
      return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 })
    }

    const isValid = await compare(currentPassword, user.password)
    if (!isValid) {
      return NextResponse.json({ error: "كلمة المرور الحالية غير صحيحة" }, { status: 400 })
    }

    const updateData: { email?: string; password?: string } = {}

    if (newEmail && newEmail !== user.email) {
      const existing = await withRetry(() => prisma.user.findUnique({ where: { email: newEmail } }))
      if (existing) {
        return NextResponse.json({ error: "البريد الإلكتروني مستخدم بالفعل" }, { status: 400 })
      }
      updateData.email = newEmail
    }

    if (newPassword) {
      if (newPassword.length < 6) {
        return NextResponse.json({ error: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" }, { status: 400 })
      }
      updateData.password = await hash(newPassword, 12)
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "لا توجد تغييرات" }, { status: 400 })
    }

    await withRetry(() =>
      prisma.user.update({
        where: { id: session.user.id },
        data: updateData,
      })
    )

    return NextResponse.json({ success: true, message: "تم تحديث البيانات بنجاح" })
  } catch (err) {
    console.error("PUT /api/account error:", err)
    return NextResponse.json({ error: "فشل تحديث البيانات" }, { status: 500 })
  }
}
