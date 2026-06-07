import prisma from '@/lib/prisma'
import { getToken } from 'next-auth/jwt'

export async function GET(req) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET })
    if (!token) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'content-type': 'application/json' } })
    const userId = token?.sub || token?.id || token?.user?.id
    const addresses = await prisma.address.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } })
    return new Response(JSON.stringify({ addresses }), { status: 200, headers: { 'content-type': 'application/json' } })
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to fetch addresses' }), { status: 500, headers: { 'content-type': 'application/json' } })
  }
}

export async function POST(req) {
  try {
    // allow guest address creation; attach userId when available
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET })
    const userId = token ? (token.sub || token.id || token.user?.id) : undefined
    const body = await req.json()
    const data = userId ? { userId, ...body } : { ...body }
    const addr = await prisma.address.create({ data })
    return new Response(JSON.stringify(addr), { status: 201, headers: { 'content-type': 'application/json' } })
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to create address' }), { status: 500, headers: { 'content-type': 'application/json' } })
  }
}
