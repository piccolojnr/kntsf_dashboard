import { Prisma } from '@prisma/client'
import prisma from '@/lib/prisma/client'

export async function expireStaleActivePermits(scope?: Prisma.PermitWhereInput) {
  const now = new Date()

  return prisma.permit.updateMany({
    where: {
      AND: [
        scope ?? {},
        {
          status: 'active',
          expiryDate: { lte: now }
        }
      ]
    },
    data: { status: 'expired' }
  })
}
