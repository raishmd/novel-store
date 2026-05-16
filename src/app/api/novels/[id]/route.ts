import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const novel = await prisma.novel.findUnique({ where: { id } })
  if (!novel) {
    return NextResponse.json({ error: "الرواية غير موجودة" }, { status: 404 })
  }
  return NextResponse.json(novel)
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 })
  }

  const { id } = await params
  try {
    const data = await request.json()
    const novel = await prisma.novel.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        price: data.price ? parseFloat(data.price) : undefined,
        coverImage: data.coverImage,
        fileUrl: data.fileUrl,
        published: data.published,
      },
    })
    revalidatePath("/")
    revalidatePath("/api/novels")
    return NextResponse.json(novel)
  } catch {
    return NextResponse.json({ error: "فشل تحديث الرواية" }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 })
  }

  const { id } = await params
  try {
    await prisma.novel.delete({ where: { id } })
    revalidatePath("/")
    revalidatePath("/api/novels")
    return NextResponse.json({ message: "تم الحذف بنجاح" })
  } catch {
    return NextResponse.json({ error: "فشل حذف الرواية" }, { status: 500 })
  }
}
