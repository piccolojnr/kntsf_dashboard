'use server'

import bcrypt from 'bcryptjs'
import {
  NfcCard,
  Permit,
  Prisma,
  Student,
  VerificationMethod,
  VerificationResult
} from '@prisma/client'
import prisma from '../prisma/client'
import { log } from '../logger'
import { handleError } from '../utils'
import { ServiceResponse } from '../types/common'
import { buildResult, hashIdentifier, hashUid, mapReasonToLogResult, NormalizedMethod, NormalizedVerificationResult } from '../nfc-helpers'
import { studentIdSchema, uidSchema, permitCodeSchema } from '../schemas/nfc-card-schema'




type StudentWithPermits = Student & {
  permits: Permit[]
}

type PermitWithStudent = Permit & {
  student: Student
}

type CardWithStudent = NfcCard & {
  student: Student
}

export async function verifyByStudentId(
  studentId: string,
  verifierUserId?: number
): Promise<ServiceResponse<NormalizedVerificationResult>> {
  const checkedAt = new Date()
  const parsed = studentIdSchema.safeParse(studentId)
  if (!parsed.success) {
    return { success: false, error: parsed.error.message }
  }

  const identifierHash = hashIdentifier(parsed.data)

  try {
    const student = await prisma.student.findUnique({
      where: { studentId: parsed.data },
      include: {
        permits: {
          orderBy: { expiryDate: 'desc' }
        }
      }
    })

    if (!student) {
      const result = buildResult({
        outcome: 'denied',
        reason: 'student_not_found',
        message: 'Student not found',
        method: 'student_id',
        checkedAt
      })
      await createVerificationLog({
        method: 'student_id',
        result: 'not_found',
        identifierHash,
        reason: result.reason,
        verifierUserId,
        metadata: { message: result.message, outcome: result.outcome }
      })
      return { success: true, data: result }
    }

    const result = await evaluateStudentPermit({
      student,
      method: 'student_id',
      checkedAt
    })

    await createVerificationLog({
      method: 'student_id',
      result: mapReasonToLogResult(result.reason),
      identifierHash,
      reason: result.reason,
      studentId: student.id,
      permitId: result.permit?.id,
      verifierUserId,
      metadata: { message: result.message, outcome: result.outcome }
    })

    return { success: true, data: result }
  } catch (error) {
    log.error('Student ID verification failed:', error)
    return handleError(error)
  }
}

export async function verifyByCardUid(
  uid: string,
  verifierUserId?: number
): Promise<ServiceResponse<NormalizedVerificationResult>> {
  const checkedAt = new Date()
  const parsed = uidSchema.safeParse(uid)
  if (!parsed.success) {
    return { success: false, error: parsed.error.message }
  }

  const identifierHash = hashUid(parsed.data)

  try {
    const card = await prisma.nfcCard.findUnique({
      where: { uidHash: identifierHash },
      include: {
        student: {
          include: {
            permits: {
              orderBy: { expiryDate: 'desc' }
            }
          }
        }
      }
    })

    if (!card) {
      const result = buildResult({
        outcome: 'denied',
        reason: 'card_not_found',
        message: 'NFC card not found',
        method: 'nfc_uid',
        checkedAt
      })
      await createVerificationLog({
        method: 'nfc',
        result: 'not_found',
        identifierHash,
        reason: result.reason,
        verifierUserId,
        metadata: { message: result.message, outcome: result.outcome }
      })
      return { success: true, data: result }
    }

    if (card.status !== 'active') {
      const result = buildResult({
        outcome: 'denied',
        reason: 'card_inactive',
        message: 'NFC card is not active',
        method: 'nfc_uid',
        checkedAt,
        student: card.student,
        card
      })
      await createVerificationLog({
        method: 'nfc',
        result: 'card_inactive',
        identifierHash,
        reason: result.reason,
        studentId: card.studentId,
        cardId: card.id,
        verifierUserId,
        metadata: { message: result.message, outcome: result.outcome }
      })
      return { success: true, data: result }
    }

    const result = await evaluateStudentPermit({
      student: card.student,
      card,
      method: 'nfc_uid',
      checkedAt
    })

    await createVerificationLog({
      method: 'nfc',
      result: mapReasonToLogResult(result.reason),
      identifierHash,
      reason: result.reason,
      studentId: card.studentId,
      permitId: result.permit?.id,
      cardId: card.id,
      verifierUserId,
      metadata: { message: result.message, outcome: result.outcome }
    })

    return { success: true, data: result }
  } catch (error) {
    log.error('NFC card verification failed:', error)
    return handleError(error)
  }
}

