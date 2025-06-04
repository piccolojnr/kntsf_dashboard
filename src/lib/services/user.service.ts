import { Prisma } from '@prisma/client'
import { prisma } from '../prisma/client'
import { hash } from 'bcryptjs'
import { log } from '../logger'

export interface UserData {
  username: string
  email: string
  password: string
  roleId: number
}

export interface UserResponse {
  success: boolean
  data?: any
  error?: string
}

export class UserService {
  static async createUser(userData: UserData): Promise<UserResponse> {
    try {
      const hashedPassword = await hash(userData.password, 10)
      const user = await prisma.user.create({
        data: {
          username: userData.username,
          email: userData.email,
          password: hashedPassword,
          roleId: userData.roleId
        },
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
      return { success: true, data: user }
    } catch (error) {
      log.error('Failed to create user:', error)
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        return { success: false, error: error.message }
      }
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  static async getUserById(userId: number): Promise<UserResponse> {
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
        throw new Error('User not found')
      }
      return { success: true, data: user }
    } catch (error) {
      log.error('Failed to get user by ID:', error)
      if (error instanceof Error) {
        return { success: false, error: error.message }
      }
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  static async updateUser(userId: number, userData: Partial<UserData>): Promise<UserResponse> {
    try {
      const updatedData = { ...userData }
      if (userData.password) {
        updatedData.password = await hash(userData.password, 10)
      }
      const user = await prisma.user.update({
        where: { id: userId },
        data: updatedData,
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
      return { success: true, data: user }
    } catch (error) {
      log.error('Failed to update user:', error)
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        return { success: false, error: error.message }
      }
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  static async deleteUser(userId: number): Promise<UserResponse> {
    try {
      await prisma.user.delete({
        where: { id: userId }
      })
      return { success: true }
    } catch (error) {
      log.error('Failed to delete user:', error)
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        return { success: false, error: error.message }
      }
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  static async searchUsers(query: string): Promise<UserResponse> {
    try {
      const users = await prisma.user.findMany({
        where: {
          OR: [{ username: { contains: query } }, { email: { contains: query } }]
        },
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
      return { success: true, data: users }
    } catch (error) {
      log.error('Failed to search users:', error)
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        return { success: false, error: error.message }
      }
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  static async getAllUsers(): Promise<UserResponse> {
    try {
      const users = await prisma.user.findMany({
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
      return { success: true, data: users }
    } catch (error) {
      log.error('Failed to get all users:', error)
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        return { success: false, error: error.message }
      }
      return { success: false, error: 'An unexpected error occurred' }
    }
  }
}
