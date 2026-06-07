import prisma from '@/lib/prisma'
import { getToken } from 'next-auth/jwt'

export async function GET(req) {
  try {
    const url = new URL(req.url)
    const search = url.searchParams.get('search') || undefined
    const category = url.searchParams.get('category') || undefined
    const featured = url.searchParams.get('featured')
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '12')
    const skip = (page - 1) * limit

    const and = []
    if (search) {
      and.push({ OR: [{ name: { contains: search } }, { description: { contains: search } }] })
    }
    if (category) {
      const categoryRecord = await prisma.category.findUnique({ where: { slug: category } })
      if (categoryRecord) {
        and.push({ OR: [
          { categoryId: categoryRecord.id },
          { category: categoryRecord.name },
          { category },
        ] })
      } else {
        and.push({ category })
      }
    }
    if (featured === 'true') {
      and.push({ featured: true })
    }
    const where = and.length ? { AND: and } : {}

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { ratings: true }
      }),
      prisma.product.count({ where }),
    ])

    // parse images JSON string to array for client
    const parsed = products.map(p => ({ ...p, images: p.images ? JSON.parse(p.images) : [] }))
    return new Response(JSON.stringify({ products: parsed, total }), { status: 200, headers: { 'content-type': 'application/json' } })
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to fetch products' }), { status: 500, headers: { 'content-type': 'application/json' } })
  }
}

export async function POST(req) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET })
    if (!token || token.role !== 'ADMIN') {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'content-type': 'application/json' } })
    }

    const body = await req.json()
    const { name, description, mrp, price, images, category, categoryId, inStock = true, featured = false, latest = false, bestSelling = false } = body
    if (!name || !description || !price) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400, headers: { 'content-type': 'application/json' } })
    }

    let categoryName = category || ''
    if (categoryId) {
      const categoryRecord = await prisma.category.findUnique({ where: { id: categoryId } })
      if (categoryRecord) categoryName = categoryRecord.name
    }

    const product = await prisma.product.create({ data: {
      name,
      description,
      mrp: parseFloat(mrp || price),
      price: parseFloat(price),
      images: JSON.stringify(images || []),
      category: categoryName,
      categoryId: categoryId || null,
      inStock,
      featured,
      latest,
      bestSelling,
    } })

    return new Response(JSON.stringify(product), { status: 201, headers: { 'content-type': 'application/json' } })
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to create product' }), { status: 500, headers: { 'content-type': 'application/json' } })
  }
}
