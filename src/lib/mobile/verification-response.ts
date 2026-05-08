import { Permit, PermitStatus } from '@prisma/client'
import prisma from '@/lib/prisma/client'
import { NormalizedVerificationResult } from '@/lib/nfc-helpers'

export type MobileVerificationOutcome = 'allowed' | 'warning' | 'denied'

export type MobileVerificationReason =
  | 'active_permit'
  | 'expired_permit'
  | 'revoked_permit'
  | 'no_active_permit'
  | 'student_not_found'
  | 'card_not_registered'
  | 'card_inactive'
  | 'permit_not_found'
  | 'permit_issuance_disabled'
  | 'invalid_input'
  | 'unknown_error'

export type MobileVerificationDecision =
  | 'allowed'
  | 'denied'
  | 'card_not_registered'
  | 'card_inactive'
  | 'no_active_permit'
  | 'expired_permit'
  | 'revoked_permit'

export type MobileVerificationMethod = 'student_id' | 'card_uid' | 'permit_code'

export type MobilePermitIssuanceConfig = {
  enabled: boolean
  defaultAmount: number
  currency: string
  expiryDate: Date
  academicYear: string | null
}

export type MobileStudentSummary = {
  id: string
  studentId: string
  name: string
  email: string
  course: string
  level: string
  phone: string
}

export type MobilePermitSummary = {
  id: string
  studentId: string
  permitCode: string
  status: PermitStatus
  startDate: Date
  expiryDate: Date
  amountPaid: number
}

export type MobileCardSummary = {
  id: string
  studentId: string
  uid: string
  uidLast4: string
  type: 'unknown'
  status: string
  registeredAt: Date
  issuedAt: Date | null
  activatedAt: Date | null
  deactivatedAt: Date | null
}

export type MobileVerificationResult = {
  outcome: MobileVerificationOutcome
  reason: MobileVerificationReason
  decision: MobileVerificationDecision
  status: MobileVerificationDecision
  message: string
  method: MobileVerificationMethod
  value: string
  checkedAt: Date
  student: MobileStudentSummary | null
  permit: MobilePermitSummary | null
  card: MobileCardSummary | null
  canIssuePermit: boolean
  issuanceConfig: MobilePermitIssuanceConfig | null
}

type VerificationSource = NormalizedVerificationResult & {
  student?: NormalizedVerificationResult['student'] & { number?: string | null }
  permit?: NormalizedVerificationResult['permit'] & {
    studentId?: number | null
    originalCode?: string | null
    permitHash?: string | null
  }
  card?: NormalizedVerificationResult['card'] & {
    studentId?: number | null
    createdAt?: Date | null
  }
}

type BuildMobileVerificationOptions = {
  value: string
  method?: MobileVerificationMethod
}

export async function buildMobileVerificationResult(
  result: NormalizedVerificationResult,
  options: BuildMobileVerificationOptions
): Promise<MobileVerificationResult> {
  const issuanceConfig = await getMobilePermitIssuanceConfig()
  const reason = normalizeReason(result.reason)
  const method = options.method ?? normalizeMethod(result.method)
  const source = result as VerificationSource
  const canIssuePermit = Boolean(
    issuanceConfig?.enabled &&
      source.student &&
      (reason === 'expired_permit' ||
        reason === 'revoked_permit' ||
        reason === 'no_active_permit')
  )
  const outcome = normalizeOutcome(result.outcome, reason, canIssuePermit)
  const decision = getDecisionFromReason(reason)
  const permit = source.permit
    ? await toMobilePermit(source.permit, source.student?.id)
    : null

  return {
    outcome,
    reason,
    decision,
    status: decision,
    message: result.message,
    method,
    value: options.value,
    checkedAt: result.checkedAt,
    student: source.student ? toMobileStudent(source.student) : null,
    permit,
    card: source.card ? toMobileCard(source.card, source.student?.id) : null,
    canIssuePermit,
    issuanceConfig
  }
}

