'use server'
import prisma from '../prisma/client'
import bcrypt from 'bcryptjs'
import { BASE_URL } from '../constants'
import { log } from '../logger'
import { Permit, Prisma, Student } from "@prisma/client"
import { customAlphabet } from 'nanoid'
import { ServiceResponse, StudentPermit } from '../types/common'
import { getSession } from '../auth/auth'
import services from '.'
import { handleError } from '../utils'

// Simple in-memory cache for permit lookups
const permitCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

export interface PermitData {
  studentId: string
  paymentId?: number
  amountPaid?: number
  expiryDate?: Date
  email?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface PermitResponse {
  success: boolean
  data?: Permit & {
    student: Student
    issuedBy: {
      username: string
    } | null
  }
  permitCode?: string
  qrCode?: string
  error?: string
}

export async function getById(permitId: number): Promise<ServiceResponse<StudentPermit & { payment: any }>> {
  try {
    const permit = await prisma.permit.findUnique({
      where: { id: permitId },
      include: {
        student: true,
        issuedBy: {
          select: {
            username: true
          }
        },
        payment: true
      }
    })

    if (!permit) {
      return {
        success: false,
        error: 'Permit not found'
      }
    }

    return {
      success: true,
      data: permit
    }
  } catch (error: any) {
    log.error('Error fetching permit by ID:', error)
    return { success: false, error: error.message }
  }
}

export async function getAll(params: {
  page?: number
  pageSize?: number
  search?: string
  status?: string
  issuedBy?: string
}): Promise<{
  success: boolean

  data?: PaginatedResponse<
    StudentPermit
  >
  error?: string
}> {
  try {
    const { page = 1, pageSize = 10, search, status, issuedBy } = params
    const where: Prisma.PermitWhereInput = {
      ...(status && status !== 'all' && { status }),
      ...(issuedBy && issuedBy !== 'all' && issuedBy !== 'Unknown' && {
        issuedBy: {
          username: { contains: issuedBy }
        }
      }),
      ...(issuedBy === 'Unknown' && {
        issuedBy: null
      }),
      ...(search && {
        OR: [
          { originalCode: { contains: search } },
          { student: { name: { contains: search } } },
          { student: { studentId: { contains: search } } }
        ]
      })
    }

    const skip = Math.max((page - 1) * pageSize, 0)
    const [total, permits] = await Promise.all([
      prisma.permit.count({ where }),
      prisma.permit.findMany({
        where,
        skip,
        take: pageSize,
        include: {
          student: true,
          issuedBy: {
            select: {
              username: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
    ])

    return {
      success: true,
      data: {
        data: permits,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize)
      }
    }
  } catch (error: any) {
    log.error('Error fetching permits:', error)
    return { success: false, error: error.message }
  }
}

export async function getUniqueIssuers(): Promise<ServiceResponse<string[]>> {
  try {
    // Get all unique usernames from users who have issued permits
    const issuersWithPermits = await prisma.permit.groupBy({
      by: ['issuedById'],
      where: {
        issuedById: {
          not: null
        }
      }
    });

    // Get usernames for these users
    const usernames = await Promise.all(
      issuersWithPermits.map(async (permit) => {
        const user = await prisma.user.findUnique({
          where: { id: permit.issuedById! },
          select: { username: true }
        });
        return user?.username;
      })
    );

    // Filter out undefined usernames and add "Unknown" for permits without issuers
    const validUsernames = usernames.filter((username): username is string => !!username);
    const allIssuers = [...validUsernames, 'Unknown'].sort();

    return {
      success: true,
      data: allIssuers
    };
  } catch (error: any) {
    log.error('Error fetching unique issuers:', error);
    return { success: false, error: error.message };
  }
}

// Find duplicate permits: same studentId with identical startDate and expiryDate
export async function getDuplicates(params: {
  page?: number
  pageSize?: number
}): Promise<ServiceResponse<PaginatedResponse<StudentPermit>>> {
  try {
    const { page = 1, pageSize = 10 } = params

    // MySQL-compatible raw queries for duplicate groups and total count
    const skip = Math.max((page - 1) * pageSize, 0)

    const totalRows = await prisma.$queryRaw<Array<{ total: bigint | number }>>`
      SELECT COUNT(*) AS total FROM (
        SELECT 1
        FROM Permit
        GROUP BY studentId, startDate, expiryDate
        HAVING COUNT(*) > 1
      ) AS dup
    `
    const totalVal = totalRows?.[0]?.total ?? 0
    const total = typeof totalVal === 'bigint' ? Number(totalVal) : (totalVal as number)
    const totalPages = Math.ceil(total / pageSize)

    const groupsPage = await prisma.$queryRaw<Array<{ studentId: number; startDate: Date; expiryDate: Date; cnt: bigint | number }>>`
      SELECT studentId, startDate, expiryDate, COUNT(*) AS cnt
      FROM Permit
      GROUP BY studentId, startDate, expiryDate
      HAVING COUNT(*) > 1
      ORDER BY startDate DESC, expiryDate DESC
      LIMIT ${pageSize} OFFSET ${skip}
    `

    if (!groupsPage || groupsPage.length === 0) {
      return {
        success: true,
        data: {
          data: [],
          total: total,
          page,
          pageSize,
          totalPages
        }
      }
    }

    // Build OR conditions for the paged groups and fetch matching permits
    const orConditions: Prisma.PermitWhereInput[] = groupsPage.map((g) => ({
      AND: [
        { studentId: g.studentId },
        { startDate: new Date(g.startDate) },
        { expiryDate: new Date(g.expiryDate) }
      ]
    }))

    const permits = await prisma.permit.findMany({
      where: { OR: orConditions },
      include: {
        student: true,
        issuedBy: {
          select: { username: true }
        }
      },
      orderBy: [{ startDate: 'desc' }, { expiryDate: 'desc' }]
    })

    return {
      success: true,
      data: {
        data: permits,
        total: total,
        page,
        pageSize,
        totalPages
      }
    }
  } catch (error: any) {
    log.error('Error fetching duplicate permits:', error)
    return { success: false, error: error.message }
  }
}

// Permits expiring within N days (default 30)
export async function getExpiringSoon(params: {
  days?: number
  page?: number
  pageSize?: number
}): Promise<ServiceResponse<PaginatedResponse<StudentPermit>>> {
  try {
    const { days = 30, page = 1, pageSize = 10 } = params
    const now = new Date()
    const until = new Date(now.getTime() + days * 24 * 60 * 60 * 1000)

    const where: Prisma.PermitWhereInput = {
      expiryDate: { lte: until, gte: now },
      status: 'active'
    }

    const skip = Math.max((page - 1) * pageSize, 0)
    const [total, permits] = await Promise.all([
      prisma.permit.count({ where }),
      prisma.permit.findMany({
        where,
        skip,
        take: pageSize,
        include: {
          student: true,
          issuedBy: {
            select: { username: true }
          }
        },
        orderBy: { expiryDate: 'asc' }
      })
    ])

    return {
      success: true,
      data: {
        data: permits,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize)
      }
    }
  } catch (error: any) {
    log.error('Error fetching expiring permits:', error)
    return { success: false, error: error.message }
  }
}

export async function create(permitData: PermitData): Promise<PermitResponse> {
  try {
    const session = await getSession()

    // check student id
    const student = await prisma.student.findUnique({
      where: { studentId: permitData.studentId }
    })

    if (!student) {
      return { success: false, error: 'Student not found' }
    }
    const code = generatePermitCode()
    const yearPrefix = new Date().getFullYear().toString().slice(-2)
    const permitCode = `${yearPrefix}-${code}`
    const hashedCode = await bcrypt.hash(permitCode, 10)

    // Generate a fast lookup hash (first 6 characters for quick search)
    const permitHash = permitCode.slice(-6)

    const config = await prisma.config.findFirst({
      where: {
        id: 1
      },
      include: {
        permitConfig: true
      }
    })

    if (!config) {
      return { success: false, error: 'Configuration not found' }
    }

    // Optionally update student email before creating permit
    const providedEmail = permitData.email?.trim()
    if (providedEmail) {
      await prisma.student.update({
        where: { id: student.id },
        data: { email: providedEmail }
      })
    }

    const permit = await prisma.permit.create({
      data: {
        permitCode: hashedCode,
        originalCode: permitCode,
        permitHash: permitHash,
        payment: permitData.paymentId ? { connect: { id: permitData.paymentId } } : undefined,
        expiryDate: config.permitConfig?.expirationDate || permitData.expiryDate || new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        amountPaid: config.permitConfig?.defaultAmount || permitData.amountPaid || 100,
        studentId: student.id,
        issuedById: session ? parseInt((session.user as any).id) : null,
        status: 'active'
      },
      include: {
        student: true,
        issuedBy: {
          select: {
            username: true
          }
        }
      }
    })

    // Generate QR Code
    const verificationUrl = `${BASE_URL}/permits/verify?code=${permitCode}`
    const qrCode = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(verificationUrl)}&size=200x200`

    const res = await services.email.sendPermitEmails({
      student: {
        email: providedEmail || student.email || '',
        name: student.name || '',
        studentId: student.studentId || '',
        course: student.course || '',
        level: student.level || ''
      },
      permit: {
        id: permit.id.toString(),
        amountPaid: permit.amountPaid,
        expiryDate: permit.expiryDate
      },
      qrCode,
      permitCode
    })


    if (!permitData.paymentId) {
      const newPayment = await prisma.payment.create({
        data: {
          amount: permit.amountPaid,
          status: 'SUCCESS',
          studentId: student.id,
          paymentReference: generatePaymentReference()
        }
      });

      await prisma.permit.update({
        where: { id: permit.id },
        data: {
          payment: { connect: { id: newPayment.id } }
        }
      });
    }

    return {
      success: true,
      qrCode,
      permitCode,
      data: permit,
      error: res.success ? undefined : res.error
    }
  } catch (error: any) {
    log.error('Error creating permit:', error)
    return handleError(error)

  }
}

export async function verify(permitCode: string): Promise<{
  valid: boolean
  permit?: Permit & {
    student: Student
    issuedBy: {
      username: string
    } | null
  }
  reason?: string
}> {
  try {
    // OPTIMIZATION: Use permitHash for faster lookups if available
    // First try to find by permitHash (if implemented)
    if (permitCode.length === 6) { // Assuming permit codes are 6 characters
      const permitByHash = await prisma.permit.findFirst({
        where: {
          permitHash: permitCode,
          status: 'active'
        },
        include: {
          student: true,
          issuedBy: {
            select: {
              username: true
            }
          }
        }
      })

      if (permitByHash) {
        // Verify the actual permit code
        const isValid = await bcrypt.compare(permitCode, permitByHash.permitCode)
        if (isValid) {
          const isExpired = new Date() > permitByHash.expiryDate
          if (isExpired) {
            // Update status to expired
            await prisma.permit.update({
              where: { id: permitByHash.id },
              data: { status: 'expired' }
            })
            return { valid: false, reason: 'expired', permit: permitByHash }
          }
          return { valid: true, permit: permitByHash }
        }
      }
    }

    // FALLBACK: If no hash match or hash not implemented, use optimized search
    // Only search for permits that might match (by length or pattern)
    const permits = await prisma.permit.findMany({
      where: {
        status: 'active',
        // Add more specific filtering to reduce the search space
        originalCode: {
          contains: permitCode.slice(-4) // Search by last 4 characters
        }
      },
      take: 100, // Reduced from 1000 to 100
      include: {
        student: true,
        issuedBy: {
          select: {
            username: true
          }
        }
      }
    })

    // Process permits in parallel with early termination
    for (const permit of permits) {
      try {
        const isValid = await bcrypt.compare(permitCode, permit.permitCode)
        if (isValid) {
          const isExpired = new Date() > permit.expiryDate
          if (isExpired) {
            // Update status to expired
            await prisma.permit.update({
              where: { id: permit.id },
              data: { status: 'expired' }
            })
            return { valid: false, reason: 'expired', permit }
          }
          return { valid: true, permit }
        }
      } catch (error) {
        log.error(`Error comparing permit ${permit.id}:`, error)
        continue
      }
    }

    return { valid: false, reason: 'not_found' }
  } catch (error: any) {
    log.error('Error verifying permit:', error)
    throw new Error(error.message)
  }
}

export async function revoke(permitId: number): Promise<ServiceResponse<StudentPermit>> {
  try {
    const permit = await prisma.permit.findUnique({
      where: { id: permitId },
      include: {
        student: true,
        issuedBy: {
          select: {
            username: true
          }
        },
        payment: true
      }
    })

    if (!permit) {
      return {
        success: false,
        error: 'Permit not found'
      }
    }

    // Update permit status to revoked
    const updatedPermit = await prisma.permit.update({
      where: { id: permitId },
      data: { status: 'revoked' },
      include: {
        student: true,
        issuedBy: {
          select: {
            username: true
          }
        }
      }
    })

    // Invalidate cache for this permit
    const cacheKey = `permit_${updatedPermit.originalCode}`
    permitCache.delete(cacheKey)

    // Cancel associated payment if it exists
    if (permit.payment) {
      await prisma.payment.update({
        where: { id: permit.payment.id },
        data: { status: 'CANCELLED' }
      })
    }

    return {
      success: true,
      data: updatedPermit
    }
  } catch (error: any) {
    log.error('Error revoking permit:', error)
    return handleError(error)
  }
}

export async function getStats(): Promise<ServiceResponse> {
  try {
    const stats = await prisma.permit.groupBy({
      by: ['status'],
      _count: true
    })

    return {
      success: true,
      data: stats.map(stat => ({
        status: stat.status,
        count: stat._count
      }))
    }
  } catch (error: any) {
    log.error('Error fetching permit stats:', error)
    throw new Error(error.message)
  }
}

export async function deletePermit(permitId: number): Promise<ServiceResponse<{ deleted: boolean }>> {
  try {
    const permit = await prisma.permit.findUnique({
      where: { id: permitId },
      include: {
        payment: true
      }
    })

    if (!permit) {
      return {
        success: false,
        error: 'Permit not found'
      }
    }

    if (permit.status !== 'revoked') {
      return {
        success: false,
        error: 'Only revoked permits can be deleted'
      }
    }

    // Delete associated payment if it exists
    if (permit.payment) {
      await prisma.payment.delete({
        where: { id: permit.payment.id }
      })
    }

    // Delete the permit
    await prisma.permit.delete({
      where: { id: permitId }
    })

    return {
      success: true,
      data: { deleted: true }
    }
  } catch (error: any) {
    log.error('Error deleting permit:', error)
    return handleError(error)
  }
}

export async function reactivate(permitId: number): Promise<ServiceResponse<StudentPermit>> {
  try {
    const permit = await prisma.permit.findUnique({
      where: { id: permitId },
      include: {
        student: true,
        issuedBy: {
          select: { username: true }
        },
        payment: true
      }
    })

    if (!permit) {
      return { success: false, error: 'Permit not found' }
    }

    if (permit.status !== 'revoked') {
      return { success: false, error: 'Only revoked permits can be reactivated' }
    }

    // Reactivate the permit
    const updatedPermit = await prisma.permit.update({
      where: { id: permitId },
      data: { status: 'active' },
      include: {
        student: true,
        issuedBy: {
          select: { username: true }
        }
      }
    })

    // Restore associated payment if it exists
    if (permit.payment && permit.payment.status === 'CANCELLED') {
      await prisma.payment.update({
        where: { id: permit.payment.id },
        data: { status: 'SUCCESS' }
      })
    }

    // Invalidate cache for this permit
    const cacheKey = `permit_${permit.originalCode}`
    permitCache.delete(cacheKey)

    return { success: true, data: updatedPermit }
  } catch (error: any) {
    log.error('Error reactivating permit:', error)
    return handleError(error)
  }
}

export async function checkValidity(permitId: number): Promise<ServiceResponse<{
  exists: boolean
  permit: Permit & {
    student: Student
    issuedBy: {
      username: string
    } | null
  }
  daysRemaining: number
  isExpired: boolean
  status: string
}>> {
  try {
    const permit = await prisma.permit.findUnique({
      where: { id: permitId },
      include: {
        student: true,
        issuedBy: {
          select: {
            username: true
          }
        }
      }
    })

    if (!permit) {
      return {
        success: false,
        error: 'Permit not found'
      }
    }

    const now = new Date()
    const isExpired = now > permit.expiryDate
    const daysRemaining = Math.max(
      0,
      Math.ceil((permit.expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    )

    if (isExpired && permit.status === 'active') {
      await prisma.permit.update({
        where: { id: permitId },
        data: { status: 'expired' }
      })
    }

    return {
      success: true,
      data: {
        exists: true,
        permit,
        daysRemaining,
        isExpired,
        status: isExpired ? 'expired' : permit.status
      }
    }
  } catch (error: any) {
    log.error('Error checking permit validity:', error)
    return handleError(error)

  }
}

// Fast permit lookup by code (for verification)
export async function getPermitByCode(permitCode: string): Promise<ServiceResponse<StudentPermit>> {
  try {
    // Check cache first
    const cacheKey = `permit_${permitCode}`
    const cached = permitCache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return {
        success: true,
        data: cached.data
      }
    }

    // Try to find by original code first (exact match)
    const permit = await prisma.permit.findFirst({
      where: {
        originalCode: permitCode,
        status: 'active'
      },
      include: {
        student: true,
        issuedBy: {
          select: {
            username: true
          }
        }
      }
    })

    if (permit) {
      // Cache the result
      permitCache.set(cacheKey, { data: permit, timestamp: Date.now() })
      return {
        success: true,
        data: permit
      }
    }

    // If not found by original code, try by hash
    const permitByHash = await prisma.permit.findFirst({
      where: {
        permitHash: permitCode,
        status: 'active'
      },
      include: {
        student: true,
        issuedBy: {
          select: {
            username: true
          }
        }
      }
    })

    if (permitByHash) {
      // Cache the result
      permitCache.set(cacheKey, { data: permitByHash, timestamp: Date.now() })
      return {
        success: true,
        data: permitByHash
      }
    }

    return {
      success: false,
      error: 'Permit not found'
    }
  } catch (error: any) {
    log.error('Error fetching permit by code:', error)
    return handleError(error)
  }
}

export async function resendPermitEmail(permitId: number, newEmail?: string): Promise<ServiceResponse> {
  try {
    const permit = await prisma.permit.findUnique({
      where: { id: permitId },
      include: {
        student: true,
        issuedBy: {
          select: {
            username: true
          }
        }
      }
    })

    if (!permit) {
      return {
        success: false,
        error: 'Permit not found'
      }
    }

    // Optionally update student's email before resending
    if (newEmail && newEmail.trim() && newEmail.trim() !== (permit.student.email || '')) {
      const trimmedEmail = newEmail.trim()
      await prisma.student.update({
        where: { id: permit.student.id },
        data: { email: trimmedEmail }
      })
      // Reflect the change locally for sending
      permit.student.email = trimmedEmail
    }

    const verificationUrl = `${BASE_URL}/permits/verify?code=${permit.originalCode}`
    const qrCode = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(verificationUrl)}&size=200x200`

    const res = await services.email.sendPermitEmails({
      student: {
        email: permit.student.email || '',
        name: permit.student.name || '',
        studentId: permit.student.studentId || '',
        course: permit.student.course || '',
        level: permit.student.level || ''
      },
      permit: {
        id: permit.id.toString(),
        amountPaid: permit.amountPaid,
        expiryDate: permit.expiryDate
      },
      qrCode,
      permitCode: permit.originalCode
    })

    return {
      success: true,
      data: permit,
      error: res.success ? undefined : res.error
    }
  } catch (error: any) {
    log.error('Error resending permit email:', error)
    return handleError(error)
  }
}
function generatePermitCode(): string {
  const nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 4);
  return nanoid();

}

function generatePaymentReference(): string {
  const nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 8);
  return nanoid();
}
