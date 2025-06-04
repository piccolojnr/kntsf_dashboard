// settings.service.ts
import { log } from '../logger'
import { prisma } from '../prisma/client'
export class SettingsService {
  checkDatabaseConnection = async (): Promise<boolean> => {
    try {
      await prisma.$connect()
      return true
    } catch (error) {
      // Log the error for debugging purposes
      log.error('Database connection error:', error)
      return false
    }
  }
}
