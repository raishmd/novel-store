import nodemailer from "nodemailer"
import { prisma } from "./prisma"

export async function getSmtpConfig() {
  const settings = await prisma.setting.findMany({
    where: {
      key: { in: ["smtpHost", "smtpPort", "smtpSecure", "smtpUser", "smtpPass", "smtpFrom"] },
    },
  })
  const map: Record<string, string> = {}
  for (const s of settings) map[s.key] = s.value
  return map
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const smtp = await getSmtpConfig()
  const host = smtp.smtpHost || process.env.SMTP_HOST
  const user = smtp.smtpUser || process.env.SMTP_USER
  const pass = smtp.smtpPass || process.env.SMTP_PASS

  if (!host || !user || !pass) {
    throw new Error(
      "SMTP_* environment variables are not configured. "
      + "Set SMTP_HOST, SMTP_USER, and SMTP_PASS in the dashboard settings."
    )
  }

  const transporter = nodemailer.createTransport({
    host,
    port: Number(smtp.smtpPort || process.env.SMTP_PORT) || 587,
    secure: smtp.smtpSecure === "true" || process.env.SMTP_SECURE === "true",
    auth: { user, pass },
  })

  const siteName = "متجر الروايات"
  const resetUrl = `${process.env.AUTH_URL || "http://localhost:3000"}/reset-password?token=${token}`
  const from = smtp.smtpFrom || process.env.SMTP_FROM || `"${siteName}" <${user}>`

  await transporter.sendMail({
    from,
    to: email,
    subject: `إعادة تعيين كلمة المرور - ${siteName}`,
    html: `
      <div dir="rtl" style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <div style="text-align: center; padding: 32px 0;">
          <h1 style="font-size: 24px; margin: 0;">${siteName}</h1>
        </div>
        <div style="background: #f9f9f9; border-radius: 16px; padding: 32px;">
          <h2 style="font-size: 18px; margin: 0 0 16px;">إعادة تعيين كلمة المرور</h2>
          <p style="color: #666; line-height: 1.6; margin: 0 0 24px;">
            تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بحسابك. 
            يمكنك الضغط على الرابط أدناه لتعيين كلمة مرور جديدة:
          </p>
          <a href="${resetUrl}" style="display: block; text-align: center; background: #000; color: #fff; text-decoration: none; padding: 14px 24px; border-radius: 12px; font-size: 15px; font-weight: 600;">
            إعادة تعيين كلمة المرور
          </a>
          <p style="color: #999; font-size: 13px; line-height: 1.6; margin: 24px 0 0;">
            إذا لم تطلب إعادة تعيين كلمة المرور، يمكنك تجاهل هذا البريد.
            ينتهي صلاحية الرابط بعد ساعة واحدة.
          </p>
        </div>
      </div>
    `,
  })
}
