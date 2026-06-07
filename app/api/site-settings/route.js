import prisma from '@/lib/prisma'
import { getToken } from 'next-auth/jwt'

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET

const safeJsonParse = (value) => {
  if (Array.isArray(value)) return value
  if (typeof value !== 'string') return []
  try {
    return JSON.parse(value)
  } catch {
    return []
  }
}

const defaultHeroBanner = {
  mainBanner: {
    badgeText: 'NEWS',
    badgeSideText: 'Free Shipping on Orders Above $50!',
    largeHeadline: "Gadgets you'll love.",
    smallHeadline: "Prices you'll trust.",
    startsFromToggle: true,
    price: '4.90',
    buttonText: 'LEARN MORE',
    buttonLink: '/',
    image: '',
    bgColor: '',
  },
  topRightBanner: {
    title: 'Best products',
    link: '/',
    image: '',
    bgColor: '',
  },
  bottomRightBanner: {
    title: '20% discounts',
    link: '/',
    image: '',
    bgColor: '',
  },
}

const safeJsonParseObject = (value, fallback) => {
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) return value
  if (typeof value !== 'string' || !value.trim()) return fallback
  try {
    return JSON.parse(value)
  } catch {
    return fallback
  }
}

const safeJsonStringify = (value, fallback) => {
  if (Array.isArray(value)) return JSON.stringify(value)
  if (typeof value === 'object' && value !== null) return JSON.stringify(value)
  if (typeof value === 'string' && value.trim()) return value
  return fallback
}

const defaultSettings = {
  id: 'site',
  siteName: 'gocart',
  phone: '+1 (800) 322-1384',
  email: 'support@gocart.com',
  address: '425 Market Street, San Francisco, CA',
  logoImage: '',
  facebookPixelId: '',
  googleAnalyticsId: '',
  googleTagManagerId: '',
  seoTitle: 'GoCart. - Shop smarter',
  metaDescription: 'GoCart is the online shop for curated gadgets, essentials, and fast support.',
  metaKeywords: 'electronics,gadgets,shopping,online store,technology',
  announcement: '',
  headerNav: JSON.stringify([
    { name: 'Home', url: '/' },
    { name: 'Shop', url: '/shop' },
    { name: 'Categories', url: '/categories' },
    { name: 'About', url: '/about' },
    { name: 'Contact', url: '/contact' },
  ]),
  footerProducts: JSON.stringify([
    { text: 'Earphones', url: '/' },
    { text: 'Headphones', url: '/' },
    { text: 'Smartphones', url: '/' },
    { text: 'Laptops', url: '/' },
  ]),
  footerWebsite: JSON.stringify([
    { text: 'Home', url: '/' },
    { text: 'Privacy Policy', url: '/' },
  ]),
  socialLinks: JSON.stringify([]),
  heroBanner: JSON.stringify(defaultHeroBanner),
  copyrightText: 'Copyright 2025 © gocart All Right Reserved.',
}

export async function GET(req) {
  try {
    const siteSetting = await prisma.siteSetting.upsert({
      where: { id: 'site' },
      update: {},
      create: defaultSettings,
    })

    const parsed = {
      ...siteSetting,
      siteName: siteSetting.siteName || 'gocart',
      headerNav: safeJsonParse(siteSetting.headerNav),
      footerProducts: safeJsonParse(siteSetting.footerProducts),
      footerWebsite: safeJsonParse(siteSetting.footerWebsite),
      logoImage: siteSetting.logoImage || '',
      socialLinks: safeJsonParse(siteSetting.socialLinks),
      heroBanner: safeJsonParseObject(siteSetting.heroBanner, defaultHeroBanner),
    }
    return new Response(JSON.stringify({ siteSetting: parsed }), { status: 200, headers: { 'content-type': 'application/json' } })
  } catch (err) {
    console.error('site-settings GET error', err)
    return new Response(JSON.stringify({ error: 'Failed to load site settings' }), { status: 500, headers: { 'content-type': 'application/json' } })
  }
}

