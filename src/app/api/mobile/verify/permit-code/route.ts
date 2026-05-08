import { NextRequest } from 'next/server'
import { z } from 'zod'
import services from '@/lib/services'
import { requireOperationsUser } from '@/lib/mobile/auth'
import { mobileSuccess } from '@/lib/mobile/api-response'
import { handleMobileRouteError } from '@/lib/mobile/route-helpers'
import { buildMobileVerificationResult } from '@/lib/mobile/verification-response'

const verifyPermitCodeSchema = z.object({
  code: z.string().trim().min(1, 'Permit code is required')
})

export async function POST(request: NextRequest) {
  try {
    const user = await requireOperationsUser(request)
    const body = verifyPermitCodeSchema.parse(await request.json())
    const response = await services.verification.verifyByPermitCode(body.code, user.id)

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to verify permit code')
    }

    const result = await buildMobileVerificationResult(response.data, {
      method: 'permit_code',
      value: body.code
    })

    return mobileSuccess(result)
  } catch (error) {
    return handleMobileRouteError(error)
  }
}
