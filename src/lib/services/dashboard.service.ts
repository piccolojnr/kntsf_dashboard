"use server"
import { log } from "../logger"
import prisma from "../prisma/client"
import type { ServiceResponse } from "../types/common"
import { handleError } from "../utils"

export interface DashboardStats {
  // Student & User Stats
  totalStudents: number
  totalUsers: number

  // Permit Stats
  activePermits: number
  expiringSoon: number
  totalPermitRevenue: number

  // Active Permits Detailed Stats
  activePermitsToday: number
  activePermitsThisWeek: number
  activePermitsThisMonth: number
  activePermitsRevenue: number
  averagePermitDuration: number
  recentlyIssuedPermits: number // Last 7 days

  // Newsletter Stats
  totalNewsletters: number
  sentNewsletters: number
  totalSubscribers: number
  activeSubscribers: number

  // Document Stats
  totalDocuments: number
  totalDownloads: number

  // Student Ideas Stats
  totalIdeas: number
  pendingIdeas: number
  approvedIdeas: number

  // News & Events Stats
  totalNewsArticles: number
  publishedArticles: number
  totalEvents: number
  upcomingEvents: number

  // Payment Stats
  totalPayments: number
  successfulPayments: number
  totalRevenue: number
  pendingPayments: number
}

export async function getStats(): Promise<ServiceResponse<DashboardStats>> {
  try {
    // Get permit statistics
    const permitStats = await prisma.permit.groupBy({
      by: ["status", "expiryDate"],
      _count: true,
      _sum: {
        amountPaid: true,
      },
    })

    // Get payment statistics
    const paymentStats = await prisma.payment.groupBy({
      by: ["status"],
      _count: true,
      _sum: {
        amount: true,
      },
      where: {
        status: "SUCCESS",
        student: {
          deletedAt: null, // Ensure we only count payments for active students
        }
      }
    })

    // Get newsletter statistics
    const newsletterStats = await prisma.newsletter.groupBy({
      by: ["status"],
      _count: true,
    })

    const subscriberStats = await prisma.newsletterSubscriber.groupBy({
      by: ["status"],
      _count: true,
    })

    // Get student ideas statistics
    const ideaStats = await prisma.studentIdea.groupBy({
      by: ["status"],
      _count: true,
    })

    // Get news articles statistics
    const newsStats = await prisma.newsArticle.groupBy({
      by: ["published"],
      _count: true,
    })

    // Basic counts
    const [totalStudents, totalUsers, totalDocuments, totalDownloads, totalEvents, upcomingEvents] = await Promise.all([
      prisma.student.count(),
      prisma.user.count(),
      prisma.document.count(),
      prisma.document.aggregate({ _sum: { downloads: true } }),
      prisma.event.count(),
      prisma.event.count({
        where: {
          date: {
            gte: new Date(),
          },
          published: true,
        },
      }),
    ])

    // Get expiring permits (within 7 days)
    const now = new Date()
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const startOfWeek = new Date(now.getTime() - (now.getDay() * 24 * 60 * 60 * 1000))
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const expiringPermits = await prisma.permit.count({
      where: {
        status: "active",
        expiryDate: {
          gt: now,
          lte: sevenDaysFromNow,
        },
      },
    })

    // Get detailed active permit statistics
    const [
      activePermitsToday,
      activePermitsThisWeek,
      activePermitsThisMonth,
      activePermitsRevenue,
      recentlyIssuedPermits
    ] = await Promise.all([
      prisma.permit.count({
        where: {
          status: "active",
          expiryDate: { gt: now },
          startDate: { gte: startOfToday },
        },
      }),
      prisma.permit.count({
        where: {
          status: "active",
          expiryDate: { gt: now },
          startDate: { gte: startOfWeek },
        },
      }),
      prisma.permit.count({
        where: {
          status: "active",
          expiryDate: { gt: now },
          startDate: { gte: startOfMonth },
        },
      }),
      prisma.permit.aggregate({
        where: {
          status: "active",
          expiryDate: { gt: now },
        },
        _sum: {
          amountPaid: true,
        },
      }),
      prisma.permit.count({
        where: {
          status: "active",
          createdAt: { gte: sevenDaysAgo },
        },
      }),
    ])

    // Calculate average permit duration for active permits
    const activePermitsWithDuration = await prisma.permit.findMany({
      where: {
        status: "active",
        expiryDate: { gt: now },
      },
      select: {
        startDate: true,
        expiryDate: true,
      },
    })

    const averagePermitDuration = activePermitsWithDuration.length > 0
      ? activePermitsWithDuration.reduce((sum, permit) => {
        const duration = (permit.expiryDate.getTime() - permit.startDate.getTime()) / (1000 * 60 * 60 * 24) // days
        return sum + duration
      }, 0) / activePermitsWithDuration.length
      : 0

    // current date
    const currentDate = new Date();

    // Calculate stats
    const stats: DashboardStats = {
      // Student & User Stats
      totalStudents,
      totalUsers,

      // Permit Stats
      activePermits: permitStats.find((stat) => stat.status === "active" && stat.expiryDate > currentDate)?._count || 0,
      expiringSoon: expiringPermits,
      totalPermitRevenue: permitStats.reduce((sum, stat) => sum + (stat._sum.amountPaid || 0), 0),

      // Active Permits Detailed Stats
      activePermitsToday,
      activePermitsThisWeek,
      activePermitsThisMonth,
      activePermitsRevenue: activePermitsRevenue._sum.amountPaid || 0,
      averagePermitDuration: Math.round(averagePermitDuration),
      recentlyIssuedPermits,

      // Newsletter Stats
      totalNewsletters: newsletterStats.reduce((sum, stat) => sum + stat._count, 0),
      sentNewsletters: newsletterStats.find((stat) => stat.status === "SENT")?._count || 0,
      totalSubscribers: subscriberStats.reduce((sum, stat) => sum + stat._count, 0),
      activeSubscribers: subscriberStats.find((stat) => stat.status === "ACTIVE")?._count || 0,

      // Document Stats
      totalDocuments,
      totalDownloads: totalDownloads._sum.downloads || 0,

      // Student Ideas Stats
      totalIdeas: ideaStats.reduce((sum, stat) => sum + stat._count, 0),
      pendingIdeas: ideaStats.find((stat) => stat.status === "PENDING")?._count || 0,
      approvedIdeas: ideaStats.find((stat) => stat.status === "APPROVED")?._count || 0,

      // News & Events Stats
      totalNewsArticles: newsStats.reduce((sum, stat) => sum + stat._count, 0),
      publishedArticles: newsStats.find((stat) => stat.published === true)?._count || 0,
      totalEvents,
      upcomingEvents,

      // Payment Stats
      totalPayments: paymentStats.reduce((sum, stat) => sum + stat._count, 0),
      successfulPayments: paymentStats.find((stat) => stat.status === "SUCCESS")?._count || 0,
      totalRevenue: paymentStats.reduce((sum, stat) => sum + (stat._sum.amount || 0), 0),
      pendingPayments: paymentStats.find((stat) => stat.status === "PENDING")?._count || 0,
    }

    return {
      success: true,
      data: stats,
    }
  } catch (error) {
    log.error("Failed to get dashboard stats:", error)
    return handleError(error)
  }
}

