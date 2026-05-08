import { NextRequest } from 'next/server'
import { z } from 'zod'
import services from '@/lib/services'
import { requireOperationsUser } from '@/lib/mobile/auth'
import { mobileError, mobileSuccess } from '@/lib/mobile/api-response'
import { handleMobileRouteError } from '@/lib/mobile/route-helpers'

const revokeCardSchema = z.object({
  cardId: z.number().int().positive('Card ID is required'),
  reason: z.string().trim().optional()
})

export async function POST(request: NextRequest) {
  try {
    await requireOperationsUser(request)
    const body = revokeCardSchema.parse(await request.json())
    const response = await services.nfcCard.revokeCard({
      cardId: body.cardId,
      status: 'inactive'
    })

    if (!response.success || !response.data) {
      return mobileError('BAD_REQUEST', response.error || 'Failed to revoke NFC card', 400)
    }

    return mobileSuccess({
      card: toCardDisplay(response.data),
      reason: body.reason || null
    })
  } catch (error) {
    return handleMobileRouteError(error)
  }
}

function toCardDisplay(card: {
  id: number
  studentId: number
  uidLast4: string | null
  status: string
  issuedAt: Date | null
  activatedAt: Date | null
  deactivatedAt: Date | null
  replacedAt: Date | null
  lostAt: Date | null
}) {
  return {
    id: card.id,
    studentId: card.studentId,
    uidLast4: card.uidLast4,
    status: card.status,
    issuedAt: card.issuedAt,
    activatedAt: card.activatedAt,
    deactivatedAt: card.deactivatedAt,
    replacedAt: card.replacedAt,
    lostAt: card.lostAt
  }
}
