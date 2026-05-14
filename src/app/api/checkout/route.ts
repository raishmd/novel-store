import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const { novelId, email } = await request.json()

    if (!novelId || !email) {
      return NextResponse.json({ error: "بيانات غير كاملة" }, { status: 400 })
    }

    const novel = await prisma.novel.findUnique({ where: { id: novelId } })
    if (!novel) {
      return NextResponse.json({ error: "الرواية غير موجودة" }, { status: 404 })
    }

    const origin = request.headers.get("origin") || "http://localhost:3000"

    const coverImage = novel.coverImage.startsWith("http")
      ? novel.coverImage
      : `${origin}${novel.coverImage}`

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: novel.title,
              description: novel.description.substring(0, 100),
              images: [coverImage],
            },
            unit_amount: Math.round(novel.price * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}&novel_id=${novelId}`,
      cancel_url: `${origin}/novels/${novelId}`,
      customer_email: email,
      metadata: {
        novelId,
        email,
      },
    })

    const order = await prisma.order.create({
      data: {
        novelId,
        email,
        amount: novel.price,
        status: "pending",
        stripeSessionId: session.id,
      },
    })

    return NextResponse.json({ url: session.url, orderId: order.id })
  } catch (error) {
    console.error("Stripe checkout error:", error)
    return NextResponse.json({ error: "فشل إنشاء جلسة الدفع" }, { status: 500 })
  }
}
