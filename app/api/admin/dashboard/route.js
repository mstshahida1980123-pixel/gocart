import prisma from '@/lib/prisma'
import { getToken } from 'next-auth/jwt'

export async function GET(req) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    if (!token || token.role !== 'ADMIN') return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'content-type': 'application/json' } })

    const [products, orders, revenueAgg, ratingsAvg, allOrders] = await Promise.all([
      prisma.product.count(),
      prisma.order.count(),
      prisma.order.aggregate({ _sum: { total: true } }),
      prisma.rating.aggregate({ _avg: { rating: true } }),
      prisma.order.findMany({ select: { createdAt: true } }),
    ])

    return new Response(JSON.stringify({ products, orders, revenue: revenueAgg._sum.total || 0, avgRating: ratingsAvg._avg.rating || 0, allOrders }), { status: 200, headers: { 'content-type': 'application/json' } })
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to load dashboard' }), { status: 500, headers: { 'content-type': 'application/json' } })
  }
}
