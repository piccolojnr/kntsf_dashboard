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
      prisma.auditLog.count(),
      prisma.auditLog.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          action: true,
          details: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              username: true,
              name: true,
              email: true,
              role: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          }
        }
      })
    ])

    return mobileSuccess({
      items: logs,
      pagination: buildPagination({ page, limit, total })
    })
  } catch (error) {
    return handleMobileRouteError(error)
  }
}
