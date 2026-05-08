import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma/client'
import { requireStudentUser } from '@/lib/mobile/auth'
import { mobileError, mobileSuccess } from '@/lib/mobile/api-response'
import { handleMobileRouteError } from '@/lib/mobile/route-helpers'

export async function POST(request: NextRequest) {
  try {
    const user = await requireStudentUser(request)
    const now = new Date()

    const student = await prisma.student.findUnique({
      where: { studentId: user.studentId },
      select: {
        id: true,
        studentId: true
      }
    })

    if (!student) {
      return mobileError('NOT_FOUND', 'Student not found', 404)
    }

    const activeCard = await prisma.nfcCard.findFirst({
      where: {
        studentId: student.id,
        status: 'active'
      },
      orderBy: { activatedAt: 'desc' }
    })

    if (!activeCard) {
      return mobileError('NOT_FOUND', 'No active NFC card found', 404)
    }

    const updatedCard = await prisma.nfcCard.update({
      where: { id: activeCard.id },
      data: {
        status: 'lost',
        lostAt: now,
        deactivatedAt: now
      },
      select: {
        id: true,
        uidLast4: true,
        status: true,
        issuedAt: true,
        activatedAt: true,
        deactivatedAt: true,
        replacedAt: true,
        lostAt: true
      }
    })

    return mobileSuccess({
      card: updatedCard
    })
  } catch (error) {
    return handleMobileRouteError(error)
  }
}
