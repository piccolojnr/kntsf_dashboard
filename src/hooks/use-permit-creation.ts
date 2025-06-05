import { toast } from 'sonner'
import { CreatePermitData } from '../lib/schemas/permit-schema'
import services from '@/lib/services'

interface PermitEmailData {
  student: {
    email: string
    name: string
    studentId: string
    course: string
    level: string
  }
  permit: {
    id: string
    amountPaid: number
    expiryDate: Date
  }
  qrCode: string
  permitCode: string
}


export function usePermitCreation() {
  const createPermit = async (data: CreatePermitData) => {
    try {
      // API call to create permit
      const response = await services.permit.create(data)

      if (!response.success) {
        throw new Error(response.error || 'Failed to create permit')
      }

      toast.success('Permit created successfully')

      // Send emails if student email exists
      if (response.data?.student.email && response.data) {
        const permitResponse: PermitEmailData = {
          student: {
            email: response.data.student.email,
            name: response.data.student.name,
            studentId: response.data.student.studentId.toString(),
            course: response.data.student.course,
            level: response.data.student.level
          },
          permit: {
            id: response.data.id.toString(),
            amountPaid: response.data.amountPaid,
            expiryDate: response.data.expiryDate
          },
          qrCode: response.qrCode || '',
          permitCode: response.permitCode || ''
        }
        await services.email.sendPermitEmails(permitResponse)
      }

      return response
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to create permit. Please try again.'
      toast.error(message)
      throw error
    }
  }

  return { createPermit }
}
