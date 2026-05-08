import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma/client'
import { requireOperationsUser } from '@/lib/mobile/auth'
import { mobileSuccess } from '@/lib/mobile/api-response'
import { buildPagination, getPagination } from '@/lib/mobile/pagination'
import { handleMobileRouteError } from '@/lib/mobile/route-helpers'

export async function GET(request: NextRequest) {
  try {
    await requireOperationsUser(request)

    const { page, limit, skip } = getPagination(request.nextUrl.searchParams)

    const [total, logs] = await Promise.all([
      prisma.verificationLog.count(),
      prisma.verificationLog.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          method: true,
          result: true,
          reason: true,
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
          },
          permit: {
            select: {
              id: true,
              originalCode: true,
              status: true,
              startDate: true,
              expiryDate: true,
              amountPaid: true
            }
          },
          card: {
            select: {
              id: true,
              uidLast4: true,
              status: true,
              issuedAt: true,
              activatedAt: true,
              deactivatedAt: true,
              lostAt: true
            }
          },
          verifierUser: {
            select: {
              id: true,
              username: true,
              name: true,
              email: true
            }
          }
        }
      })
    ])

    return mobileSuccess({
      items: logs.map((log) => ({
        id: log.id,
        method: log.method,
        result: log.result,
        reason: log.reason,
        createdAt: log.createdAt,
        student: log.student,
        permit: log.permit
          ? {
              id: log.permit.id,
              permitCode: log.permit.originalCode,
              status: log.permit.status,
              startDate: log.permit.startDate,
              expiryDate: log.permit.expiryDate,
              amountPaid: log.permit.amountPaid
            }
          : null,
        card: log.card,
        verifier: log.verifierUser
      })),
      pagination: buildPagination({ page, limit, total })
    })
  } catch (error) {
    return handleMobileRouteError(error)
  }
}
