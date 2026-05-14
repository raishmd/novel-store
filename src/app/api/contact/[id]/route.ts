import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 })
  }

  const { id } = await params
  const message = await prisma.contactMessage.findUnique({ where: { id } })
  if (!message) {
    return NextResponse.json({ error: "الرسالة غير موجودة" }, { status: 404 })
  }

  return NextResponse.json(message)
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 })
  }

  const { id } = await params
  const body = await request.json()

  const message = await prisma.contactMessage.update({
    where: { id },
    data: { read: body.read },
  })

  return NextResponse.json(message)
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
  await prisma.contactMessage.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
