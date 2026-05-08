import { NextRequest } from 'next/server'
import { requireMobileUser } from '@/lib/mobile/auth'
import { mobileSuccess } from '@/lib/mobile/api-response'
import { handleMobileRouteError } from '@/lib/mobile/route-helpers'

export async function GET(request: NextRequest) {
  try {
    const user = await requireMobileUser(request)
    return mobileSuccess(user)
  } catch (error) {
    return handleMobileRouteError(error)
  }
}
