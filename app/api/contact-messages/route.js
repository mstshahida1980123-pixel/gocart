import prisma from '@/lib/prisma'
import { getToken } from 'next-auth/jwt'

export async function GET(req) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET })
    if (!token || token.role !== 'ADMIN') {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'content-type': 'application/json' } })
    }

    const messages = await prisma.contactMessage.findMany({ orderBy: { createdAt: 'desc' } })
    return new Response(JSON.stringify({ messages }), { status: 200, headers: { 'content-type': 'application/json' } })
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to fetch messages' }), { status: 500, headers: { 'content-type': 'application/json' } })
  }
}

export async function POST(req) {
  try {
    const body = await req.json()
    const { name, email, message } = body
    if (!name || !email || !message) {
      return new Response(JSON.stringify({ error: 'Name, email, and message are required' }), { status: 400, headers: { 'content-type': 'application/json' } })
    }

    const contactMessage = await prisma.contactMessage.create({ data: { name, email, message } })
    return new Response(JSON.stringify(contactMessage), { status: 201, headers: { 'content-type': 'application/json' } })
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to submit message' }), { status: 500, headers: { 'content-type': 'application/json' } })
  }
}
