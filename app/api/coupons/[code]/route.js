import prisma from '@/lib/prisma'
import { getToken } from 'next-auth/jwt'

export async function DELETE(req, { params }) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET })
    if (!token || token.role !== 'ADMIN') return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'content-type': 'application/json' } })
    const { code } = await params
    await prisma.coupon.delete({ where: { code } })
    return new Response(null, { status: 204 })
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to delete coupon' }), { status: 500, headers: { 'content-type': 'application/json' } })
  }
}
