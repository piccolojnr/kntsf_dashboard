'use server'
import { log } from '../logger'
import prisma from '../prisma/client'
import { RoleWithPermissions, ServiceResponse } from '../types/common'
import { handleError } from '../utils'

export interface RoleData {
  name: string
  description?: string
}

export async function create(roleData: RoleData): Promise<ServiceResponse> {
  try {
    const role = await prisma.role.create({
      data: {
        name: roleData.name,
        description: roleData.description,

      },

    })
    return { success: true, data: role }
  } catch (error) {
    log.error('Failed to create role:', error)
    return handleError(error)

  }
}

export async function getById(roleId: number): Promise<ServiceResponse> {
  try {
    const role = await prisma.role.findUnique({
      where: { id: roleId },

    })
    if (!role) {
      throw new Error('Role not found')
    }
    return { success: true, data: role }
  } catch (error) {
    log.error('Failed to get role by ID:', error)
    return handleError(error)

  }
}

export async function update(roleId: number, roleData: Partial<RoleData>): Promise<ServiceResponse> {
  try {
    const updateData = {
      name: roleData.name,
      description: roleData.description
    }


    const role = await prisma.role.update({
      where: { id: roleId },
      data: updateData,

    })
    return { success: true, data: role }
  } catch (error) {
    log.error('Failed to update role:', error)
    return handleError(error)

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
    return handleError(error)

  }
}

export async function getAll(): Promise<ServiceResponse<RoleWithPermissions[]>> {
  try {
    const roles = await prisma.role.findMany({

    })
    return { success: true, data: roles }
  } catch (error) {
    log.error('Failed to retrieve all roles:', error)
    return handleError(error)

  }
}
