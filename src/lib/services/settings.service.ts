'use server'
import { log } from '../logger'
import prisma from '../prisma/client'
import { ServiceResponse } from '../types/common'
import { handleError } from '../utils'

export async function checkDatabaseConnection(): Promise<ServiceResponse<boolean>> {
  try {
    await prisma.$connect()
    return { success: true, data: true }
  } catch (error) {
    log.error('Database connection error:', error)
    return handleError(error)
  }
}
