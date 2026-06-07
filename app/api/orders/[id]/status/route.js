import prisma from '@/lib/prisma'
import { getToken } from 'next-auth/jwt'

export async function PUT(req, { params }) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET })
    if (!token || token.role !== 'ADMIN') return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'content-type': 'application/json' } })
    const { id } = await params
    const { status } = await req.json()
    if (!status) return new Response(JSON.stringify({ error: 'Missing status' }), { status: 400, headers: { 'content-type': 'application/json' } })
    const updated = await prisma.order.update({ where: { id }, data: { status } })
    return new Response(JSON.stringify(updated), { status: 200, headers: { 'content-type': 'application/json' } })
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to update order status' }), { status: 500, headers: { 'content-type': 'application/json' } })
  }
}
