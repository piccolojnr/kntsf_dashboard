import { log } from '../logger'
import { prisma } from '../prisma/client'

export interface AuditLogData {
  userId: number
  action: string
  details: string
}

export interface AuditLogResponse {
  success: boolean
  log?: any
  error?: string
}

export class AuditService {
  static async createLog(logData: AuditLogData): Promise<AuditLogResponse> {
    try {
      const log = await prisma.auditLog.create({
        data: logData,
        include: {
          user: {
            select: {
              username: true,
              email: true,
              role: {
                select: {
                  name: true
                }
              }
            }
          }
        }
      })
      return { success: true, log }
    } catch (error) {
      log.error('Failed to create audit log:', error)
      if (error instanceof Error) {
        return { success: false, error: error.message }
      }
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  static async getLogById(logId: number): Promise<AuditLogResponse> {
    try {
      const log = await prisma.auditLog.findUnique({
        where: { id: logId },
        include: {
          user: {
            select: {
              username: true,
              email: true,
              role: {
                select: {
                  name: true
                }
              }
            }
          }
        }
      })
      if (!log) {
        throw new Error('Log not found')
      }
      return { success: true, log }
    } catch (error) {
      log.error('Failed to retrieve audit log:', error)
      if (error instanceof Error) {
        return { success: false, error: error.message }
      }
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  static async getLogsByUser(userId: number): Promise<AuditLogResponse> {
    try {
      const logs = await prisma.auditLog.findMany({
        where: { userId },
        include: {
          user: {
            select: {
              username: true,
              email: true,
              role: {
                select: {
                  name: true
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
      return { success: true, log: logs }
    } catch (error) {
      log.error('Failed to retrieve audit logs by user:', error)
      if (error instanceof Error) {
        return { success: false, error: error.message }
      }
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  static async getLogsByAction(action: string): Promise<AuditLogResponse> {
    try {
      const logs = await prisma.auditLog.findMany({
        where: { action },
        include: {
          user: {
            select: {
              username: true,
              email: true,
              role: {
                select: {
                  name: true
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
      return { success: true, log: logs }
    } catch (error) {
      log.error('Failed to retrieve audit logs by action:', error)
      if (error instanceof Error) {
        return { success: false, error: error.message }
      }
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  static async getAllLogs(): Promise<AuditLogResponse> {
    try {
      const logs = await prisma.auditLog.findMany({
        include: {
          user: {
            select: {
              username: true,
              email: true,
              role: {
                select: {
                  name: true
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
      return { success: true, log: logs }
    } catch (error) {
      log.error('Failed to retrieve all audit logs:', error)
      if (error instanceof Error) {
        return { success: false, error: error.message }
      }
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  static async getLogsByDateRange(startDate: Date, endDate: Date): Promise<AuditLogResponse> {
    try {
      const logs = await prisma.auditLog.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        },
        include: {
          user: {
            select: {
              username: true,
              email: true,
              role: {
                select: {
                  name: true
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
      return { success: true, log: logs }
    } catch (error) {
      log.error('Failed to retrieve audit logs by date range:', error)
      if (error instanceof Error) {
        return { success: false, error: error.message }
      }
      return { success: false, error: 'An unexpected error occurred' }
    }
  }
}
