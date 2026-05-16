import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendPasswordResetEmail } from "@/lib/email"
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

    await sendPasswordResetEmail(email, token)

    return NextResponse.json({ message: "إذا كان البريد موجوداً، سيتم إرسال رابط إعادة التعيين" })
  } catch (err) {
    console.error("forgot-password error:", err instanceof Error ? err.message : err)
    const message = err instanceof Error && err.message.includes("SMTP")
      ? "إعدادات البريد الإلكتروني غير مكتملة. أضف SMTP_HOST, SMTP_USER, SMTP_PASS في Vercel"
      : "حدث خطأ، حاول مرة أخرى"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
