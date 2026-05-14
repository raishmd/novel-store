import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function PUT(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 })
  }

  try {
    const { items } = await request.json()

    for (let i = 0; i < items.length; i++) {
      await prisma.novel.update({
        where: { id: items[i] },
        data: { sortOrder: i },
      })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "فشل إعادة الترتيب" }, { status: 500 })
  }
}
