import prisma from '@/lib/prisma'
import { getToken } from 'next-auth/jwt'

export async function POST(req) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET })
    if (!token) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'content-type': 'application/json' } })
    const userId = token?.sub || token?.id || token?.user?.id
    const cart = await req.json()
    await prisma.user.update({ where: { id: userId }, data: { cart } })
    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'content-type': 'application/json' } })
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to sync cart' }), { status: 500, headers: { 'content-type': 'application/json' } })
  }
}
