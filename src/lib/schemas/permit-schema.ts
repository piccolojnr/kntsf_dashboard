import * as z from 'zod'

export const permitFormSchema = z.object({
  studentId: z
    .string()
    .min(1, 'Student ID is required')
    .regex(/^\d+$/, 'Student ID must contain only numbers'),
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
  issuedById: number
}
