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
    const message = err instanceof Error ? err.message : String(err)
    console.error("forgot-password error:", message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
