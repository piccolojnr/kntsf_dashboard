'use server'
import prisma from '../prisma/client'
import bcrypt from 'bcryptjs'
import QRCode from 'qrcode'
import { BASE_URL } from '../constants'
import { log } from '../logger'
import { Permit, Prisma, Student } from "@prisma/client"
import { customAlphabet } from 'nanoid'
import { ServiceResponse, StudentPermit } from '../types/common'
import { getSession } from '../auth/auth'

export interface PermitData {
  studentId: string
  amountPaid: number
  expiryDate: Date
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

export async function getAll(params: {
  page?: number
  pageSize?: number
  search?: string
  status?: string
}): Promise<{
  success: boolean

  data?: PaginatedResponse<
    StudentPermit
  >
  error?: string
}> {
  try {
    const { page = 1, pageSize = 10, search, status } = params
    const where: Prisma.PermitWhereInput = {
      ...(status && status !== 'all' && { status }),
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

export async function create(permitData: PermitData): Promise<PermitResponse> {
  try {
    const session = await getSession()

    if (!session || !session.user) {
      return { success: false, error: 'Unauthorized' }
    }

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

    const permit = await prisma.permit.create({
      data: {
        permitCode: hashedCode,
        originalCode: permitCode,
        expiryDate: permitData.expiryDate,
        amountPaid: permitData.amountPaid,
        studentId: student.id,
        issuedById: parseInt((session.user as any).id),
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
    const verificationUrl = `${BASE_URL}/verify?code=${permitCode}`
    const qrCode = await QRCode.toDataURL(verificationUrl)

    return {
      success: true,
      data: permit,
      permitCode,
      qrCode
    }
  } catch (error: any) {
    log.error('Error creating permit:', error)
    return {
      success: false,
      error: error.message
    }
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
    const permits = await prisma.permit.findMany({
      where: { status: 'active' },
      include: {
        student: true,
        issuedBy: {
          select: {
            username: true
          }
        }
      }
    })

    for (const permit of permits) {
      const isValid = await bcrypt.compare(permitCode, permit.permitCode)
      if (isValid) {
        const isExpired = new Date() > permit.expiryDate
        if (isExpired) {
          await prisma.permit.update({
            where: { id: permit.id },
            data: { status: 'expired' }
          })
          return { valid: false, reason: 'expired' }
        }
        return {
          valid: true,
          permit
        }
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
    const permit = await prisma.permit.update({
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

    return {
      success: true,
      data: permit
    }
  } catch (error: any) {
    log.error('Error revoking permit:', error)
    return {
      success: false,
      error: error.message
    }
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
    return {
      success: false,
      error: error.message
    }
  }
}

function generatePermitCode(): string {
  const nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 4);
  return nanoid();

}
