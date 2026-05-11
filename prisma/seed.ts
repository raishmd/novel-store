import { PrismaClient } from "@prisma/client"
import { hash } from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  const email = process.env.ADMIN_EMAIL || "admin@example.com"
  const password = process.env.ADMIN_PASSWORD || "admin123"

  const hashedPassword = await hash(password, 12)

  const existingUser = await prisma.user.findUnique({ where: { email } })

  if (!existingUser) {
    await prisma.user.create({
      data: {
        email,
        name: "المدير",
        password: hashedPassword,
      },
    })
    console.log(`✅ تم إنشاء حساب المدير: ${email}`)
  } else {
    console.log(`ℹ️  حساب المدير موجود مسبقاً: ${email}`)
  }

  const settingsCount = await prisma.setting.count()
  if (settingsCount === 0) {
    await prisma.setting.createMany({
      data: [
        { key: "siteName", value: "متجر الروايات" },
        { key: "authorName", value: "اسم الكاتب" },
        { key: "authorBio", value: "كاتب ورائي عربي، يكتب بحب وشغف." },
      ],
    })
    console.log("✅ تم إنشاء الإعدادات الافتراضية")
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
