import { log } from '../logger'
import { prisma } from '../prisma/client'

export interface DashboardStats {
  totalStudents: number
  activePermits: number
  expiringSoon: number
  totalRevenue: number
}

export class DashboardService {
  static async getStats(): Promise<{ success: boolean; data?: DashboardStats; error?: string }> {
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
        activePermits: permitStats.find((stat) => stat.status === 'active')?._count || 0,
        expiringSoon: expiringPermits,
        totalRevenue: permitStats.reduce((sum, stat) => sum + (stat._sum.amountPaid || 0), 0)
      }

      return {
        success: true,
        data: stats
      }
    } catch (error: any) {
      log.error('Failed to get dashboard stats:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }
}
