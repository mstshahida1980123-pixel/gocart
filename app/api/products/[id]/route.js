import prisma from '@/lib/prisma'
import { getToken } from 'next-auth/jwt'

export async function GET(req, { params }) {
  try {
    const { id } = await params
    const product = await prisma.product.findUnique({ 
      where: { id },
      include: { ratings: true }
    })
    if (!product) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers: { 'content-type': 'application/json' } })
    const parsed = { ...product, images: product.images ? JSON.parse(product.images) : [] }
    return new Response(JSON.stringify(parsed), { status: 200, headers: { 'content-type': 'application/json' } })
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to fetch product' }), { status: 500, headers: { 'content-type': 'application/json' } })
  }
}

export async function PUT(req, { params }) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    if (!token || token.role !== 'ADMIN') return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'content-type': 'application/json' } })

    const { id } = await params
    const body = await req.json()

    // Strip readonly / relational fields that Prisma cannot accept in update data
    const { id: _id, createdAt, updatedAt, ratings, orderItems, categoryRef, ...rest } = body

    // Serialize images array to JSON string for SQLite storage
    if (Array.isArray(rest.images)) rest.images = JSON.stringify(rest.images)

    // Ensure numeric types
    if (rest.price != null) rest.price = parseFloat(rest.price)
    if (rest.mrp != null) rest.mrp = parseFloat(rest.mrp)

    let updateData = { ...rest }

    // Resolve category name from categoryId if provided
    if (rest.categoryId) {
      const categoryRecord = await prisma.category.findUnique({ where: { id: rest.categoryId } })
      if (categoryRecord) updateData.category = categoryRecord.name
    } else if (rest.categoryId === '') {
      updateData.categoryId = null
    }

    // Ensure booleans are set explicitly if provided
    if (typeof rest.latest !== 'undefined') updateData.latest = Boolean(rest.latest)
    if (typeof rest.bestSelling !== 'undefined') updateData.bestSelling = Boolean(rest.bestSelling)
    if (typeof rest.inStock !== 'undefined') updateData.inStock = Boolean(rest.inStock)
    if (typeof rest.featured !== 'undefined') updateData.featured = Boolean(rest.featured)

    const updated = await prisma.product.update({ where: { id }, data: updateData })
    return new Response(JSON.stringify(updated), { status: 200, headers: { 'content-type': 'application/json' } })
  } catch (err) {
    console.error('PUT /api/products/[id] error:', err)
    return new Response(JSON.stringify({ error: 'Failed to update product', details: String(err) }), { status: 500, headers: { 'content-type': 'application/json' } })
  }
}

export async function DELETE(req, { params }) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    if (!token || token.role !== 'ADMIN') return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'content-type': 'application/json' } })

    const { id } = await params
    await prisma.product.delete({ where: { id } })
    return new Response(null, { status: 204 })
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to delete product' }), { status: 500, headers: { 'content-type': 'application/json' } })
  }
}
