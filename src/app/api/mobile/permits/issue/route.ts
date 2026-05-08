import { NextRequest } from 'next/server'
import { z } from 'zod'
import services from '@/lib/services'
import { requireOperationsUser } from '@/lib/mobile/auth'
import { mobileError, mobileSuccess } from '@/lib/mobile/api-response'
import { handleMobileRouteError } from '@/lib/mobile/route-helpers'
import { buildMobileVerificationResult, toMobileIssuedPermit } from '@/lib/mobile/verification-response'

const issuePermitSchema = z.object({
  studentId: z.string().trim().min(1, 'Student ID is required')
})

export async function POST(request: NextRequest) {
  try {
    const user = await requireOperationsUser(request)
    const body = issuePermitSchema.parse(await request.json())

    const issuedPermit = await services.permit.issuePermitForStudentByStaff({
      studentId: body.studentId,
      issuedById: user.id
    })

    if (!issuedPermit.success || !issuedPermit.data) {
      return mobileError('BAD_REQUEST', issuedPermit.error || 'Failed to issue permit', 400)
    }

    const verification = await services.verification.verifyByStudentId(body.studentId, user.id)

    return mobileSuccess({
      permit: {
        ...toMobileIssuedPermit(issuedPermit.data),
        qrCode: issuedPermit.qrCode
      },
      verificationResult: verification.success && verification.data
        ? await buildMobileVerificationResult(verification.data, {
            method: 'student_id',
            value: body.studentId
          })
        : null
    })
  } catch (error) {
    return handleMobileRouteError(error)
  }
}
