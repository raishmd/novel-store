import { NextResponse } from "next/server"
import nodemailer from "nodemailer"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function POST() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 })
  }

  const settings = await prisma.setting.findMany({
    where: {
      key: { in: ["smtpHost", "smtpPort", "smtpSecure", "smtpUser", "smtpPass"] },
    },
  })
  const map: Record<string, string> = {}
  for (const s of settings) map[s.key] = s.value

  const host = map.smtpHost || process.env.SMTP_HOST
  const user = map.smtpUser || process.env.SMTP_USER
  const pass = map.smtpPass || process.env.SMTP_PASS

  if (!host || !user || !pass) {
    return NextResponse.json({
      success: false,
      error: "إعدادات SMTP غير مكتملة. تأكد من ملء جميع الحقول.",
      config: { host: host || "—", user: user || "—", passSet: !!pass },
    })
  }

  const transporter = nodemailer.createTransport({
    host,
    port: Number(map.smtpPort || process.env.SMTP_PORT) || 587,
    secure: map.smtpSecure === "true" || process.env.SMTP_SECURE === "true",
    auth: { user, pass },
  })

  try {
    await transporter.verify()
    return NextResponse.json({ success: true, message: "✅ تم الاتصال بنجاح" })
  } catch (err) {
    return NextResponse.json({
      success: false,
      error: err instanceof Error ? err.message : String(err),
      config: { host, port: Number(map.smtpPort || process.env.SMTP_PORT) || 587, user, passSet: !!pass },
    })
  }
}
