import { NextRequest } from 'next/server'
import services from '@/lib/services'
import { requireOperationsUser } from '@/lib/mobile/auth'
import { mobileError, mobileSuccess } from '@/lib/mobile/api-response'
import { handleMobileRouteError } from '@/lib/mobile/route-helpers'

export async function GET(request: NextRequest) {
  try {
    await requireOperationsUser(request)

    const response = await services.config.getConfig()
    if (!response.success || !response.data) {
      return mobileError('NOT_FOUND', response.error || 'Configuration not found', 404)
    }

    const { permitConfig, semesterConfig } = response.data

    return mobileSuccess({
      issuanceEnabled: permitConfig?.enablePermitRequest ?? false,
      defaultAmount: permitConfig?.defaultAmount ?? 0,
      currency: permitConfig?.currency ?? 'GHS',
      expiryDate: permitConfig?.expirationDate ?? null,
      academicYear: semesterConfig?.academicYear ?? null,
      currentSemester: semesterConfig?.currentSemester ?? null
    })
  } catch (error) {
    return handleMobileRouteError(error)
  }
}
