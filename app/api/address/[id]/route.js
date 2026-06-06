import prisma from '@/lib/prisma'
import { getToken } from 'next-auth/jwt'

export async function DELETE(req, { params }) {
  try {
    // allow deleting address by owner; if no token, allow deletion (guest-created address)
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    const userId = token ? (token.sub || token.id || token.user?.id) : undefined
    const { id } = await params
    const addr = await prisma.address.findUnique({ where: { id } })
    if (!addr) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers: { 'content-type': 'application/json' } })
    if (addr.userId && userId && addr.userId !== userId) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers: { 'content-type': 'application/json' } })
    await prisma.address.delete({ where: { id } })
    return new Response(null, { status: 204 })
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to delete address' }), { status: 500, headers: { 'content-type': 'application/json' } })
  }
}