export async function getRecentActivity(): Promise<ServiceResponse<any[]>> {
  try {
    // Get recent activities from different modules
    const [recentPermits, recentNewsletters, recentIdeas, recentPayments] = await Promise.all([
      prisma.permit.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          student: { select: { name: true, studentId: true } },
          issuedBy: { select: { name: true } },
        },
      }),
      prisma.newsletter.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          sentBy: { select: { name: true } },
        },
      }),
      prisma.studentIdea.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          student: { select: { name: true, studentId: true } },
        },
      }),
      prisma.payment.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          student: { select: { name: true, studentId: true } },
        },
        where: {
          status: "SUCCESS",
          student: {
            deletedAt: null, // Ensure we only count payments for active students
          }
        }
      }),
    ])

    // Combine and format activities
    const activities = [
      ...recentPermits.map((permit) => ({
        id: `permit-${permit.id}`,
        type: "permit",
        title: `New permit issued to ${permit.student.name}`,
        description: `Permit ${permit.originalCode} - ${permit.status}`,
        timestamp: permit.createdAt,
        user: permit.issuedBy?.name || "System",
      })),
      ...recentNewsletters.map((newsletter) => ({
        id: `newsletter-${newsletter.id}`,
        type: "newsletter",
        title: newsletter.title,
        description: `Newsletter ${newsletter.status.toLowerCase()}`,
        timestamp: newsletter.createdAt,
        user: newsletter.sentBy.name,
      })),
      ...recentIdeas.map((idea) => ({
        id: `idea-${idea.id}`,
        type: "idea",
        title: `New idea: ${idea.title}`,
        description: `Status: ${idea.status.toLowerCase()}`,
        timestamp: idea.createdAt,
        user: idea.student.name,
      })),
      ...recentPayments.map((payment) => ({
        id: `payment-${payment.id}`,
        type: "payment",
        title: `Payment from ${payment.student.name}`,
        description: `GHS ${payment.amount} - ${payment.status.toLowerCase()}`,
        timestamp: payment.createdAt,
        user: payment.student.name,
      })),
    ]

    // Sort by timestamp and take latest 10
    const sortedActivities = activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10)

    return {
      success: true,
      data: sortedActivities,
    }
  } catch (error) {
    log.error("Failed to get recent activity:", error)
    return handleError(error)
  }
}
