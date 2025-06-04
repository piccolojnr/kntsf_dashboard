import { log } from '../logger'
import { prisma } from '../prisma/client'

export interface PermissionData {
  name: string
  description?: string
}

export interface PermissionResponse {
  success: boolean
  permission?: any
  error?: string
}

export class PermissionService {
  static async createPermission(permissionData: PermissionData): Promise<PermissionResponse> {
    try {
      const permission = await prisma.permission.create({
        data: permissionData
      })
      return { success: true, permission }
    } catch (error) {
      log.error('Failed to create permission:', error)
      if (error instanceof Error) {
        return { success: false, error: error.message }
      }
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  static async getPermissionById(permissionId: number): Promise<PermissionResponse> {
    try {
      const permission = await prisma.permission.findUnique({
        where: { id: permissionId },
        include: {
          roles: {
            include: {
              role: true
            }
          }
        }
      })
      if (!permission) {
        throw new Error('Permission not found')
      }
      return { success: true, permission }
    } catch (error) {
      log.error('Failed to get permission by ID:', error)
      if (error instanceof Error) {
        return { success: false, error: error.message }
      }
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  static async updatePermission(
    permissionId: number,
    permissionData: Partial<PermissionData>
  ): Promise<PermissionResponse> {
    try {
      const permission = await prisma.permission.update({
        where: { id: permissionId },
        data: permissionData
      })
      return { success: true, permission }
    } catch (error) {
      log.error('Failed to update permission:', error)
      if (error instanceof Error) {
        return { success: false, error: error.message }
      }
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  static async deletePermission(permissionId: number): Promise<PermissionResponse> {
    try {
      await prisma.permission.delete({
        where: { id: permissionId }
      })
      return { success: true }
    } catch (error) {
      log.error('Failed to delete permission:', error)
      if (error instanceof Error) {
        return { success: false, error: error.message }
      }
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  static async getAllPermissions(): Promise<PermissionResponse> {
    try {
      const permissions = await prisma.permission.findMany({
        include: {
          roles: {
            include: {
              role: true
            }
          }
        }
      })
      return { success: true, permission: permissions }
    } catch (error) {
      log.error('Failed to retrieve all permissions:', error)
      if (error instanceof Error) {
        return { success: false, error: error.message }
      }
      return { success: false, error: 'An unexpected error occurred' }
    }
  }
}
