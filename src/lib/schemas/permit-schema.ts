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
  amountPaid: z
    .string()
    .min(1, 'Amount is required')
    .refine((val) => {
      const num = Number.parseFloat(val)
      return !isNaN(num) && num > 0
    }, 'Amount must be greater than 0'),
  expiryDate: z
    .date({
      required_error: 'Expiry date is required'
    })
    .refine((date) => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return date >= today
    }, 'Expiry date cannot be in the past')
})

export type PermitFormValues = z.infer<typeof permitFormSchema>

export interface CreatePermitData extends Omit<PermitFormValues, 'amountPaid'> {
  amountPaid: number
}
