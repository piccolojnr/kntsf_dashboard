import { compare } from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma/client'

const MOBILE_TOKEN_TTL = '7d'

export type MobileUserRole = 'student' | 'staff' | 'admin'
export type MobileUserType = 'student' | 'staff'

export interface MobileUser {
  id: number
  name: string
  email: string
  role: MobileUserRole
  studentId?: string
  type: MobileUserType
}

interface MobileTokenPayload {
  sub: string
  type: MobileUserType
  role: MobileUserRole
  userId?: number
  studentAuthId?: number
  studentDbId?: number
  studentId?: string
}

export class MobileAuthError extends Error {
  constructor(
    public code: 'UNAUTHORIZED' | 'FORBIDDEN',
    message: string,
    public status: number
  ) {
    super(message)
  }
}

export function getMobileTokenSecret() {
  return process.env.MOBILE_JWT_SECRET || process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET
}

export async function authenticateMobileCredentials(input: {
  username: string
  password: string
}): Promise<{ user: MobileUser; token: string }> {
  const identifier = input.username.trim()

  const staffUser = await prisma.user.findFirst({
    where: {
      OR: [
        { username: identifier },
        { email: identifier }
      ]
    },
    include: {
      role: true
    }
  })

  if (staffUser) {
    const passwordMatches = await compare(input.password, staffUser.password)
    if (!passwordMatches) {
      throw new MobileAuthError('UNAUTHORIZED', 'Invalid credentials', 401)
    }

    const role: MobileUserRole = staffUser.role.name === 'admin' ? 'admin' : 'staff'
    const user: MobileUser = {
      id: staffUser.id,
      name: staffUser.name || staffUser.username,
      email: staffUser.email,
      role,
      type: 'staff'
    }

    return {
      user,
      token: signMobileToken({
        sub: `staff:${staffUser.id}`,
        type: 'staff',
        role,
        userId: staffUser.id
      })
    }
  }

  const studentAuth = await prisma.studentAuth.findFirst({
    where: {
      OR: [
        { username: identifier },
        { email: identifier }
      ]
    },
    include: {
      student: true
    }
  })

  if (!studentAuth) {
    throw new MobileAuthError('UNAUTHORIZED', 'Invalid credentials', 401)
  }

  if (!studentAuth.isActive) {
    throw new MobileAuthError('FORBIDDEN', 'Student account is inactive', 403)
  }

  const passwordMatches = await compare(input.password, studentAuth.passwordHash)
  if (!passwordMatches) {
    await prisma.studentAuth.update({
      where: { id: studentAuth.id },
      data: { lastFailedLoginAt: new Date() }
    })
    throw new MobileAuthError('UNAUTHORIZED', 'Invalid credentials', 401)
  }

  await prisma.studentAuth.update({
    where: { id: studentAuth.id },
    data: {
      lastLoginAt: new Date(),
      loginCount: { increment: 1 }
    }
  })

  const user: MobileUser = {
    id: studentAuth.id,
    name: studentAuth.student.name || studentAuth.username,
    email: studentAuth.email,
    role: 'student',
    studentId: studentAuth.student.studentId,
    type: 'student'
  }

  return {
    user,
    token: signMobileToken({
      sub: `student:${studentAuth.id}`,
      type: 'student',
      role: 'student',
      studentAuthId: studentAuth.id,
      studentDbId: studentAuth.studentId,
      studentId: studentAuth.student.studentId
    })
  }
}

export async function getMobileUserFromRequest(request: NextRequest): Promise<MobileUser | null> {
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice('Bearer '.length).trim() : null

  if (!token) {
    return null
  }

  const secret = getMobileTokenSecret()
  if (!secret) {
    throw new MobileAuthError('UNAUTHORIZED', 'Mobile token secret is not configured', 401)
  }

  try {
    const payload = jwt.verify(token, secret) as MobileTokenPayload

    if (payload.type === 'staff' && payload.userId) {
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        include: { role: true }
      })

      if (!user) {
        return null
      }

      return {
        id: user.id,
        name: user.name || user.username,
        email: user.email,
        role: user.role.name === 'admin' ? 'admin' : 'staff',
        type: 'staff'
      }
    }

    if (payload.type === 'student' && payload.studentAuthId) {
      const studentAuth = await prisma.studentAuth.findUnique({
        where: { id: payload.studentAuthId },
        include: { student: true }
      })

      if (!studentAuth || !studentAuth.isActive) {
        return null
      }

      return {
        id: studentAuth.id,
        name: studentAuth.student.name || studentAuth.username,
        email: studentAuth.email,
        role: 'student',
        studentId: studentAuth.student.studentId,
        type: 'student'
      }
    }

    return null
  } catch {
    return null
  }
}

export async function requireMobileUser(request: NextRequest): Promise<MobileUser> {
  const user = await getMobileUserFromRequest(request)
  if (!user) {
    throw new MobileAuthError('UNAUTHORIZED', 'Authentication required', 401)
  }
  return user
}

export async function requireOperationsUser(request: NextRequest): Promise<MobileUser> {
  const user = await requireMobileUser(request)
  if (user.role !== 'staff' && user.role !== 'admin') {
    throw new MobileAuthError('FORBIDDEN', 'Operations access required', 403)
  }
  return user
}

export async function requireStudentUser(request: NextRequest): Promise<MobileUser> {
  const user = await requireMobileUser(request)
  if (user.role !== 'student' || !user.studentId) {
    throw new MobileAuthError('FORBIDDEN', 'Student access required', 403)
  }
  return user
}

function signMobileToken(payload: MobileTokenPayload) {
  const secret = getMobileTokenSecret()
  if (!secret) {
    throw new MobileAuthError('UNAUTHORIZED', 'Mobile token secret is not configured', 401)
  }

  return jwt.sign(payload, secret, { expiresIn: MOBILE_TOKEN_TTL })
}
