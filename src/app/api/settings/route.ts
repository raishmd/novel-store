import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET() {
  const settings = await prisma.setting.findMany()
  const map: Record<string, string> = {}
  for (const s of settings) map[s.key] = s.value
  return NextResponse.json(map)
}

export async function PUT(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 })
  }

  const body = await request.json()

  for (const [key, value] of Object.entries(body)) {
    if (typeof value === "string") {
      await prisma.setting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      })
    }
  }

  return NextResponse.json({ success: true })
}
