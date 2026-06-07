import prisma from '@/lib/prisma'
import { getToken } from 'next-auth/jwt'

export async function GET(req) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET })
    if (!token || token.role !== 'ADMIN') return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'content-type': 'application/json' } })
    const url = new URL(req.url)
    const showDeleted = url.searchParams.get('deleted') === 'true'
    const include = { orderItems: { include: { product: true } }, address: true, user: true }
    let where = showDeleted ? { isDeleted: true } : { OR: [{ isDeleted: false }, { isDeleted: null }] }
    let orders
    try {
      orders = await prisma.order.findMany({ where, include, orderBy: { createdAt: 'desc' } })
    } catch (err) {
      if (/isDeleted/i.test(err.message)) {
        orders = await prisma.order.findMany({ include, orderBy: { createdAt: 'desc' } })
      } else {
        throw err
      }
    }
    return new Response(JSON.stringify({ orders }), { status: 200, headers: { 'content-type': 'application/json' } })
  } catch (err) {
    console.error('GET /api/orders/all error:', err)
    return new Response(JSON.stringify({ error: 'Failed to fetch all orders', details: err?.message }), { status: 500, headers: { 'content-type': 'application/json' } })
  }
}
