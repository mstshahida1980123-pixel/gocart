import prisma from '@/lib/prisma'
import { getToken } from 'next-auth/jwt'

export async function DELETE(req, { params }) {
  try {
    const { id } = await params
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    if (!token || token.role !== 'ADMIN') return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'content-type': 'application/json' } })
    const deleted = await prisma.order.delete({ where: { id } })
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'content-type': 'application/json' } })
  } catch (err) {
    console.error('DELETE /api/orders/[id]/destroy error:', err)
    return new Response(JSON.stringify({ error: 'Failed to permanently delete order', details: err?.message }), { status: 500, headers: { 'content-type': 'application/json' } })
  }
}
