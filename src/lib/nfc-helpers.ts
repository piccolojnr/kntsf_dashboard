
import { createHash, createHmac } from 'crypto'
import {
    NfcCard,
    Permit,
    Student,
    VerificationResult
} from '@prisma/client'


export type NormalizedMethod = 'student_id' | 'nfc_uid' | 'permit_code'
export type VerificationOutcome = 'allowed' | 'denied' | 'warning'


type StudentSummary = Pick<Student, 'id' | 'studentId' | 'name' | 'email' | 'course' | 'level'>
type PermitSummary = Pick<Permit, 'id' | 'status' | 'startDate' | 'expiryDate' | 'amountPaid' | 'createdAt'>
type CardSummary = Pick<NfcCard, 'id' | 'uidLast4' | 'status' | 'issuedAt' | 'activatedAt' | 'deactivatedAt'>



export interface NormalizedVerificationResult {
    outcome: VerificationOutcome
    reason: string
    message: string
    student?: StudentSummary
    permit?: PermitSummary
    card?: CardSummary
    method: NormalizedMethod
    checkedAt: Date
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


function normalizeUid(uid: string): string {
    return uid.trim().replace(/[\s:-]/g, '').toUpperCase()
}


export function buildResult(params: {
    outcome: VerificationOutcome
    reason: string
    message: string
    method: NormalizedMethod
    checkedAt: Date
    student?: Student
    permit?: Permit
    card?: NfcCard
}): NormalizedVerificationResult {
    return {
        outcome: params.outcome,
        reason: params.reason,
        message: params.message,
        student: params.student ? summarizeStudent(params.student) : undefined,
        permit: params.permit ? summarizePermit(params.permit) : undefined,
        card: params.card ? summarizeCard(params.card) : undefined,
        method: params.method,
        checkedAt: params.checkedAt
    }
}


export function mapReasonToLogResult(reason: string): VerificationResult {
    switch (reason) {
        case 'valid_permit':
            return 'valid'
        case 'permit_expired':
            return 'expired'
        case 'permit_revoked':
            return 'revoked'
        case 'card_inactive':
            return 'card_inactive'
        case 'student_not_found':
        case 'card_not_found':
        case 'permit_not_found':
            return 'not_found'
        case 'no_active_permit':
            return 'invalid'
        default:
            return 'error'
    }
}

export function hashIdentifier(identifier: string): string {
    return createHash('sha256').update(identifier.trim()).digest('hex')
}

function summarizeStudent(student: Student): StudentSummary {
    return {
        id: student.id,
        studentId: student.studentId,
        name: student.name,
        email: student.email,
        course: student.course,
        level: student.level
    }
}

function summarizePermit(permit: Permit): PermitSummary {
    return {
        id: permit.id,
        status: permit.status,
        startDate: permit.startDate,
        expiryDate: permit.expiryDate,
        amountPaid: permit.amountPaid,
        createdAt: permit.createdAt
    }
}

function summarizeCard(card: NfcCard): CardSummary {
    return {
        id: card.id,
        uidLast4: card.uidLast4,
        status: card.status,
        issuedAt: card.issuedAt,
        activatedAt: card.activatedAt,
        deactivatedAt: card.deactivatedAt
    }
}
