import prisma from '@/lib/prisma'
import { getToken } from 'next-auth/jwt'

function getUserIdFromToken(token) {
  return token?.sub || token?.id || token?.user?.id
}

export async function GET(req, { params }) {
  try {
    const { id } = await params
    if (!id) {
      return new Response(JSON.stringify({ error: 'Order ID is required' }), { status: 400, headers: { 'content-type': 'application/json' } })
    }

    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET })
    
    // Fetch the order
    let order
    try {
      order = await prisma.order.findUnique({
        where: { id },
        include: {
          orderItems: { include: { product: true } },
          address: true,
          user: true,
        },
      })
    } catch (err) {
      // Handle schema migration errors
      if (/isDeleted/i.test(err.message)) {
        order = await prisma.order.findUnique({
          where: { id },
          include: {
            orderItems: { include: { product: true } },
            address: true,
            user: true,
          },
        })
      } else {
        throw err
      }
    }

    if (!order) {
      return new Response(JSON.stringify({ error: 'Order not found' }), { status: 404, headers: { 'content-type': 'application/json' } })
    }

    // Check authorization: must be admin or order owner
    if (token) {
      const userId = getUserIdFromToken(token)
      const isAdmin = token.role === 'ADMIN'
      const isOwner = order.userId === userId
      
      if (!isAdmin && !isOwner) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 403, headers: { 'content-type': 'application/json' } })
      }
    } else {
      // Guests cannot view orders
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'content-type': 'application/json' } })
    }

    // Check if order is deleted
    if (order.isDeleted) {
      return new Response(JSON.stringify({ error: 'Order not found' }), { status: 404, headers: { 'content-type': 'application/json' } })
    }

    return new Response(JSON.stringify(order), { status: 200, headers: { 'content-type': 'application/json' } })
  } catch (err) {
    console.error('GET /api/orders/[id] error:', err)
    return new Response(JSON.stringify({ error: 'Failed to fetch order', details: err?.message }), { status: 500, headers: { 'content-type': 'application/json' } })
  }
}
