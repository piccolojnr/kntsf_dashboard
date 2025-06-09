'use server'
import { log } from '../logger'
import prisma from '../prisma/client'
import { ServiceResponse } from '../types/common'
import { handleError } from '../utils'

export interface DashboardStats {
  totalStudents: number
  activePermits: number
  expiringSoon: number
  totalRevenue: number
}

export async function getStats(): Promise<ServiceResponse<DashboardStats>> {
  try {
    // Get permit statistics
    const permitStats = await prisma.permit.groupBy({
      by: ['status'],
      _count: true,
      _sum: {
        amountPaid: true
      }
    })

    // Get total students
    const totalStudents = await prisma.student.count()

    // Get expiring permits (within 7 days)
    const now = new Date()
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

    const expiringPermits = await prisma.permit.count({
      where: {
        status: 'active',
        expiryDate: {
          gt: now,
          lte: sevenDaysFromNow
        }
      }
    })

    // Calculate stats
    const stats: DashboardStats = {
      totalStudents,
      activePermits: permitStats.find((stat: { status: string }) => stat.status === 'active')?._count || 0,
      expiringSoon: expiringPermits,
      totalRevenue: permitStats.reduce((sum: any, stat: { _sum: { amountPaid: any } }) => sum + (stat._sum.amountPaid || 0), 0)
    }

    return {
      success: true,
      data: stats
    }
  } catch (error) {
    log.error('Failed to get dashboard stats:', error)
    return handleError(error)

  }
}
