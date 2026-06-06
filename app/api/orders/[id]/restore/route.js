import prisma from '@/lib/prisma'
import { getToken } from 'next-auth/jwt'

export async function PUT(req, { params }) {
  try {
    const { id } = await params
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    if (!token || token.role !== 'ADMIN') return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'content-type': 'application/json' } })
    const updated = await prisma.order.update({ where: { id }, data: { isDeleted: false } })
    return new Response(JSON.stringify(updated), { status: 200, headers: { 'content-type': 'application/json' } })
  } catch (err) {
    console.error('PUT /api/orders/[id]/restore error:', err)
    return new Response(JSON.stringify({ error: 'Failed to restore order', details: err?.message }), { status: 500, headers: { 'content-type': 'application/json' } })
  }
}