export async function verifyByPermitCode(
  code: string,
  verifierUserId?: number
): Promise<ServiceResponse<NormalizedVerificationResult>> {
  const checkedAt = new Date()
  const parsed = permitCodeSchema.safeParse(code)
  if (!parsed.success) {
    return { success: false, error: parsed.error.message }
  }

  const normalizedCode = parsed.data.trim()
  const identifierHash = hashIdentifier(normalizedCode)

  try {
    const permit = await findPermitByCode(normalizedCode)

    if (!permit) {
      const result = buildResult({
        outcome: 'denied',
        reason: 'permit_not_found',
        message: 'Permit not found',
        method: 'permit_code',
        checkedAt
      })
      await createVerificationLog({
        method: 'permit_code',
        result: 'not_found',
        identifierHash,
        reason: result.reason,
        verifierUserId,
        metadata: { message: result.message, outcome: result.outcome }
      })
      return { success: true, data: result }
    }

    const result = await evaluatePermit({
      permit,
      student: permit.student,
      method: 'permit_code',
      checkedAt
    })

    await createVerificationLog({
      method: 'permit_code',
      result: mapReasonToLogResult(result.reason),
      identifierHash,
      reason: result.reason,
      studentId: permit.studentId,
      permitId: permit.id,
      verifierUserId,
      metadata: { message: result.message, outcome: result.outcome }
    })

    return { success: true, data: result }
  } catch (error) {
    log.error('Permit code verification failed:', error)
    return handleError(error)
  }
}

async function evaluateStudentPermit(params: {
  student: StudentWithPermits
  card?: NfcCard
  method: NormalizedMethod
  checkedAt: Date
}): Promise<NormalizedVerificationResult> {
  const activePermits = params.student.permits.filter((permit) => permit.status === 'active')
  const validPermit = activePermits.find((permit) => permit.expiryDate > params.checkedAt)

  if (validPermit) {
    return buildResult({
      outcome: 'allowed',
      reason: 'valid_permit',
      message: 'Active permit verified',
      method: params.method,
      checkedAt: params.checkedAt,
      student: params.student,
      permit: validPermit,
      card: params.card
    })
  }

  const expiredActivePermit = activePermits[0]
  if (expiredActivePermit) {
    await markPermitExpired(expiredActivePermit)
    return buildResult({
      outcome: 'warning',
      reason: 'permit_expired',
      message: 'Permit exists but has expired',
      method: params.method,
      checkedAt: params.checkedAt,
      student: params.student,
      permit: { ...expiredActivePermit, status: 'expired' },
      card: params.card
    })
  }

  return buildResult({
    outcome: 'denied',
    reason: 'no_active_permit',
    message: 'No active permit found for student',
    method: params.method,
    checkedAt: params.checkedAt,
    student: params.student,
    permit: params.student.permits[0],
    card: params.card
  })
}

async function evaluatePermit(params: {
  permit: Permit
  student: Student
  method: NormalizedMethod
  checkedAt: Date
}): Promise<NormalizedVerificationResult> {
  const { permit, student, method, checkedAt } = params

  if (permit.status === 'active' && permit.expiryDate > checkedAt) {
    return buildResult({
      outcome: 'allowed',
      reason: 'valid_permit',
      message: 'Active permit verified',
      method,
      checkedAt,
      student,
      permit
    })
  }

  if (permit.status === 'active' && permit.expiryDate <= checkedAt) {
    await markPermitExpired(permit)
    return buildResult({
      outcome: 'warning',
      reason: 'permit_expired',
      message: 'Permit exists but has expired',
      method,
      checkedAt,
      student,
      permit: { ...permit, status: 'expired' }
    })
  }

  if (permit.status === 'revoked') {
    return buildResult({
      outcome: 'denied',
      reason: 'permit_revoked',
      message: 'Permit has been revoked',
      method,
      checkedAt,
      student,
      permit
    })
  }

  return buildResult({
    outcome: 'warning',
    reason: 'permit_expired',
    message: 'Permit has expired',
    method,
    checkedAt,
    student,
    permit
  })
}



async function createVerificationLog(input: {
  method: VerificationMethod
  result: VerificationResult
  identifierHash: string
  reason: string
  studentId?: number
  permitId?: number
  cardId?: number
  verifierUserId?: number
  metadata?: Prisma.InputJsonObject
}) {
  await prisma.verificationLog.create({
    data: {
      method: input.method,
      result: input.result,
      identifierHash: input.identifierHash,
      reason: input.reason,
      studentId: input.studentId,
      permitId: input.permitId,
      cardId: input.cardId,
      verifierUserId: input.verifierUserId,
      metadata: input.metadata
    }
  })
}

async function markPermitExpired(permit: Permit) {
  if (permit.status !== 'active') {
    return
  }

  await prisma.permit.update({
    where: { id: permit.id },
    data: { status: 'expired' }
  })
}

async function findPermitByCode(code: string): Promise<PermitWithStudent | null> {
  const exactPermit = await prisma.permit.findUnique({
    where: { originalCode: code },
    include: { student: true }
  })

  if (exactPermit) {
    return exactPermit
  }

  const candidates = await prisma.permit.findMany({
    where: {
      OR: [
        { permitHash: code },
        { originalCode: { contains: code.slice(-4) } }
      ]
    },
    take: 100,
    include: { student: true },
    orderBy: { createdAt: 'desc' }
  })

  for (const candidate of candidates) {
    const isMatch = await bcrypt.compare(code, candidate.permitCode)
    if (isMatch) {
      return candidate
    }
  }

  return null
}
