import prisma from '@/lib/prisma'
import { getToken } from 'next-auth/jwt'

export async function GET(req) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    if (!token) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'content-type': 'application/json' } })
    const userId = token?.sub || token?.id || token?.user?.id
    const user = await prisma.user.findUnique({ where: { id: userId } })
    return new Response(JSON.stringify({ cart: user?.cart || {} }), { status: 200, headers: { 'content-type': 'application/json' } })
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to load cart' }), { status: 500, headers: { 'content-type': 'application/json' } })
  }
}
