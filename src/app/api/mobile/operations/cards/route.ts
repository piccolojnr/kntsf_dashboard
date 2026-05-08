import { NextRequest } from 'next/server'
import { NfcCardStatus, Prisma } from '@prisma/client'
import prisma from '@/lib/prisma/client'
import { requireOperationsUser } from '@/lib/mobile/auth'
import { mobileSuccess } from '@/lib/mobile/api-response'
import { handleMobileRouteError } from '@/lib/mobile/route-helpers'
import { buildPagination, getPagination } from '@/lib/mobile/pagination'

export async function GET(request: NextRequest) {
  try {
    await requireOperationsUser(request)

    const { searchParams } = request.nextUrl
    const search = searchParams.get('search')?.trim()
    const statusParam = searchParams.get('status')?.trim()
    const status = isNfcCardStatus(statusParam) ? statusParam : undefined
    const { page, limit, skip } = getPagination(searchParams)

    const where: Prisma.NfcCardWhereInput = {
      student: { deletedAt: null },
      ...(status ? { status } : {}),
      ...(search
        ? {
            OR: [
              { uidLast4: { contains: search } },
              { student: { studentId: { contains: search } } },
              { student: { name: { contains: search } } }
            ]
          }
        : {})
    }

    const [total, cards] = await Promise.all([
      prisma.nfcCard.count({ where }),
      prisma.nfcCard.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          uidLast4: true,
          status: true,
          issuedAt: true,
          activatedAt: true,
          deactivatedAt: true,
          replacedAt: true,
          lostAt: true,
          createdAt: true,
          student: {
            select: {
              id: true,
              studentId: true,
              name: true,
              email: true,
              course: true,
              level: true
            }
          }
        }
      })
    ])

    return mobileSuccess({
      items: cards,
      pagination: buildPagination({ page, limit, total })
    })
  } catch (error) {
    return handleMobileRouteError(error)
  }
}

function isNfcCardStatus(status?: string | null): status is NfcCardStatus {
  return (
    status === 'active' ||
    status === 'inactive' ||
    status === 'revoked' ||
    status === 'lost' ||
    status === 'stolen' ||
    status === 'replaced' ||
    status === 'damaged'
  )
}
