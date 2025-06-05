'use server'
import { log } from '../logger'
import prisma from '../prisma/client'
import { RoleWithPermissions, ServiceResponse } from '../types/common'

export interface RoleData {
  name: string
  description?: string
  permissionIds: number[]
}

export async function create(roleData: RoleData): Promise<ServiceResponse> {
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
    return { success: true, data: role }
  } catch (error) {
    log.error('Failed to create role:', error)
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function getById(roleId: number): Promise<ServiceResponse> {
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
    return { success: true, data: role }
  } catch (error) {
    log.error('Failed to get role by ID:', error)
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function update(roleId: number, roleData: Partial<RoleData>): Promise<ServiceResponse> {
  try {
    const updateData = {
      name: roleData.name,
      description: roleData.description
    }

    if (roleData.permissionIds) {
      // First delete existing permissions
      await prisma.rolePermission.deleteMany({
        where: { roleId }
      })

      // Then create new permissions
      Object.assign(updateData, {
        permissions: {
          create: roleData.permissionIds.map((permissionId) => ({
            permission: {
              connect: { id: permissionId }
            }
          }))
        }
      })
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
    return { success: true, data: role }
  } catch (error) {
    log.error('Failed to update role:', error)
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function deleteRole(roleId: number): Promise<ServiceResponse> {
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

export async function getAll(): Promise<ServiceResponse<RoleWithPermissions[]>> {
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
    return { success: true, data: roles }
  } catch (error) {
    log.error('Failed to retrieve all roles:', error)
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'An unexpected error occurred' }
  }
}
