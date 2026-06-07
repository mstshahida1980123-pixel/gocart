import prisma from '@/lib/prisma'
import { getToken } from 'next-auth/jwt'

function getUserIdFromToken(token) {
  return token?.sub || token?.id || token?.user?.id
}

export async function GET(req) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET })
    // allow guests: return empty list if not authenticated
    if (!token) return new Response(JSON.stringify({ orders: [] }), { status: 200, headers: { 'content-type': 'application/json' } })
    const userId = getUserIdFromToken(token)
    if (!userId) {
      console.warn('Could not extract userId from token')
      return new Response(JSON.stringify({ orders: [] }), { status: 200, headers: { 'content-type': 'application/json' } })
    }
    const include = { orderItems: { include: { product: true } }, address: true }
    let orders
    try {
      orders = await prisma.order.findMany({ where: { userId, OR: [{ isDeleted: false }, { isDeleted: null }] }, include })
    } catch (err) {
      if (/isDeleted/i.test(err.message)) {
        orders = await prisma.order.findMany({ where: { userId }, include })
      } else {
        throw err
      }
    }
    return new Response(JSON.stringify({ orders }), { status: 200, headers: { 'content-type': 'application/json' } })
  } catch (err) {
    console.error('GET /api/orders error:', err)
    return new Response(JSON.stringify({ error: 'Failed to fetch orders', details: err?.message }), { status: 500, headers: { 'content-type': 'application/json' } })
  }
}

export async function POST(req) {
  try {
    // allow guest checkout: token optional
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET })
    const userId = token ? getUserIdFromToken(token) : undefined
    const body = await req.json()
    const { addressId, items, paymentMethod, coupon, deliveryCharge, transactionId } = body
    if (!addressId) return new Response(JSON.stringify({ error: 'Missing addressId' }), { status: 400, headers: { 'content-type': 'application/json' } })
    if (!items || !Array.isArray(items) || items.length === 0) return new Response(JSON.stringify({ error: 'Cart is empty' }), { status: 400, headers: { 'content-type': 'application/json' } })

    // compute total and verify products
    let subtotal = 0
    const orderItemsData = []
    // verify address exists to avoid foreign key errors
    const addrExists = await prisma.address.findUnique({ where: { id: addressId } })
    if (!addrExists) return new Response(JSON.stringify({ error: `Address not found: ${addressId}` }), { status: 400, headers: { 'content-type': 'application/json' } })
    const productIds = items.map(it => it.productId)
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } }
    })
    const productMap = new Map(products.map(p => [p.id, p]))

    for (const it of items) {
      const product = productMap.get(it.productId)
      if (!product) return new Response(JSON.stringify({ error: `Product not found: ${it.productId}` }), { status: 400, headers: { 'content-type': 'application/json' } })
      const price = parseFloat(product.price)
      const quantity = parseInt(it.quantity)
      if (!Number.isFinite(quantity) || quantity <= 0) return new Response(JSON.stringify({ error: `Invalid quantity for product: ${it.productId}` }), { status: 400, headers: { 'content-type': 'application/json' } })
      subtotal += price * quantity
      orderItemsData.push({ productId: it.productId, quantity, price })
    }

    // add delivery charge to total
    const parsedDeliveryCharge = Number.isFinite(parseFloat(deliveryCharge)) ? parseFloat(deliveryCharge) : 0
    const total = subtotal + parsedDeliveryCharge

    // store coupon + transactionId + delivery info in coupon JSON field
    const couponData = coupon ? { ...coupon } : {}
    if (transactionId) couponData.transactionId = transactionId
    if (parsedDeliveryCharge > 0) couponData.deliveryCharge = parsedDeliveryCharge

    const order = await prisma.order.create({
      data: {
        total,
        userId: userId || undefined,
        addressId,
        paymentMethod,
        coupon: JSON.stringify(couponData),
        isCouponUsed: !!coupon,
        orderItems: { create: orderItemsData },
      },
      include: { orderItems: true }
    })

    return new Response(JSON.stringify(order), { status: 201, headers: { 'content-type': 'application/json' } })
  } catch (err) {
    // log and surface the real error message to help debugging
    console.error('POST /api/orders error:', err)
    const message = err && err.message ? err.message : 'Failed to create order'
    return new Response(JSON.stringify({ error: message }), { status: 500, headers: { 'content-type': 'application/json' } })
  }
}
