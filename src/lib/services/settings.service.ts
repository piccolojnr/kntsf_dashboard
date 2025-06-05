'use server'
import { log } from '../logger'
import prisma from '../prisma/client'
import { ServiceResponse } from '../types/common'

export async function checkDatabaseConnection(): Promise<ServiceResponse<boolean>> {
  try {
    await prisma.$connect()
    return { success: true, data: true }
  } catch (error) {
    log.error('Database connection error:', error)
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'An unexpected error occurred' }
  }
}
