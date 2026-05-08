import { z } from 'zod'

export const uidSchema = z.string().trim().min(1, 'NFC UID is required')

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
    status: z.enum(['inactive', 'revoked', 'lost', 'stolen', 'damaged']).default('revoked')
}).refine((data) => data.cardId || data.uid, {
    message: 'Either cardId or uid is required'
})

export const studentIdSchema = z.string().trim().min(1, 'Student ID is required')
export const permitCodeSchema = z.string().trim().min(1, 'Permit code is required')


export type RegisterCardForStudentInput = z.infer<typeof registerCardForStudentSchema>
export type ReplaceCardForStudentInput = z.infer<typeof replaceCardForStudentSchema>
export type RevokeCardInput = z.infer<typeof revokeCardSchema>
