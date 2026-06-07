import prisma from '@/lib/prisma'
import { getToken } from 'next-auth/jwt'
import { getCombinedRatings } from '@/lib/demoReviews'

export const dynamic = 'force-dynamic'

function getUserIdFromToken(token) {
  return token?.sub || token?.id || token?.user?.id
}

export async function GET(req) {
  try {
    const url = new URL(req.url)
    const productId = url.searchParams.get('productId')
    
    if (!productId) {
      return new Response(JSON.stringify({ error: 'Missing productId' }), {
        status: 400,
        headers: { 'content-type': 'application/json' },
      })
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { ratings: { include: { user: { select: { name: true } } }, orderBy: { createdAt: 'desc' } } },
    })

    if (!product) {
      return new Response(JSON.stringify({ error: 'Product not found' }), {
        status: 404,
        headers: { 'content-type': 'application/json' },
      })
    }

    const ratings = product.ratings || []
    const combined = getCombinedRatings(productId, product.name, ratings)
    const averageRating = combined.averageRating
    const reviewCount = combined.reviewCount
    const allReviews = combined.reviews

    let canRate = false
    let userRating = null
    let orderId = null

    let token = null
    try {
      token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET })
    } catch (authErr) {
      console.warn('GET /api/ratings getToken failed:', authErr?.message || authErr)
    }

    if (token) {
      try {
        const userId = getUserIdFromToken(token)

        if (userId) {
          const orders = await prisma.order.findMany({
            where: {
              userId,
              OR: [{ isDeleted: false }, { isDeleted: null }],
              orderItems: { some: { productId } },
            },
            orderBy: { createdAt: 'desc' },
            select: { id: true },
          })

          for (const order of orders) {
            const existingRating = await prisma.rating.findFirst({
              where: {
                userId,
                productId,
                orderId: order.id,
              },
            })

            if (!existingRating) {
              canRate = true
              orderId = order.id
              break
            }

            userRating = existingRating.rating
          }
        }
      } catch (userErr) {
        console.error('GET /api/ratings user lookup failed:', userErr)
      }
    }

    return new Response(
      JSON.stringify({ averageRating, reviewCount, canRate, userRating, orderId, reviews: allReviews }),
      { status: 200, headers: { 'content-type': 'application/json' } }
    )
  } catch (err) {
    console.error('GET /api/ratings error:', err)
    return new Response(JSON.stringify({ error: 'Failed to fetch ratings' }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    })
  }
}

export async function POST(req) {
  try {
    const body = await req.json()
    const { productId, rating, review = '', name, orderId } = body

    if (!productId || !rating || rating < 1 || rating > 5) {
      return new Response(JSON.stringify({ error: 'Invalid request' }), {
        status: 400,
        headers: { 'content-type': 'application/json' },
      })
    }

    let userId = null
    try {
      const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET })
      if (token) {
        userId = getUserIdFromToken(token)
      }
    } catch (authErr) {
      console.warn('POST /api/ratings getToken failed:', authErr?.message || authErr)
    }

    // Public / guest review form submission (when name is provided)
    if (name) {
      await prisma.rating.create({
        data: {
          productId,
          rating: parseInt(rating),
          review,
          name,
          userId: userId || null,
          orderId: orderId || null,
        }
      })

      const ratings = await prisma.rating.findMany({
        where: { productId },
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: 'desc' }
      })
      const product = await prisma.product.findUnique({ where: { id: productId }, select: { name: true } })
      const combined = getCombinedRatings(productId, product?.name || '', ratings)

      return new Response(
        JSON.stringify({
          averageRating: combined.averageRating,
          reviewCount: combined.reviewCount,
          reviews: combined.reviews,
          success: true
        }),
        { status: 200, headers: { 'content-type': 'application/json' } }
      )
    }

    // Order-restricted rating submission (old flow)
    if (!orderId) {
      return new Response(JSON.stringify({ error: 'Missing orderId' }), {
        status: 400,
        headers: { 'content-type': 'application/json' },
      })
    }

    if (!userId) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'content-type': 'application/json' },
      })
    }

    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId,
        OR: [{ isDeleted: false }, { isDeleted: null }],
        orderItems: { some: { productId } },
      },
    })

    if (!order) {
      return new Response(JSON.stringify({ error: 'Order not found' }), {
        status: 404,
        headers: { 'content-type': 'application/json' },
      })
    }

    const existingRating = await prisma.rating.findFirst({
      where: {
        userId,
        productId,
        orderId,
      },
    })

    if (existingRating) {
      await prisma.rating.update({
        where: { id: existingRating.id },
        data: {
          rating: parseInt(rating),
          review,
        },
      })
    } else {
      await prisma.rating.create({
        data: {
          userId,
          productId,
          orderId,
          rating: parseInt(rating),
          review,
        },
      })
    }

    const ratings = await prisma.rating.findMany({
      where: { productId },
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: 'desc' }
    })
    const product = await prisma.product.findUnique({ where: { id: productId }, select: { name: true } })
    const combined = getCombinedRatings(productId, product?.name || '', ratings)

    return new Response(
      JSON.stringify({
        averageRating: combined.averageRating,
        reviewCount: combined.reviewCount,
        canRate: false,
        userRating: rating,
        reviews: combined.reviews,
      }),
      { status: 200, headers: { 'content-type': 'application/json' } }
    )
  } catch (err) {
    console.error('POST /api/ratings error:', err)
    return new Response(JSON.stringify({ error: 'Failed to save rating' }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    })
  }
}
