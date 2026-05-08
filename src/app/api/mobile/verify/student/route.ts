import { NextRequest } from 'next/server'
import { z } from 'zod'
import services from '@/lib/services'
import { requireOperationsUser } from '@/lib/mobile/auth'
import { mobileSuccess } from '@/lib/mobile/api-response'
import { handleMobileRouteError } from '@/lib/mobile/route-helpers'

const verifyStudentSchema = z.object({
  studentId: z.string().trim().min(1, 'Student ID is required')
})

export async function POST(request: NextRequest) {
  try {
    const user = await requireOperationsUser(request)
    const body = verifyStudentSchema.parse(await request.json())
    const response = await services.verification.verifyByStudentId(body.studentId, user.id)

    if (!response.success) {
      throw new Error(response.error || 'Failed to verify student')
    }

    return mobileSuccess(response.data)
  } catch (error) {
    return handleMobileRouteError(error)
  }
}
