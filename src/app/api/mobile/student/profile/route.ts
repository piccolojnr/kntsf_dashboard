import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma/client'
import { requireStudentUser } from '@/lib/mobile/auth'
import { mobileError, mobileSuccess } from '@/lib/mobile/api-response'
import { handleMobileRouteError } from '@/lib/mobile/route-helpers'

export async function GET(request: NextRequest) {
  try {
    const user = await requireStudentUser(request)
    const student = await prisma.student.findUnique({
      where: { studentId: user.studentId },
      select: {
        id: true,
        studentId: true,
        name: true,
        email: true,
        course: true,
        level: true,
        number: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!student) {
      return mobileError('NOT_FOUND', 'Student not found', 404)
    }

    return mobileSuccess(student)
  } catch (error) {
    return handleMobileRouteError(error)
  }
}
