'use server'
import { log } from '../logger'
import prisma from '../prisma/client'
import { ServiceResponse } from '../types/common'

export interface AuditLogData {
  userId: number
  action: string
  details: string
}

export async function create(logData: AuditLogData): Promise<ServiceResponse> {
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
    return { success: true, data: log }
  } catch (error) {
    log.error('Failed to create audit log:', error)
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function getById(logId: number): Promise<ServiceResponse> {
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
    return { success: true, data: log }
  } catch (error) {
    log.error('Failed to retrieve audit log:', error)
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function getByUser(userId: number): Promise<ServiceResponse> {
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
    return { success: true, data: logs }
  } catch (error) {
    log.error('Failed to retrieve audit logs by user:', error)
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function getByAction(action: string): Promise<ServiceResponse> {
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
    return { success: true, data: logs }
  } catch (error) {
    log.error('Failed to retrieve audit logs by action:', error)
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function getAll(): Promise<ServiceResponse> {
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
    return { success: true, data: logs }
  } catch (error) {
    log.error('Failed to retrieve all audit logs:', error)
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function getsByDateRange(startDate: Date, endDate: Date): Promise<ServiceResponse> {
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
    return { success: true, data: logs }
  } catch (error) {
    log.error('Failed to retrieve audit logs by date range:', error)
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'An unexpected error occurred' }
  }
}
