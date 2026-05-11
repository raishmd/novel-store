import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 })
  }

  const orders = await prisma.order.findMany({
    include: { novel: true },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(orders)
}
