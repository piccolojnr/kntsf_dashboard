import { PrismaClient } from '@prisma/client'
import { log } from '../logger'

const prisma =
  // globalForPrisma.prisma ??
  new PrismaClient({
    log: [
      { emit: 'event', level: 'error' },
      { emit: 'event', level: 'warn' },
      { emit: 'event', level: 'info' }
    ]
  })

prisma.$on('error', (e) => {
  log('🛑 PRISMA ERROR:', e.message)
})

prisma.$on('warn', (e) => {
  log('⚠️ PRISMA WARNING:', e.message)
})

prisma.$on('info', (e) => {
  log('ℹ️ PRISMA INFO:', e.message)
})

export { prisma }
// if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
