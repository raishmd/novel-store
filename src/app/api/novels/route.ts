import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET() {
  const novels = await prisma.novel.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json(novels)
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 })
  }

  try {
    const data = await request.json()
    const novel = await prisma.novel.create({
      data: {
        title: data.title,
        description: data.description,
        price: parseFloat(data.price),
        coverImage: data.coverImage,
        fileUrl: data.fileUrl,
        published: data.published ?? true,
      },
    })
    return NextResponse.json(novel, { status: 201 })
  } catch {
    return NextResponse.json({ error: "فشل إنشاء الرواية" }, { status: 500 })
  }
}
