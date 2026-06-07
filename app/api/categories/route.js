import prisma from '@/lib/prisma'
import { getToken } from 'next-auth/jwt'

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { products: true } } },
    })
    return new Response(JSON.stringify(categories), { status: 200, headers: { 'content-type': 'application/json' } })
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to fetch categories' }), { status: 500, headers: { 'content-type': 'application/json' } })
  }
}

export async function POST(req) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET })
    if (!token || token.role !== 'ADMIN') {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'content-type': 'application/json' } })
    }

    const body = await req.json()
    const name = body.name?.trim()
    const slug = body.slug?.trim().toLowerCase().replace(/\s+/g, '-') || name?.toLowerCase().replace(/\s+/g, '-')

    if (!name || !slug) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400, headers: { 'content-type': 'application/json' } })
    }

    // prevent duplicate slug
    const existing = await prisma.category.findUnique({ where: { slug } })
    if (existing) {
      return new Response(JSON.stringify({ error: 'Slug already exists' }), { status: 409, headers: { 'content-type': 'application/json' } })
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description: body.description || '',
        image: body.image || '',
      },
    })

    return new Response(JSON.stringify(category), { status: 201, headers: { 'content-type': 'application/json' } })
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to create category' }), { status: 500, headers: { 'content-type': 'application/json' } })
  }
}
