'use server'

import { createHash, createHmac } from 'crypto'
import { NfcCard, NfcCardStatus } from '@prisma/client'
import { z } from 'zod'
import prisma from '../prisma/client'
import { log } from '../logger'
import { handleError } from '../utils'
import { ServiceResponse } from '../types/common'

const activeStatus: NfcCardStatus = 'active'
const inactiveStatus: NfcCardStatus = 'inactive'
const replacedStatus: NfcCardStatus = 'replaced'

const uidSchema = z.string().trim().min(1, 'NFC UID is required')

const studentIdentifierSchema = z.union([
  z.number().int().positive(),
  z.string().trim().min(1, 'Student ID is required')
])

export const registerCardForStudentSchema = z.object({
  studentId: studentIdentifierSchema,
  uid: uidSchema
})

export const replaceCardForStudentSchema = z.object({
  studentId: studentIdentifierSchema,
  uid: uidSchema
})

export const revokeCardSchema = z.object({
  cardId: z.number().int().positive().optional(),
  uid: uidSchema.optional(),
  status: z.enum(['inactive', 'lost', 'stolen', 'damaged']).default('inactive')
}).refine((data) => data.cardId || data.uid, {
  message: 'Either cardId or uid is required'
})

export type RegisterCardForStudentInput = z.infer<typeof registerCardForStudentSchema>
export type ReplaceCardForStudentInput = z.infer<typeof replaceCardForStudentSchema>
export type RevokeCardInput = z.infer<typeof revokeCardSchema>

export type NfcCardWithStudent = NfcCard & {
  student: {
    id: number
    studentId: string
    name: string | null
    email: string | null
    course: string | null
    level: string | null
  }
}

export function hashUid(uid: string): string {
  const normalizedUid = normalizeUid(uid)
  const secret = process.env.NFC_UID_HASH_SECRET || process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET

  if (secret) {
    return createHmac('sha256', secret).update(normalizedUid).digest('hex')
  }

  return createHash('sha256').update(normalizedUid).digest('hex')
}

export function getUidLast4(uid: string): string {
  return normalizeUid(uid).slice(-4)
}

export async function registerCardForStudent(
  input: RegisterCardForStudentInput
): Promise<ServiceResponse<NfcCard>> {
  const parsed = registerCardForStudentSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: parsed.error.message }
  }

  try {
    const { studentId, uid } = parsed.data
    const student = await resolveStudent(studentId)
    if (!student) {
      return { success: false, error: 'Student not found' }
    }

    const uidHash = hashUid(uid)
    const uidLast4 = getUidLast4(uid)
    const now = new Date()

    const card = await prisma.$transaction(async (tx) => {
      const existingCard = await tx.nfcCard.findUnique({
        where: { uidHash }
      })

      if (existingCard && existingCard.studentId !== student.id) {
        if (existingCard.status === activeStatus) {
          throw new Error('NFC UID is already active for another student')
        }
        throw new Error('NFC UID is already registered to another student')
      }

      if (existingCard?.status === activeStatus) {
        return existingCard
      }

      await tx.nfcCard.updateMany({
        where: {
          studentId: student.id,
          status: activeStatus,
          ...(existingCard ? { id: { not: existingCard.id } } : {})
        },
        data: {
          status: inactiveStatus,
          deactivatedAt: now
        }
      })

      if (existingCard) {
        return tx.nfcCard.update({
          where: { id: existingCard.id },
          data: {
            status: activeStatus,
            uidLast4,
            activatedAt: now,
            deactivatedAt: null,
            replacedAt: null,
            lostAt: null
          }
        })
      }

      return tx.nfcCard.create({
        data: {
          studentId: student.id,
          uidHash,
          uidLast4,
          status: activeStatus,
          issuedAt: now,
          activatedAt: now
        }
      })
    })

    return { success: true, data: card }
  } catch (error) {
    log.error('Failed to register NFC card:', error)
    return handleError(error)
  }
}

