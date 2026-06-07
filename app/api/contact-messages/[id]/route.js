import prisma from '@/lib/prisma'
import { getToken } from 'next-auth/jwt'

export async function DELETE(req, { params }) {
  try {
    const { id } = await params
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET })
    if (!token || token.role !== 'ADMIN') {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'content-type': 'application/json' } })
    }
    if (!id) {
      return new Response(JSON.stringify({ error: 'Message id is required' }), { status: 400, headers: { 'content-type': 'application/json' } })
    }

    await prisma.contactMessage.delete({ where: { id } })
    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'content-type': 'application/json' } })
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to delete message' }), { status: 500, headers: { 'content-type': 'application/json' } })
  }
}
