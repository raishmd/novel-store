import { getToken } from "next-auth/jwt"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export default async function middleware(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
    secureCookie: req.nextUrl.protocol === "https:",
  })
  if (!token) {
    const url = new URL("/login", req.url)
    return NextResponse.redirect(url)
  }
}

export const config = {
  matcher: ["/dashboard/:path*"],
}
