import * as z from 'zod'

export const studentFormSchema = z.object({
  studentId: z.string().min(1, 'Student ID is required'),
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  course: z.string().min(1, 'Course is required'),
  level: z.string().min(1, 'Level is required'),
  number: z.string().min(1, 'Phone number is required')
})

export type StudentFormValues = z.infer<typeof studentFormSchema>

export interface CreateStudentData extends Omit<StudentFormValues, 'studentId'> {
  studentId: number
  createdById: number
}
