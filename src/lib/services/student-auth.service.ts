'use server'

import { compare, hash } from 'bcryptjs'
import { createHash, randomBytes } from 'crypto'
import prisma from '../prisma/client'
import * as EmailService from './email.service'
import * as AuditService from './audit.service'
import { log } from '../logger'
import { handleError } from '../utils'
import { ServiceResponse } from '../types/common'

const TOKEN_EXPIRY_HOURS = 24
const MIN_PASSWORD_LENGTH = 8
const TOKEN_SEND_COOLDOWN_MS = 60 * 1000

type StudentAuthTokenTypeValue = 'setup_password' | 'reset_password'

export type StudentAuthAccountStatus = 'not_activated' | 'pending_setup' | 'active' | 'disabled'

export type StudentAuthAccountSummary = {
  id: number
  status: StudentAuthAccountStatus
  username: string
  email: string
  isActive: boolean
  hasPassword: boolean
  lastLoginAt: Date | null
  loginCount: number
  pendingSetupExpiresAt: Date | null
}

export type StudentAuthTokenValidation = {
  valid: boolean
  reason?: 'invalid' | 'expired' | 'used'
  type?: StudentAuthTokenTypeValue
  student?: {
    name: string
    studentId: string
    email: string
    username: string
  }
}

type StudentWithAuth = {
  id: number
  studentId: string
  name: string | null
  email: string | null
  auth: {
    id: number
    username: string
    email: string
    passwordHash: string | null
    isActive: boolean
    lastLoginAt: Date | null
    loginCount: number
  } | null
}

function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex')
}

function createRawToken() {
  return randomBytes(32).toString('base64url')
}

function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
}

function getTokenExpiry() {
  return new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000)
}

function normalizeUsername(student: { studentId: string }) {
  return student.studentId.trim()
}

function normalizeEmail(student: { email: string | null; studentId: string }) {
  return student.email?.trim() || `${student.studentId}@students.local`
}

function summarizeAccount(student: StudentWithAuth, pendingSetupExpiresAt: Date | null): StudentAuthAccountSummary | null {
  if (!student.auth) {
    return null
  }

  const hasPassword = Boolean(student.auth.passwordHash)
  const status: StudentAuthAccountStatus = !student.auth.isActive
    ? 'disabled'
    : hasPassword
      ? 'active'
      : 'pending_setup'

  return {
    id: student.auth.id,
    status,
    username: student.auth.username,
    email: student.auth.email,
    isActive: student.auth.isActive,
    hasPassword,
    lastLoginAt: student.auth.lastLoginAt,
    loginCount: student.auth.loginCount,
    pendingSetupExpiresAt
  }
}

async function getStudentByPublicId(studentId: string): Promise<StudentWithAuth | null> {
  return prisma.student.findUnique({
    where: { studentId },
    select: {
      id: true,
      studentId: true,
      name: true,
      email: true,
      auth: {
        select: {
          id: true,
          username: true,
          email: true,
          passwordHash: true,
          isActive: true,
          lastLoginAt: true,
          loginCount: true
        }
      }
    }
  })
}

async function getOrCreateStudentAuth(studentId: string): Promise<any> {
  const student = await getStudentByPublicId(studentId)

  if (!student) {
    throw new Error('Student not found')
  }

  if (!student.email) {
    throw new Error('Student must have an email address before mobile account setup')
  }

  if (student.auth) {
    return prisma.studentAuth.update({
      where: { id: student.auth.id },
      data: {
        username: student.auth.username || normalizeUsername(student),
        email: student.auth.email || normalizeEmail(student),
        isActive: true
      },
      include: { student: true }
    })
  }

  return prisma.studentAuth.create({
    data: {
      studentId: student.id,
      username: normalizeUsername(student),
      email: normalizeEmail(student),
      passwordHash: null,
      isActive: true
    },
    include: { student: true }
  })
}

async function getPendingSetupExpiry(studentAuthId: number) {
  const token = await prisma.studentAuthToken.findFirst({
    where: {
      studentAuthId,
      type: 'setup_password',
      usedAt: null,
      expiresAt: { gt: new Date() }
    },
    orderBy: { createdAt: 'desc' },
    select: { expiresAt: true }
  })

  return token?.expiresAt ?? null
}

async function issueToken(studentAuthId: number, type: StudentAuthTokenTypeValue) {
  const recentToken = await prisma.studentAuthToken.findFirst({
    where: {
      studentAuthId,
      type,
      usedAt: null,
      createdAt: { gt: new Date(Date.now() - TOKEN_SEND_COOLDOWN_MS) }
    },
    select: { createdAt: true }
  })

  if (recentToken) {
    throw new Error('A password link was sent recently. Please wait before sending another one.')
  }

  const rawToken = createRawToken()
  const tokenHash = hashToken(rawToken)
  const expiresAt = getTokenExpiry()

  await prisma.studentAuthToken.updateMany({
    where: {
      studentAuthId,
      type,
      usedAt: null
    },
    data: { usedAt: new Date() }
  })

  await prisma.studentAuthToken.create({
    data: {
      studentAuthId,
      tokenHash,
      type,
      expiresAt
    }
  })

  return { rawToken, expiresAt }
}