export async function PUT(req) {
  try {
    const token = await getToken({ req, secret: NEXTAUTH_SECRET })
    if (!token || token.role !== 'ADMIN') {
      console.error('site-settings PUT unauthorized', {
        tokenPresent: Boolean(token),
        role: token?.role,
        secret: Boolean(NEXTAUTH_SECRET),
      })
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'content-type': 'application/json' } })
    }

    const body = await req.json()
    if (!body || typeof body !== 'object') {
      return new Response(JSON.stringify({ error: 'Invalid request body' }), { status: 400, headers: { 'content-type': 'application/json' } })
    }

    const existing = await prisma.siteSetting.findUnique({ where: { id: 'site' } })

    let heroBanner = existing?.heroBanner || JSON.stringify(defaultHeroBanner)
    if (body.heroBanner !== undefined && body.heroBanner !== null) {
      heroBanner = safeJsonStringify(body.heroBanner, JSON.stringify(defaultHeroBanner))
      console.log('site-settings heroBanner updated', { heroBanner: heroBanner.substring(0, 100) })
    }

    const updateData = {
      siteName: body.siteName !== undefined ? body.siteName : (existing?.siteName || defaultSettings.siteName),
      phone: body.phone !== undefined ? body.phone : (existing?.phone || defaultSettings.phone),
      email: body.email !== undefined ? body.email : (existing?.email || defaultSettings.email),
      address: body.address !== undefined ? body.address : (existing?.address || defaultSettings.address),
      logoImage: body.logoImage !== undefined ? body.logoImage : (existing?.logoImage ?? ''),
      facebookPixelId: body.facebookPixelId !== undefined ? body.facebookPixelId : (existing?.facebookPixelId ?? ''),
      googleAnalyticsId: body.googleAnalyticsId !== undefined ? body.googleAnalyticsId : (existing?.googleAnalyticsId ?? ''),
      googleTagManagerId: body.googleTagManagerId !== undefined ? body.googleTagManagerId : (existing?.googleTagManagerId ?? ''),
      seoTitle: body.seoTitle !== undefined ? body.seoTitle : (existing?.seoTitle || defaultSettings.seoTitle),
      metaDescription: body.metaDescription !== undefined ? body.metaDescription : (existing?.metaDescription || defaultSettings.metaDescription),
      metaKeywords: body.metaKeywords !== undefined ? body.metaKeywords : (existing?.metaKeywords || defaultSettings.metaKeywords),
      announcement: body.announcement !== undefined ? body.announcement : (existing?.announcement ?? ''),
      headerNav: body.headerNav !== undefined ? safeJsonStringify(body.headerNav, defaultSettings.headerNav) : (existing?.headerNav || defaultSettings.headerNav),
      footerProducts: body.footerProducts !== undefined ? safeJsonStringify(body.footerProducts, defaultSettings.footerProducts) : (existing?.footerProducts || defaultSettings.footerProducts),
      footerWebsite: body.footerWebsite !== undefined ? safeJsonStringify(body.footerWebsite, defaultSettings.footerWebsite) : (existing?.footerWebsite || defaultSettings.footerWebsite),
      socialLinks: body.socialLinks !== undefined ? safeJsonStringify(body.socialLinks, defaultSettings.socialLinks) : (existing?.socialLinks || defaultSettings.socialLinks),
      copyrightText: body.copyrightText !== undefined ? body.copyrightText : (existing?.copyrightText ?? defaultSettings.copyrightText),
      heroBanner,
    }

    const siteSetting = await prisma.siteSetting.upsert({
      where: { id: 'site' },
      update: updateData,
      create: {
        id: 'site',
        ...updateData,
      },
    })

    if (!siteSetting) {
      console.error('site-settings PUT: upsert returned null')
      return new Response(JSON.stringify({ error: 'Failed to save site settings' }), { status: 500, headers: { 'content-type': 'application/json' } })
    }

    const parsed = {
      ...siteSetting,
      headerNav: safeJsonParse(siteSetting.headerNav),
      footerProducts: safeJsonParse(siteSetting.footerProducts),
      footerWebsite: safeJsonParse(siteSetting.footerWebsite),
      logoImage: siteSetting.logoImage || '',
      socialLinks: safeJsonParse(siteSetting.socialLinks),
      heroBanner: safeJsonParseObject(siteSetting.heroBanner, defaultHeroBanner),
    }
    console.log('site-settings PUT success', { id: siteSetting.id, heroBanner: Boolean(siteSetting.heroBanner) })
    return new Response(JSON.stringify({ siteSetting: parsed }), { status: 200, headers: { 'content-type': 'application/json' } })
  } catch (err) {
    console.error('site-settings PUT error', { message: err.message, stack: err.stack })
    return new Response(JSON.stringify({ error: 'Failed to update site settings', details: process.env.NODE_ENV === 'development' ? String(err) : undefined }), { status: 500, headers: { 'content-type': 'application/json' } })
  }
}
