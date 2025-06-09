'use server'
import { Permission, Role } from '@prisma/client'
import { log } from '../logger'
import prisma from '../prisma/client'
import { ServiceResponse } from '../types/common'
import { handleError } from '../utils'

export interface PermissionData {
  name: string
  description?: string
}

export async function create(permissionData: PermissionData): Promise<ServiceResponse> {
  try {
    const permission = await prisma.permission.create({
      data: permissionData
    })
    return { success: true, data: permission }
  } catch (error) {
    log.error('Failed to create permission:', error)
    return handleError(error)

  }
}

export async function getById(permissionId: number): Promise<ServiceResponse> {
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
    return { success: true, data: permission }
  } catch (error) {
    log.error('Failed to get permission by ID:', error)
    return handleError(error)

  }
}

export async function update(
  permissionId: number,
  permissionData: Partial<PermissionData>
): Promise<ServiceResponse> {
  try {
    const permission = await prisma.permission.update({
      where: { id: permissionId },
      data: permissionData
    })
    return { success: true, data: permission }
  } catch (error) {
    log.error('Failed to update permission:', error)
    return handleError(error)

  }
}

export async function deletePermission(permissionId: number): Promise<ServiceResponse> {
  try {
    await prisma.permission.delete({
      where: { id: permissionId }
    })
    return { success: true }
  } catch (error) {
    log.error('Failed to delete permission:', error)
    return handleError(error)

  }
}

export async function getAll(): Promise<ServiceResponse<(Permission & {
  roles: {
    role: Role
  }[]
})[]>> {
  try {
    const permissions = await prisma.permission.findMany({
      include: {
        roles: {
          include: {
            role: true,
          }
        }
      }
    })
    return { success: true, data: permissions }
  } catch (error) {
    log.error('Failed to retrieve all permissions:', error)
    return handleError(error)

  }
}

export async function getByRoleId(roleId: number): Promise<ServiceResponse<Permission[]>> {
  try {
    const permissions = await prisma.permission.findMany({
      where: {
        roles: {
          some: {
            roleId
          }
        }
      }
    })
    return { success: true, data: permissions }
  } catch (error) {
    log.error('Failed to get permissions by role ID:', error)
    return handleError(error)

  }
}