import prisma from '@/lib/prisma'

export async function POST(req) {
  try {
    const { code } = await req.json()
    if (!code) return new Response(JSON.stringify({ valid: false, reason: 'No code provided' }), { status: 400, headers: { 'content-type': 'application/json' } })
    const coupon = await prisma.coupon.findUnique({ where: { code } })
    if (!coupon) return new Response(JSON.stringify({ valid: false, reason: 'Invalid code' }), { status: 200, headers: { 'content-type': 'application/json' } })
    if (new Date() > coupon.expiresAt) return new Response(JSON.stringify({ valid: false, reason: 'Expired' }), { status: 200, headers: { 'content-type': 'application/json' } })
    return new Response(JSON.stringify({ valid: true, coupon }), { status: 200, headers: { 'content-type': 'application/json' } })
  } catch (err) {
    return new Response(JSON.stringify({ valid: false, reason: 'Server error' }), { status: 500, headers: { 'content-type': 'application/json' } })
  }
}
