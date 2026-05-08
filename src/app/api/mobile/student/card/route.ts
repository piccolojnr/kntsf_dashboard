import { NextRequest } from 'next/server'
import services from '@/lib/services'
import { requireStudentUser } from '@/lib/mobile/auth'
import { mobileSuccess } from '@/lib/mobile/api-response'
import { handleMobileRouteError } from '@/lib/mobile/route-helpers'

export async function GET(request: NextRequest) {
  try {
    const user = await requireStudentUser(request)
    const response = await services.nfcCard.getActiveCardForStudent(user.studentId!)

    if (!response.success) {
      throw new Error(response.error || 'Failed to load card status')
    }

    const card = response.data
    return mobileSuccess({
      card: card
        ? {
            id: card.id,
            uidLast4: card.uidLast4,
            status: card.status,
            issuedAt: card.issuedAt,
            activatedAt: card.activatedAt,
            deactivatedAt: card.deactivatedAt
          }
        : null
    })
  } catch (error) {
    return handleMobileRouteError(error)
  }
}
