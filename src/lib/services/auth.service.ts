'use server'
import prisma from '../prisma/client'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { log } from '../logger'
import { AuthorizedUser, ServiceResponse } from '../types/common'
import { handleError } from '../utils'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export interface LoginCredentials {
  username: string
  password: string
}

export interface AuthResponse {
  user: AuthorizedUser
  token: string
}

export interface JWT_Response {
  userId: number
  role: string
  permissions: string[]
  iat: number
  exp: number
}

export async function login(credentials: LoginCredentials): Promise<ServiceResponse<AuthResponse>> {
  if (!credentials.username || !credentials.password) {
    log.error('Username and password are required')
    return { success: false, error: 'Username and password are required' }
  }
  try {
    const user = await prisma.user.findUnique({
      where: { username: credentials.username },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true
              }
            }
          }
        }
      }
    })

    if (!user) {
      log.error('Invalid credentials')
      return { success: false, error: 'Invalid credentials' }
    }

    const isValidPassword = await bcrypt.compare(credentials.password, user.password)
    if (!isValidPassword) {
      log.error('Invalid credentials')
      return { success: false, error: 'Invalid credentials' }
    }

    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role.name,
        permissions: user.role.permissions.map((rp: { permission: { name: any } }) => rp.permission.name)
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    )

    return {
      success: true,
      data: {
        user,
        token
      }
    }
  } catch (error) {
    log.error('Login error:', error)
    return handleError(error)

  }
}

export async function verifyToken(token: string): Promise<ServiceResponse<JWT_Response>> {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWT_Response
    return { success: true, data: decoded }
  } catch (error) {
    log.error('Token verification error:', error)
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'Invalid token' }
  }
}

export async function getUserPermissions(userId: number): Promise<ServiceResponse<string[]>> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true
              }
            }
          }
        }
      }
    })

    if (!user) {
      return { success: false, error: 'User not found' }
    }

    return {
      success: true,
      data: user.role.permissions.map((rp: { permission: { name: any } }) => rp.permission.name)
    }
  } catch (error) {
    log.error('Failed to get user permissions:', error)
    return handleError(error)

  }
}

export async function getUserById(userId: number): Promise<ServiceResponse> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true
              }
            }
          }
        }
      }
    })

    if (!user) {
      return { success: false, error: 'User not found' }
    }

    return { success: true, data: user }
  } catch (error) {
    log.error('Failed to get user:', error)
    return handleError(error)

  }
}
