import Stripe from "stripe"

function createStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-02-24",
    typescript: true,
  })
}

let _stripe: Stripe | null = null
export function getStripe() {
  if (!_stripe) _stripe = createStripe()
  return _stripe
}

export const stripe = new Proxy({} as Stripe, {
  get(_, prop) {
    return getStripe()[prop as keyof Stripe]
  },
})

export function getStripePublishableKey() {
  return process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
}