async function sendPasswordLink(studentId: string, actorUserId: number, type: StudentAuthTokenTypeValue) {
  const auth = await getOrCreateStudentAuth(studentId)
  const { rawToken } = await issueToken(auth.id, type)
  const setupUrl = `${getAppUrl()}/student-auth/setup-password?token=${encodeURIComponent(rawToken)}`

  const emailResult = await EmailService.sendStudentAuthPasswordEmail({
    email: auth.email,
    name: auth.student.name || auth.username,
    username: auth.username,
    setupUrl,
    purpose: type,
    expiresInHours: TOKEN_EXPIRY_HOURS
  })

  await AuditService.create({
    userId: actorUserId,
    action: type === 'reset_password'
      ? 'student_auth.reset_link_sent'
      : 'student_auth.setup_link_sent',
    details: `${type === 'reset_password' ? 'Sent password reset link' : 'Sent password setup link'} for student ${auth.student.studentId}`
  })

  if (!emailResult.success) {
    return {
      success: false,
      error: emailResult.error || 'Student account was updated, but the email could not be sent'
    }
  }

  return {
    success: true,
    data: {
      username: auth.username,
      email: auth.email
    }
  }
}

export async function getStudentAccountStatus(studentId: string): Promise<ServiceResponse<StudentAuthAccountSummary | null>> {
  try {
    const student = await getStudentByPublicId(studentId)

    if (!student) {
      return { success: false, error: 'Student not found' }
    }

    if (!student.auth) {
      return { success: true, data: null }
    }

    const pendingSetupExpiresAt = await getPendingSetupExpiry(student.auth.id)
    return { success: true, data: summarizeAccount(student, pendingSetupExpiresAt) }
  } catch (error) {
    log.error('Failed to get student auth status:', error)
    return handleError(error)
  }
}

export async function activateStudentAccount(studentId: string, actorUserId: number): Promise<ServiceResponse<StudentAuthAccountSummary>> {
  try {
    const auth = await getOrCreateStudentAuth(studentId)
    await AuditService.create({
      userId: actorUserId,
      action: 'student_auth.activate',
      details: `Activated mobile account for student ${auth.student.studentId}`
    })

    const status = await getStudentAccountStatus(studentId)
    if (!status.success || !status.data) {
      return { success: false, error: status.error || 'Failed to load account status' }
    }

    return { success: true, data: status.data }
  } catch (error) {
    log.error('Failed to activate student account:', error)
    return handleError(error)
  }
}

export async function sendStudentPasswordSetupLink(studentId: string, actorUserId: number) {
  try {
    return await sendPasswordLink(studentId, actorUserId, 'setup_password')
  } catch (error) {
    log.error('Failed to send student setup link:', error)
    return handleError(error)
  }
}

export async function sendStudentPasswordResetLink(studentId: string, actorUserId: number) {
  try {
    return await sendPasswordLink(studentId, actorUserId, 'reset_password')
  } catch (error) {
    log.error('Failed to send student reset link:', error)
    return handleError(error)
  }
}

export async function disableStudentAccount(studentId: string, actorUserId: number): Promise<ServiceResponse> {
  try {
    const student = await getStudentByPublicId(studentId)
    if (!student?.auth) {
      return { success: false, error: 'Student account is not activated' }
    }

    await prisma.studentAuth.update({
      where: { id: student.auth.id },
      data: { isActive: false }
    })
    await AuditService.create({
      userId: actorUserId,
      action: 'student_auth.disable',
      details: `Disabled mobile account for student ${student.studentId}`
    })

    return { success: true }
  } catch (error) {
    log.error('Failed to disable student account:', error)
    return handleError(error)
  }
}

export async function validateStudentAuthToken(token: string): Promise<ServiceResponse<StudentAuthTokenValidation>> {
  try {
    const tokenHash = hashToken(token)
    const record = await prisma.studentAuthToken.findUnique({
      where: { tokenHash },
      include: {
        studentAuth: {
          include: { student: true }
        }
      }
    })

    if (!record) {
      return { success: true, data: { valid: false, reason: 'invalid' } }
    }

    if (record.usedAt) {
      return { success: true, data: { valid: false, reason: 'used' } }
    }

    if (record.expiresAt <= new Date()) {
      return { success: true, data: { valid: false, reason: 'expired' } }
    }

    return {
      success: true,
      data: {
        valid: true,
        type: record.type,
        student: {
          name: record.studentAuth.student.name || record.studentAuth.username,
          studentId: record.studentAuth.student.studentId,
          email: record.studentAuth.email,
          username: record.studentAuth.username
        }
      }
    }
  } catch (error) {
    log.error('Failed to validate student auth token:', error)
    return handleError(error)
  }
}

function validatePasswordStrength(password: string) {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return 'Password must be at least 8 characters long'
  }
  if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password)) {
    return 'Password must include uppercase, lowercase, and a number'
  }
  return null
}

export async function setStudentPassword(token: string, password: string): Promise<ServiceResponse> {
  try {
    const passwordError = validatePasswordStrength(password)
    if (passwordError) {
      return { success: false, error: passwordError }
    }

    const tokenHash = hashToken(token)
    const record = await prisma.studentAuthToken.findUnique({
      where: { tokenHash },
      include: { studentAuth: true }
    })

    if (!record || record.usedAt || record.expiresAt <= new Date()) {
      return { success: false, error: 'This password setup link is invalid or has expired' }
    }

    if (record.studentAuth.passwordHash) {
      const samePassword = await compare(password, record.studentAuth.passwordHash)
      if (samePassword) {
        return { success: false, error: 'Choose a password you have not used recently' }
      }
    }

    const passwordHash = await hash(password, 12)
    await prisma.$transaction(async (tx) => {
      await tx.studentAuth.update({
        where: { id: record.studentAuthId },
        data: {
          passwordHash,
          isActive: true
        }
      })
      await tx.studentAuthToken.update({
        where: { id: record.id },
        data: { usedAt: new Date() }
      })
    })

    return { success: true }
  } catch (error) {
    log.error('Failed to set student password:', error)
    return handleError(error)
  }
}
