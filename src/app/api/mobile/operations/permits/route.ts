import { NextRequest } from 'next/server'
import { PermitStatus, Prisma } from '@prisma/client'
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
    const status = isPermitStatus(statusParam) ? statusParam : undefined
    const { page, limit, skip } = getPagination(searchParams)

    const where: Prisma.PermitWhereInput = {
      student: { deletedAt: null },
      ...(status ? { status } : {}),
      ...(search
        ? {
            OR: [
              { originalCode: { contains: search } },
              { permitHash: { contains: search } },
              { student: { studentId: { contains: search } } },
              { student: { name: { contains: search } } }
            ]
          }
        : {})
    }

    const [total, permits] = await Promise.all([
      prisma.permit.count({ where }),
      prisma.permit.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          originalCode: true,
          permitHash: true,
          status: true,
          startDate: true,
          expiryDate: true,
          amountPaid: true,
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
          issuedBy: {
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
      items: permits.map((permit) => ({
        id: permit.id,
        originalCode: permit.originalCode,
        permitHash: permit.permitHash,
        status: permit.status,
        startDate: permit.startDate,
        expiryDate: permit.expiryDate,
        amountPaid: permit.amountPaid,
        createdAt: permit.createdAt,
        student: permit.student,
        issuedBy: permit.issuedBy
          ? {
              id: permit.issuedBy.id,
              username: permit.issuedBy.username,
              name: permit.issuedBy.name,
              email: permit.issuedBy.email
            }
          : null
      })),
      pagination: buildPagination({ page, limit, total })
    })
  } catch (error) {
    return handleMobileRouteError(error)
  }
}

function isPermitStatus(status?: string | null): status is PermitStatus {
  return status === 'active' || status === 'expired' || status === 'revoked'
}
