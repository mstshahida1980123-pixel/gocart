import Stripe from 'stripe'
import prisma from '@/lib/prisma'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export async function POST(req) {
  const sig = req.headers.get('stripe-signature')
  const body = await req.text()
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  let event
  try {
    if (webhookSecret) {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
    } else {
      event = JSON.parse(body)
    }
  } catch (err) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 })
  }

  if (event.type === 'payment_intent.succeeded') {
    const pi = event.data.object
    const orderId = pi.metadata?.orderId
    if (orderId) {
      try {
        await prisma.order.update({ where: { id: orderId }, data: { isPaid: true } })
      } catch (err) {
        // log but don't fail webhook
      }
    }
  }

  return new Response(JSON.stringify({ received: true }), { status: 200, headers: { 'content-type': 'application/json' } })
}
