'use server'
import prisma from '../prisma/client'
import { hash } from 'bcryptjs'
import { log } from '../logger'
import { AuthorizedUser, ServiceResponse } from '../types/common'
import { handleError } from '../utils'

export interface UserData {
  username: string
  email: string
  password: string
  roleId: number
}

export async function create(userData: UserData): Promise<ServiceResponse<AuthorizedUser>> {
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
    return handleError(error)
  }
}

export async function getById(userId: number): Promise<ServiceResponse<AuthorizedUser>> {
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

export async function update(userId: number, userData: Partial<UserData>): Promise<ServiceResponse<AuthorizedUser>> {
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
    return handleError(error)
  }
}

export async function deleteUser(userId: number): Promise<ServiceResponse<AuthorizedUser>> {
  try {
    const user = await prisma.user.delete({
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
    return { success: true, data: user }
  } catch (error) {
    log.error('Failed to delete user:', error)
    return handleError(error)
  }
}

export async function search(query: string): Promise<ServiceResponse<AuthorizedUser[]>> {
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
    return handleError(error)
  }
}

export async function getAll(): Promise<ServiceResponse<AuthorizedUser[]>> {
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
    return handleError(error)
  }
}