export async function getMobilePermitIssuanceConfig(): Promise<MobilePermitIssuanceConfig | null> {
  const config = await prisma.config.findFirst({
    include: {
      permitConfig: true,
      semesterConfig: true
    }
  })

  if (!config?.permitConfig) {
    return null
  }

  return {
    enabled: config.permitConfig.enablePermitRequest,
    defaultAmount: config.permitConfig.defaultAmount,
    currency: config.permitConfig.currency,
    expiryDate: config.permitConfig.expirationDate,
    academicYear: config.semesterConfig?.academicYear ?? null
  }
}

export function toMobileIssuedPermit(permit: Permit & { originalCode?: string | null }): MobilePermitSummary {
  return {
    id: String(permit.id),
    studentId: String(permit.studentId),
    permitCode: permit.originalCode || permit.permitHash || '',
    status: permit.status,
    startDate: permit.startDate,
    expiryDate: permit.expiryDate,
    amountPaid: permit.amountPaid
  }
}

function normalizeReason(reason: string): MobileVerificationReason {
  switch (reason) {
    case 'valid_permit':
      return 'active_permit'
    case 'permit_expired':
      return 'expired_permit'
    case 'permit_revoked':
      return 'revoked_permit'
    case 'card_not_found':
      return 'card_not_registered'
    case 'permit_not_found':
      return 'permit_not_found'
    case 'student_not_found':
    case 'card_inactive':
    case 'no_active_permit':
      return reason
    default:
      return 'unknown_error'
  }
}

function normalizeMethod(method: string): MobileVerificationMethod {
  return method === 'nfc_uid' ? 'card_uid' : (method as MobileVerificationMethod)
}

function normalizeOutcome(
  outcome: MobileVerificationOutcome,
  reason: MobileVerificationReason,
  canIssuePermit: boolean
): MobileVerificationOutcome {
  if (reason === 'active_permit') {
    return 'allowed'
  }

  if (
    canIssuePermit ||
    reason === 'expired_permit' ||
    reason === 'revoked_permit' ||
    reason === 'no_active_permit'
  ) {
    return 'warning'
  }

  return outcome === 'allowed' || outcome === 'warning' || outcome === 'denied'
    ? outcome
    : 'denied'
}

function getDecisionFromReason(reason: MobileVerificationReason): MobileVerificationDecision {
  switch (reason) {
    case 'active_permit':
      return 'allowed'
    case 'expired_permit':
      return 'expired_permit'
    case 'revoked_permit':
      return 'revoked_permit'
    case 'no_active_permit':
    case 'permit_not_found':
      return 'no_active_permit'
    case 'card_not_registered':
      return 'card_not_registered'
    case 'card_inactive':
      return 'card_inactive'
    default:
      return 'denied'
  }
}

function toMobileStudent(student: NonNullable<VerificationSource['student']>): MobileStudentSummary {
  return {
    id: String(student.id),
    studentId: student.studentId,
    name: student.name || '',
    email: student.email || '',
    course: student.course || '',
    level: student.level || '',
    phone: student.number || ''
  }
}

async function toMobilePermit(
  permit: NonNullable<VerificationSource['permit']>,
  fallbackStudentId?: number
): Promise<MobilePermitSummary> {
  const permitDetails = await prisma.permit.findUnique({
    where: { id: permit.id },
    select: {
      studentId: true,
      originalCode: true,
      permitHash: true
    }
  })

  return {
    id: String(permit.id),
    studentId: String(permitDetails?.studentId ?? permit.studentId ?? fallbackStudentId ?? ''),
    permitCode: permitDetails?.originalCode || permitDetails?.permitHash || permit.originalCode || permit.permitHash || '',
    status: permit.status,
    startDate: permit.startDate,
    expiryDate: permit.expiryDate,
    amountPaid: permit.amountPaid
  }
}

function toMobileCard(
  card: NonNullable<VerificationSource['card']>,
  fallbackStudentId?: number
): MobileCardSummary {
  const uidLast4 = card.uidLast4 || ''

  return {
    id: String(card.id),
    studentId: String(card.studentId ?? fallbackStudentId ?? ''),
    uid: uidLast4 ? `****${uidLast4}` : '',
    uidLast4,
    type: 'unknown',
    status: card.status,
    registeredAt: card.createdAt || card.issuedAt || new Date(0),
    issuedAt: card.issuedAt,
    activatedAt: card.activatedAt,
    deactivatedAt: card.deactivatedAt
  }
}
