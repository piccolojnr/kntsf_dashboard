import { NextRequest } from 'next/server'
import { Prisma } from '@prisma/client'
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
    const { page, limit, skip } = getPagination(searchParams)

    const where: Prisma.StudentWhereInput = {
      deletedAt: null,
      ...(search
        ? {
            OR: [
              { studentId: { contains: search } },
              { name: { contains: search } },
              { email: { contains: search } },
              { course: { contains: search } },
              { level: { contains: search } }
            ]
          }
        : {})
    }

    const [total, students] = await Promise.all([
      prisma.student.count({ where }),
      prisma.student.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          studentId: true,
          name: true,
          email: true,
          course: true,
          level: true,
          number: true,
          nfcCards: {
            where: { status: 'active' },
            orderBy: { activatedAt: 'desc' },
            take: 1,
            select: {
              id: true,
              uidLast4: true,
              status: true,
              issuedAt: true,
              activatedAt: true
            }
          },
          permits: {
            where: { status: 'active' },
            orderBy: { expiryDate: 'desc' },
            take: 1,
            select: {
              id: true,
              originalCode: true,
              status: true,
              startDate: true,
              expiryDate: true,
              amountPaid: true
            }
          }
        }
      })
    ])

    return mobileSuccess({
      items: students.map((student) => ({
        id: student.id,
        studentId: student.studentId,
        name: student.name,
        email: student.email,
        course: student.course,
        level: student.level,
        phone: student.number,
        activeCard: student.nfcCards[0] || null,
        activePermit: student.permits[0]
          ? {
              id: student.permits[0].id,
              permitCode: student.permits[0].originalCode,
              status: student.permits[0].status,
              startDate: student.permits[0].startDate,
              expiryDate: student.permits[0].expiryDate,
              amountPaid: student.permits[0].amountPaid
            }
          : null
      })),
      pagination: buildPagination({ page, limit, total })
    })
  } catch (error) {
    return handleMobileRouteError(error)
  }
}