export async function replaceCardForStudent(
  input: ReplaceCardForStudentInput
): Promise<ServiceResponse<NfcCard>> {
  const parsed = replaceCardForStudentSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: parsed.error.message }
  }

  try {
    const { studentId, uid } = parsed.data
    const student = await resolveStudent(studentId)
    if (!student) {
      return { success: false, error: 'Student not found' }
    }

    const uidHash = hashUid(uid)
    const uidLast4 = getUidLast4(uid)
    const now = new Date()

    const card = await prisma.$transaction(async (tx) => {
      const existingCard = await tx.nfcCard.findUnique({
        where: { uidHash }
      })

      if (existingCard && existingCard.studentId !== student.id) {
        if (existingCard.status === activeStatus) {
          throw new Error('NFC UID is already active for another student')
        }
        throw new Error('NFC UID is already registered to another student')
      }

      await tx.nfcCard.updateMany({
        where: {
          studentId: student.id,
          status: activeStatus,
          ...(existingCard ? { id: { not: existingCard.id } } : {})
        },
        data: {
          status: replacedStatus,
          deactivatedAt: now,
          replacedAt: now
        }
      })

      if (existingCard) {
        return tx.nfcCard.update({
          where: { id: existingCard.id },
          data: {
            status: activeStatus,
            uidLast4,
            activatedAt: now,
            deactivatedAt: null,
            replacedAt: null,
            lostAt: null
          }
        })
      }

      return tx.nfcCard.create({
        data: {
          studentId: student.id,
          uidHash,
          uidLast4,
          status: activeStatus,
          issuedAt: now,
          activatedAt: now
        }
      })
    })

    return { success: true, data: card }
  } catch (error) {
    log.error('Failed to replace NFC card:', error)
    return handleError(error)
  }
}

export async function revokeCard(input: RevokeCardInput): Promise<ServiceResponse<NfcCard>> {
  const parsed = revokeCardSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: parsed.error.message }
  }

  try {
    const { cardId, uid, status } = parsed.data
    const card = cardId
      ? await prisma.nfcCard.findUnique({ where: { id: cardId } })
      : await prisma.nfcCard.findUnique({ where: { uidHash: hashUid(uid!) } })

    if (!card) {
      return { success: false, error: 'NFC card not found' }
    }

    const now = new Date()
    const updatedCard = await prisma.nfcCard.update({
      where: { id: card.id },
      data: {
        status,
        deactivatedAt: now,
        lostAt: status === 'lost' ? now : card.lostAt
      }
    })

    return { success: true, data: updatedCard }
  } catch (error) {
    log.error('Failed to revoke NFC card:', error)
    return handleError(error)
  }
}

export async function getActiveCardForStudent(
  studentId: string | number
): Promise<ServiceResponse<NfcCard | null>> {
  try {
    const student = await resolveStudent(studentId)
    if (!student) {
      return { success: false, error: 'Student not found' }
    }

    const card = await prisma.nfcCard.findFirst({
      where: {
        studentId: student.id,
        status: activeStatus
      },
      orderBy: { activatedAt: 'desc' }
    })

    return { success: true, data: card }
  } catch (error) {
    log.error('Failed to fetch active NFC card:', error)
    return handleError(error)
  }
}

export async function getCardByUid(uid: string): Promise<ServiceResponse<NfcCardWithStudent | null>> {
  const parsed = uidSchema.safeParse(uid)
  if (!parsed.success) {
    return { success: false, error: parsed.error.message }
  }

  try {
    const card = await prisma.nfcCard.findUnique({
      where: { uidHash: hashUid(parsed.data) },
      include: {
        student: {
          select: {
            id: true,
            studentId: true,
            name: true,
            email: true,
            course: true,
            level: true
          }
        }
      }
    })

    return { success: true, data: card }
  } catch (error) {
    log.error('Failed to fetch NFC card by UID:', error)
    return handleError(error)
  }
}

function normalizeUid(uid: string): string {
  return uid.trim().replace(/[\s:-]/g, '').toUpperCase()
}

async function resolveStudent(studentId: string | number) {
  if (typeof studentId === 'number') {
    return prisma.student.findUnique({
      where: { id: studentId }
    })
  }

  return prisma.student.findUnique({
    where: { studentId }
  })
}
