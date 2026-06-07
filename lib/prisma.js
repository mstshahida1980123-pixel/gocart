import { PrismaClient } from '@prisma/client'

if (!process.env.DATABASE_URL) {
  console.warn('Prisma warning: DATABASE_URL is not defined. Production database connections may fail.')
}

let prisma

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient()
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient()
  }
  prisma = global.prisma
}

export default prisma
