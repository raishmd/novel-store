import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const all = searchParams.get("all") === "true"

    const novels = await prisma.novel.findMany({
      where: all ? {} : { published: true },
      orderBy: { sortOrder: "asc" },
    })
    return NextResponse.json(novels, {
      headers: { "Cache-Control": "no-store, must-revalidate" },
    })
  } catch {
    return NextResponse.json([])
  }
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
    revalidatePath("/")
    revalidatePath("/api/novels")
    return NextResponse.json(novel, { status: 201 })
  } catch {
    return NextResponse.json({ error: "فشل إنشاء الرواية" }, { status: 500 })
  }
}
