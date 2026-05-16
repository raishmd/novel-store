import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import crypto from "crypto"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "البريد الإلكتروني مطلوب" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return NextResponse.json({ message: "إذا كان البريد موجوداً، سيتم إرسال رابط إعادة التعيين" })
    }

    const token = crypto.randomBytes(32).toString("hex")
    const expires = new Date(Date.now() + 3600000) // 1 hour

    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires,
      },
    })

    const { sendPasswordResetEmail } = await import("@/lib/email")
    await sendPasswordResetEmail(email, token)

    return NextResponse.json({ message: "إذا كان البريد موجوداً، سيتم إرسال رابط إعادة التعيين" })
  } catch {
    return NextResponse.json({ error: "حدث خطأ، حاول مرة أخرى" }, { status: 500 })
  }
}
