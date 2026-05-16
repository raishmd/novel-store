import { NextResponse } from "next/server"
import { v2 as cloudinary } from "cloudinary"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 })
  }

  try {
    const settings = await prisma.setting.findMany({
      where: { key: { in: ["cloudinaryCloudName", "cloudinaryApiKey", "cloudinaryApiSecret"] } },
    })
    const map: Record<string, string> = {}
    for (const s of settings) map[s.key] = s.value

    const cloudName = map.cloudinaryCloudName || process.env.CLOUDINARY_CLOUD_NAME
    const apiKey = map.cloudinaryApiKey || process.env.CLOUDINARY_API_KEY
    const apiSecret = map.cloudinaryApiSecret || process.env.CLOUDINARY_API_SECRET

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json({ error: "إعدادات Cloudinary غير مضبوطة" }, { status: 400 })
    }

    cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret })

    const formData = await request.formData()
    const file = formData.get("file") as File
    const type = formData.get("type") as string || "images"

    if (!file) {
      return NextResponse.json({ error: "الملف مطلوب" }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const result = await cloudinary.uploader.upload(
      `data:${file.type};base64,${buffer.toString("base64")}`,
      { folder: `novel-store/${type}`, resource_type: "auto" },
    )

    return NextResponse.json({
      url: result.secure_url,
      filename: result.public_id,
    })
  } catch (err) {
    console.error("Upload error:", err)
    return NextResponse.json({ error: err instanceof Error ? err.message : "فشل رفع الملف" }, { status: 500 })
  }
}
