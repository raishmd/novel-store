import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 })
  }

  const [messages, orders] = await Promise.all([
    prisma.contactMessage.count({ where: { read: false } }),
    prisma.order.count({ where: { status: "pending" } }),
  ])

  return NextResponse.json({ messages, orders })
}
