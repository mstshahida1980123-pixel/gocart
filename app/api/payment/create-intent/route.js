import Stripe from 'stripe'
import prisma from '@/lib/prisma'

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null

export async function POST(req) {
  if (!stripe) {
    return new Response(JSON.stringify({ error: 'Stripe not configured' }), { status: 503, headers: { 'content-type': 'application/json' } })
  }
  try {
    const body = await req.json()
    const { amount, currency = 'usd', orderId } = body
    if (!amount) return new Response(JSON.stringify({ error: 'Missing amount' }), { status: 400, headers: { 'content-type': 'application/json' } })

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(parseFloat(amount) * 100),
      currency,
      metadata: { orderId: orderId || '' },
    })

    return new Response(JSON.stringify({ clientSecret: paymentIntent.client_secret }), { status: 200, headers: { 'content-type': 'application/json' } })
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to create payment intent', details: String(err) }), { status: 500, headers: { 'content-type': 'application/json' } })
  }
}
