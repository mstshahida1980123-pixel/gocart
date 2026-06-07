import prisma from '@/lib/prisma'
import { getToken } from 'next-auth/jwt'

export const dynamic = 'force-dynamic'

export async function GET(req) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET })
    if (!token || token.role !== 'ADMIN') {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'content-type': 'application/json' },
      })
    }

    const reviews = await prisma.rating.findMany({
      include: {
        product: { select: { name: true } },
        user: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return new Response(JSON.stringify({ reviews }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    })
  } catch (err) {
    console.error('GET /api/admin/reviews error:', err)
    return new Response(JSON.stringify({ error: 'Failed to fetch reviews' }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    })
  }
}

export async function DELETE(req) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET })
    if (!token || token.role !== 'ADMIN') {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'content-type': 'application/json' },
      })
    }

    const url = new URL(req.url)
    const id = url.searchParams.get('id')

    if (!id) {
      return new Response(JSON.stringify({ error: 'Missing rating ID' }), {
        status: 400,
        headers: { 'content-type': 'application/json' },
      })
    }

    await prisma.rating.delete({
      where: { id },
    })

    return new Response(JSON.stringify({ success: true, message: 'Review deleted successfully' }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    })
  } catch (err) {
    console.error('DELETE /api/admin/reviews error:', err)
    return new Response(JSON.stringify({ error: 'Failed to delete review' }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    })
  }
}
