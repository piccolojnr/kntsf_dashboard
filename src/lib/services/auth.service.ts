import { prisma } from '../prisma/client'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { log } from '../logger'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export interface LoginCredentials {
  username: string
  password: string
}

export interface AuthResponse {
  user: any
  token: string
}

export interface JWT_Response {
  userId: number
  role: string
  permissions: string[]
  iat: number
  exp: number
}

export class AuthService {
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
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
      throw new Error('Invalid credentials')
    }

    const isValidPassword = await bcrypt.compare(credentials.password, user.password)
    if (!isValidPassword) {
      log.error('Invalid credentials')
      throw new Error('Invalid credentials')
    }

    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role.name,
        permissions: user.role.permissions.map((rp) => rp.permission.name)
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    )

    return {
      user,
      token
    }
  }

  static async verifyToken(token: string): Promise<JWT_Response> {
    try {
      return jwt.verify(token, JWT_SECRET) as JWT_Response
    } catch (error) {
      log.error('Token verification error:', error)
      throw new Error('Invalid token')
    }
  }

  static async getUserPermissions(userId: number): Promise<string[]> {
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
      log.error('User not found')
      throw new Error('User not found')
    }

    return user.role.permissions.map((rp) => rp.permission.name)
  }

  static async getUserById(userId: number): Promise<any> {
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
      log.error('User not found')
      throw new Error('User not found')
    }

    return user
  }
}
