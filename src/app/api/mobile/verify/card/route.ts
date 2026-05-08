import { NextRequest } from 'next/server'
import { z } from 'zod'
import services from '@/lib/services'
import { requireOperationsUser } from '@/lib/mobile/auth'
import { mobileSuccess } from '@/lib/mobile/api-response'
import { handleMobileRouteError } from '@/lib/mobile/route-helpers'

const verifyCardSchema = z.object({
  uid: z.string().trim().min(1, 'NFC UID is required')
})

export async function POST(request: NextRequest) {
  try {
    const user = await requireOperationsUser(request)
    const body = verifyCardSchema.parse(await request.json())
    const response = await services.verification.verifyByCardUid(body.uid, user.id)

    if (!response.success) {
      throw new Error(response.error || 'Failed to verify card')
    }

    return mobileSuccess(response.data)
  } catch (error) {
    return handleMobileRouteError(error)
  }
}
