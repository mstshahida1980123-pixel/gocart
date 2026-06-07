import prisma from '@/lib/prisma'
import { getToken } from 'next-auth/jwt'

export async function GET(req, { params }) {
  try {
    const { id } = await params
    const category = await prisma.category.findUnique({ where: { id } })
    if (!category) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers: { 'content-type': 'application/json' } })
    return new Response(JSON.stringify(category), { status: 200, headers: { 'content-type': 'application/json' } })
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to fetch category' }), { status: 500, headers: { 'content-type': 'application/json' } })
  }
}

export async function PUT(req, { params }) {
  try {
    const { id } = await params
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET })
    if (!token || token.role !== 'ADMIN') {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'content-type': 'application/json' } })
    }
    const body = await req.json()
    const data = {
      name: body.name?.trim(),
      slug: body.slug?.trim().toLowerCase().replace(/\s+/g, '-'),
      description: body.description || '',
      image: body.image || '',
    }
    if (!data.name || !data.slug) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400, headers: { 'content-type': 'application/json' } })
    }

    // prevent duplicate slug (exclude current record)
    const dup = await prisma.category.findFirst({ where: { slug: data.slug, id: { not: id } } })
    if (dup) {
      return new Response(JSON.stringify({ error: 'Slug already exists' }), { status: 409, headers: { 'content-type': 'application/json' } })
    }

    const updated = await prisma.category.update({ where: { id }, data })
    return new Response(JSON.stringify(updated), { status: 200, headers: { 'content-type': 'application/json' } })
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to update category' }), { status: 500, headers: { 'content-type': 'application/json' } })
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = await params
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET })
    if (!token || token.role !== 'ADMIN') {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'content-type': 'application/json' } })
    }
    await prisma.category.delete({ where: { id } })
    return new Response(null, { status: 204 })
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to delete category' }), { status: 500, headers: { 'content-type': 'application/json' } })
  }
}
