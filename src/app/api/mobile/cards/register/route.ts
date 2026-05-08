import { NextRequest } from 'next/server'
import { z } from 'zod'
import services from '@/lib/services'
import { requireOperationsUser } from '@/lib/mobile/auth'
import { mobileError, mobileSuccess } from '@/lib/mobile/api-response'
import { handleMobileRouteError } from '@/lib/mobile/route-helpers'

const registerCardSchema = z.object({
  studentId: z.string().trim().min(1, 'Student ID is required'),
  uid: z.string().trim().min(1, 'NFC UID is required')
})

export async function POST(request: NextRequest) {
  try {
    await requireOperationsUser(request)
    const body = registerCardSchema.parse(await request.json())
    const response = await services.nfcCard.registerCardForStudent(body)

    if (!response.success || !response.data) {
      return mobileError('BAD_REQUEST', response.error || 'Failed to register NFC card', 400)
    }

    return mobileSuccess(toCardDisplay(response.data))
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
