import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma/client'
import { requireStudentUser } from '@/lib/mobile/auth'
import { mobileSuccess } from '@/lib/mobile/api-response'
import { handleMobileRouteError } from '@/lib/mobile/route-helpers'

export async function GET(request: NextRequest) {
  try {
    const user = await requireStudentUser(request)
    const student = await prisma.student.findUnique({
      where: { studentId: user.studentId },
      include: {
        permits: {
          select: {
            id: true,
            originalCode: true,
            status: true,
            startDate: true,
            expiryDate: true,
            amountPaid: true,
            cardDelivered: true,
            createdAt: true,
            updatedAt: true
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    return mobileSuccess({
      permits: student?.permits || []
    })
  } catch (error) {
    return handleMobileRouteError(error)
  }
}
