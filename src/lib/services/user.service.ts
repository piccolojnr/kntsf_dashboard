'use server'
import prisma from '../prisma/client'
import { hash, compare } from 'bcryptjs'
import { log } from '../logger'
import { AuthorizedUser, ServiceResponse } from '../types/common'
import { handleError } from '../utils'
import { User } from '@prisma/client'
import { getSession } from '../auth/auth'
import cloudinary from '@/lib/cloudinary';

export interface UserData {
  username: string
  email: string
  password: string
  roleId: number
}

export interface UpdatePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateUserOrderData {
  userId: number;
  newIndex: number;
}

export interface TogglePublishedData {
  userId: number;
  published: boolean;
}

export async function getUser(): Promise<ServiceResponse<User>> {
  try {
    const session = await getSession();

    if (!session || !session.user) {
      return { success: false, error: 'Unauthorized' };
    }

    const { id } = session.user as any;

    if (!id) {
      return { success: false, error: 'Unauthorized' };
    }
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },

    })
    if (!user) {
      return { success: false, error: 'User not found' }
    }
    return { success: true, data: user }
  }
  catch (error) {
    log.error('Failed to get user:', error)
    return handleError(error)

  }
}


export async function updateUser(userData: User): Promise<ServiceResponse<User>> {
  try {
    const session = await getSession();

    if (!session || !session.user) {
      return { success: false, error: 'Unauthorized' };
    }

    const { id } = session.user as any;

    if (!id) {
      return { success: false, error: 'Unauthorized' };
    }

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: {
        ...userData,
        socialLinks: userData.socialLinks ? JSON.stringify(userData.socialLinks) : undefined,
      },
    })

    return { success: true, data: updatedUser }
  }
  catch (error) {
    log.error('Failed to update user:', error)
    return handleError(error)
  }
}

export async function uploadProfileImage(formData: FormData): Promise<ServiceResponse<User>> {
  try {
    const session = await getSession();

    if (!session?.user) {
      return { success: false, error: 'Unauthorized' };
    }

    const { id } = session.user as any;

    if (!id) {
      return { success: false, error: 'Unauthorized' };
    }

    const file = formData.get('image') as File;
    if (!file) {
      return { success: false, error: 'No file uploaded' };
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const uploadResult = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'profile_images',
          public_id: `user_${id}`,
          overwrite: true,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { image: uploadResult.secure_url },
    });

    return { success: true, data: updatedUser };
  } catch (error) {
    log.error('Failed to upload profile image:', error);
    return handleError(error);
  }
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
      },

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
      },
      orderBy: [
        { index: 'asc' },
      ]
    })
    return { success: true, data: users }
  } catch (error) {
    log.error('Failed to search users:', error)
    return handleError(error)
  }
}


export async function updateUserOrder(data: UpdateUserOrderData): Promise<ServiceResponse<User>> {
  try {
    const { userId, newIndex } = data

    // Get the user to be moved
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return { success: false, error: "User not found" }
    }

    const oldIndex = user.index || 0

    // Use a transaction to ensure data consistency
    await prisma.$transaction(async (tx) => {
      if (newIndex > oldIndex) {
        // Moving down: shift users between oldIndex and newIndex up by 1
        await tx.user.updateMany({
          where: {
            index: {
              gt: oldIndex,
              lte: newIndex,
            },
            id: { not: userId },
          },
          data: {
            index: {
              decrement: 1,
            },
          },
        })
      } else if (newIndex < oldIndex) {
        // Moving up: shift users between newIndex and oldIndex down by 1
        await tx.user.updateMany({
          where: {
            index: {
              gte: newIndex,
              lt: oldIndex,
            },
            id: { not: userId },
          },
          data: {
            index: {
              increment: 1,
            },
          },
        })
      }

      // Update the moved user's index
      await tx.user.update({
        where: { id: userId },
        data: { index: newIndex },
      })
    })

    // Return the updated user
    const updatedUser = await prisma.user.findUnique({
      where: { id: userId },
    })

    return { success: true, data: updatedUser! }
  } catch (error) {
    log.error("Failed to update user order:", error)
    return handleError(error)
  }
}
export async function togglePublished(data: TogglePublishedData): Promise<ServiceResponse<User>> {
  try {
    const { userId, published } = data;

    const user = await prisma.user.update({
      where: { id: userId },
      data: { published },
    });

    return { success: true, data: user };
  } catch (error) {
    log.error('Failed to toggle user published status:', error);
    return handleError(error);
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
      },
      orderBy: [
        { index: 'asc' },
      ]
    })
    return { success: true, data: users }
  } catch (error) {
    log.error('Failed to get all users:', error)
    return handleError(error)
  }
}

export async function updatePassword(data: UpdatePasswordData): Promise<ServiceResponse<User>> {
  try {
    const session = await getSession();

    if (!session?.user) {
      return { success: false, error: 'Unauthorized' };
    }

    const { id } = session.user as any;

    if (!id) {
      return { success: false, error: 'Unauthorized' };
    }

    // Get current user to verify current password
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
    });

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    // Verify current password
    const isValidPassword = await compare(data.currentPassword, user.password);
    if (!isValidPassword) {
      return { success: false, error: 'Current password is incorrect' };
    }

    // Hash new password
    const hashedPassword = await hash(data.newPassword, 10);

    // Update password
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { password: hashedPassword },
    });

    return { success: true, data: updatedUser };
  } catch (error) {
    log.error('Failed to update password:', error);
    return handleError(error);
  }
}
