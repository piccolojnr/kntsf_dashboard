import { toast } from 'sonner'
import { CreatePermitData } from '../lib/schemas/permit-schema'
import services from '@/lib/services'



export function usePermitCreation() {
  const createPermit = async (data: CreatePermitData) => {
    try {
      // API call to create permit
      const response = await services.permit.create(data)

      if (!response.success) {
        throw new Error(response.error || 'Failed to create permit')
      }

      toast.success('Permit created successfully')
      if (response.error) {
        toast.error(response.error)
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
