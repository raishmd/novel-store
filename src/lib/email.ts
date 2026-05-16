import nodemailer from "nodemailer"

function getTransporter() {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error(
      "SMTP_* environment variables are not configured. "
      + "Set SMTP_HOST, SMTP_USER, and SMTP_PASS in your Vercel environment variables."
    )
  }
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const siteName = "متجر الروايات"
  const resetUrl = `${process.env.AUTH_URL || "http://localhost:3000"}/reset-password?token=${token}`
  const transporter = getTransporter()

  await transporter.sendMail({
    from: process.env.SMTP_FROM || `"${siteName}" <${process.env.SMTP_USER}>`,
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
