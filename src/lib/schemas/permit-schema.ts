import * as z from 'zod'

export const permitFormSchema = z.object({
  studentId: z
    .string()
    .min(1, 'Student ID is required')
    .regex(/^\d+$/, 'Student ID must contain only numbers'),
  semester: z
    .string()
    .min(1, 'Semester is required')
    .regex(/^(1st|2nd|3rd|4th|5th|6th) semester$/, 'Invalid semester format'),

})

export type PermitFormValues = z.infer<typeof permitFormSchema>

export type CreatePermitData = Omit<PermitFormValues, 'amountPaid'>
