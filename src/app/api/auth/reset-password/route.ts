import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hash } from "bcryptjs"

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json({ error: "البيانات غير مكتملة" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" }, { status: 400 })
    }

    const record = await prisma.verificationToken.findUnique({
      where: { token },
    })

    if (!record) {
      return NextResponse.json({ error: "الرابط غير صالح أو منتهي الصلاحية" }, { status: 400 })
    }

    if (record.expires < new Date()) {
      await prisma.verificationToken.delete({ where: { token } })
      return NextResponse.json({ error: "انتهت صلاحية الرابط" }, { status: 400 })
    }

    const hashedPassword = await hash(password, 12)

    await prisma.user.update({
      where: { email: record.identifier },
      data: { password: hashedPassword },
    })

    await prisma.verificationToken.delete({ where: { token } })

    return NextResponse.json({ message: "تم إعادة تعيين كلمة المرور بنجاح" })
  } catch {
    return NextResponse.json({ error: "حدث خطأ، حاول مرة أخرى" }, { status: 500 })
  }
}
