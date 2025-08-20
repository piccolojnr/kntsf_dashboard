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
