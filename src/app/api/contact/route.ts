import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const { name, email, subject, message, honeypot, captchaAnswer, captchaNum1, captchaNum2 } = await request.json()

    if (honeypot) {
      return NextResponse.json({ success: true })
    }

    if (Number(captchaAnswer) !== Number(captchaNum1) + Number(captchaNum2)) {
      return NextResponse.json({ error: "التحقق الأمني غير صحيح" }, { status: 400 })
    }

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: "جميع الحقول مطلوبة" }, { status: 400 })
    }

    if (name.length > 100 || subject.length > 200 || message.length > 5000) {
      return NextResponse.json({ error: "النص طويل جداً" }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "البريد الإلكتروني غير صالح" }, { status: 400 })
    }

    await prisma.contactMessage.create({
      data: { name, email, subject, message },
    })

    return NextResponse.json({ success: true, message: "تم إرسال رسالتك بنجاح" })
  } catch (err) {
    console.error("Contact form error:", err)
    return NextResponse.json({ error: "فشل إرسال الرسالة" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const search = searchParams.get("search") || ""
  const status = searchParams.get("status")

  const where: Record<string, unknown> = {}
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { email: { contains: search } },
      { subject: { contains: search } },
      { message: { contains: search } },
    ]
  }
  if (status === "read") where.read = true
  if (status === "unread") where.read = false

  const messages = await prisma.contactMessage.findMany({
    where,
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(messages)
}
