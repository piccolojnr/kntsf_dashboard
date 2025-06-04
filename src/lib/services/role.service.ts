import { log } from '../logger'
import { prisma } from '../prisma/client'

export interface RoleData {
  name: string
  description?: string
  permissionIds: number[]
}

export interface RoleResponse {
  success: boolean
  role?: any
  error?: string
}

export class RoleService {
  static async createRole(roleData: RoleData): Promise<RoleResponse> {
    try {
      const role = await prisma.role.create({
        data: {
          name: roleData.name,
          description: roleData.description,
          permissions: {
            create: roleData.permissionIds.map((permissionId) => ({
              permission: {
                connect: { id: permissionId }
              }
            }))
          }
        },
        include: {
          permissions: {
            include: {
              permission: true
            }
          }
        }
      })
      return { success: true, role }
    } catch (error) {
      log.error('Failed to create role:', error)
      if (error instanceof Error) {
        return { success: false, error: error.message }
      }
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  static async getRoleById(roleId: number): Promise<RoleResponse> {
    try {
      const role = await prisma.role.findUnique({
        where: { id: roleId },
        include: {
          permissions: {
            include: {
              permission: true
            }
          }
        }
      })
      if (!role) {
        throw new Error('Role not found')
      }
      return { success: true, role }
    } catch (error) {
      log.error('Failed to get role by ID:', error)
      if (error instanceof Error) {
        return { success: false, error: error.message }
      }
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  static async updateRole(roleId: number, roleData: Partial<RoleData>): Promise<RoleResponse> {
    try {
      const updateData: any = {
        name: roleData.name,
        description: roleData.description
      }

      if (roleData.permissionIds) {
        // First delete existing permissions
        await prisma.rolePermission.deleteMany({
          where: { roleId }
        })

        // Then create new permissions
        updateData.permissions = {
          create: roleData.permissionIds.map((permissionId) => ({
            permission: {
              connect: { id: permissionId }
            }
          }))
        }
      }

      const role = await prisma.role.update({
        where: { id: roleId },
        data: updateData,
        include: {
          permissions: {
            include: {
              permission: true
            }
          }
        }
      })
      return { success: true, role }
    } catch (error) {
      log.error('Failed to update role:', error)
      if (error instanceof Error) {
        return { success: false, error: error.message }
      }
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  static async deleteRole(roleId: number): Promise<RoleResponse> {
    try {
      await prisma.role.delete({
        where: { id: roleId }
      })
      return { success: true }
    } catch (error) {
      log.error('Failed to delete role:', error)
      if (error instanceof Error) {
        return { success: false, error: error.message }
      }
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  static async getAllRoles(): Promise<RoleResponse> {
    try {
      const roles = await prisma.role.findMany({
        include: {
          permissions: {
            include: {
              permission: true
            }
          }
        }
      })
      return { success: true, role: roles }
    } catch (error) {
      log.error('Failed to retrieve all roles:', error)
      if (error instanceof Error) {
        return { success: false, error: error.message }
      }
      return { success: false, error: 'An unexpected error occurred' }
    }
  }
}
