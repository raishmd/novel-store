import { NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import { auth } from "@/lib/auth"

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const type = formData.get("type") as string || "images"

    if (!file) {
      return NextResponse.json({ error: "الملف مطلوب" }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const uploadsDir = path.join(process.cwd(), "public", "uploads", type)
    await mkdir(uploadsDir, { recursive: true })

    const ext = file.name.split(".").pop()
    const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`
    const filePath = path.join(uploadsDir, filename)

    await writeFile(filePath, buffer)

    return NextResponse.json({
      url: `/uploads/${type}/${filename}`,
      filename,
    })
  } catch {
    return NextResponse.json({ error: "فشل رفع الملف" }, { status: 500 })
  }
}
