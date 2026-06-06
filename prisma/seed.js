const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL
  const adminPassword = process.env.ADMIN_PASSWORD

  if (!adminEmail || !adminPassword) {
    throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be set in environment variables before seeding.')
  }

  // Remove legacy admin accounts so only the new admin credentials exist
  await prisma.user.deleteMany({ where: { role: 'ADMIN', email: { not: adminEmail } } })

  // Create or update the admin user
  const hashed = await bcrypt.hash(adminPassword, 10)
  const existing = await prisma.user.findUnique({ where: { email: adminEmail } })
  if (!existing) {
    await prisma.user.create({ data: { email: adminEmail, name: 'Admin', password: hashed, role: 'ADMIN' } })
    console.log('Created admin:', adminEmail)
  } else {
    await prisma.user.update({ where: { email: adminEmail }, data: { password: hashed, role: 'ADMIN', name: 'Admin' } })
    console.log('Updated admin credentials:', adminEmail)
  }

  // Create sample categories if none exist
  const categoryCount = await prisma.category.count()
  if (categoryCount === 0) {
    const categories = [
      { name: 'Earbuds', slug: 'earbuds', description: 'Sleek, true wireless earbuds for everyday listening', image: '/uploads/earbuds.jpg' },
      { name: 'Watch', slug: 'watch', description: 'Smart watches and wearable tech to keep you connected', image: '/uploads/watch.jpg' },
      { name: 'Speakers', slug: 'speakers', description: 'Portable and home speakers with rich sound', image: '/uploads/speakers.jpg' },
    ]
    for (const category of categories) {
      await prisma.category.create({ data: category })
    }
    console.log('Seeded sample categories')
  }

  // Create sample products if none exist
  const prodCount = await prisma.product.count()
  if (prodCount === 0) {
    const sample = [
      { name: 'Sample Wireless Earbuds', description: 'High quality earbuds', mrp: 2000, price: 1599, images: [], category: 'Earbuds', inStock: true, featured: true },
      { name: 'Sample Smart Watch', description: 'Feature-rich smartwatch', mrp: 5000, price: 3999, images: [], category: 'Watch', inStock: true },
      { name: 'Sample Bluetooth Speaker', description: 'Portable speaker', mrp: 3000, price: 2499, images: [], category: 'Speakers', inStock: true },
    ]
    for (const p of sample) {
      const category = await prisma.category.findUnique({ where: { slug: p.category.toLowerCase() } })
      const data = {
        ...p,
        images: JSON.stringify(p.images),
        categoryId: category?.id,
      }
      await prisma.product.create({ data })
    }
    console.log('Seeded sample products')
  } else {
    // ensure existing products have images (use placeholder if empty)
    const placeholder = '/uploads/placeholder.svg'
    const prods = await prisma.product.findMany()
    for (const p of prods) {
      if (!p.images || p.images === '[]') {
        await prisma.product.update({ where: { id: p.id }, data: { images: JSON.stringify([placeholder]) } })
      }
    }
    console.log('Products already present; ensured placeholder images')
  }

  // Create a welcome coupon if not exists
  const code = 'WELCOME10'
  const existingCoupon = await prisma.coupon.findUnique({ where: { code } })
  if (!existingCoupon) {
    await prisma.coupon.create({ data: { code, description: '10% off for new users', discount: 10, forNewUser: true, forMember: false, isPublic: true, expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) } })
    console.log('Created coupon', code)
  } else {
    console.log('Coupon already exists', code)
  }

  // Ensure default site settings exist
  const defaultSettings = {
    id: 'site',
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
    socialLinks: JSON.stringify([]),
  }

  await prisma.siteSetting.upsert({
    where: { id: 'site' },
    update: defaultSettings,
    create: defaultSettings,
  })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
