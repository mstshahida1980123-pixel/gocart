import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(req) {
  const { pathname } = req.nextUrl

  // Allow public files
  if (pathname.startsWith('/_next') || pathname.startsWith('/favicon.ico')) {
    return NextResponse.next()
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET })
  const role = token?.role

  // (store routes removed in single-vendor mode)

  // Protect admin pages
  if (pathname.startsWith('/admin')) {
    if (!token || role !== 'ADMIN') {
      const url = req.nextUrl.clone()
      url.pathname = '/auth/signin'
      return NextResponse.redirect(url)
    }
    return NextResponse.next()
  }

  // Require login for cart and orders pages
  // cart and orders are public now (guest-friendly)

  // Protect admin API routes
  if (pathname.startsWith('/api/admin') || pathname === '/api/orders/all') {
    if (!token || role !== 'ADMIN') {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'content-type': 'application/json' } })
    }
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    // '/store' matcher removed
    
    '/api/admin/:path*',
    '/api/orders/all'
  ]
}
