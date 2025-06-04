import { prisma } from '../prisma/client'
import bcrypt from 'bcryptjs'
import QRCode from 'qrcode'
import { BASE_URL } from '../constants'
import { Permit, Prisma, Student } from '@prisma/client'
import { log } from '../logger'

export interface PermitData {
  studentId: string
  amountPaid: number
  expiryDate: Date
  issuedById: number
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

export class PermitService {
  static async getPermits(params: {
    page?: number
    pageSize?: number
    search?: string
    status?: string
  }): Promise<{
    success: boolean

    data?: PaginatedResponse<
      Permit & {
        student: { name: string; studentId: string }
        issuedBy: { username: string } | null
      }
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
            student: {
              select: {
                name: true,
                studentId: true
              }
            },
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

  static async createPermit(permitData: PermitData): Promise<PermitResponse> {
    try {
      // check student id
      const student = await prisma.student.findUnique({
        where: { studentId: permitData.studentId }
      })

      if (!student) {
        return { success: false, error: 'Student not found' }
      }
      const code = this.generatePermitCode()
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
          issuedById: permitData.issuedById,
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

  static async verifyPermit(permitCode: string): Promise<{
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

  static async revokePermit(permitId: number): Promise<
    Permit & {
      student: Student
      issuedBy: {
        username: string
      } | null
    }
  > {
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

      return permit
    } catch (error: any) {
      log.error('Error revoking permit:', error)
      throw new Error(error.message)
    }
  }

  static async getPermitStats(): Promise<any> {
    try {
      const stats = await prisma.permit.groupBy({
        by: ['status'],
        _count: true
      })

      return stats
    } catch (error: any) {
      log.error('Error fetching permit stats:', error)
      throw new Error(error.message)
    }
  }

  static async checkPermitValidity(permitId: number): Promise<any> {
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
        return { exists: false }
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
        exists: true,
        permit,
        daysRemaining,
        isExpired,
        status: isExpired ? 'expired' : permit.status
      }
    } catch (error: any) {
      log.error('Error checking permit validity:', error)
      throw new Error(error.message)
    }
  }

  private static generatePermitCode(): string {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const numbers = '0123456789'
    let code = ''

    // Ensure at least one letter and one number
    code += letters.charAt(Math.floor(Math.random() * letters.length))
    code += numbers.charAt(Math.floor(Math.random() * numbers.length))

    // Fill the remaining 2 characters randomly
    const chars = letters + numbers
    for (let i = 0; i < 2; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }

    // Shuffle the code to randomize the order
    return code
      .split('')
      .sort(() => 0.5 - Math.random())
      .join('')
  }
}
