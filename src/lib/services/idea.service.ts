'use server'

import prisma from '../prisma/client'
import { log } from '../logger'
import { ServiceResponse } from '../types/common'
import { handleError } from '../utils'
import { getSession } from '../auth/auth'

export interface IdeaData {
    studentId: string
    title: string
    description: string
    category: string
}

export interface IdeaWithRelations {
    id: number
    title: string
    description: string
    category: string
    status: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'IMPLEMENTED'
    createdAt: Date
    student: {
        name: string
        email: string
        studentId: string
    }
    reviewedBy: {
        name: string
        email: string
    } | null
}

export interface PaginatedResponse<T> {
    data: T[]
    total: number
    page: number
    totalPages: number
}

export async function submitIdea(data: IdeaData): Promise<ServiceResponse<IdeaWithRelations>> {
    try {
        const { studentId } = data


        // Get student record
        const student = await prisma.student.findFirst({
            where: {
                studentId: studentId
            }
        })

        if (!student) {
            return { success: false, error: 'Unauthorized' }
        }


        if (!student) {
            return { success: false, error: 'Student record not found' }
        }

        const idea = await prisma.studentIdea.create({
            data: {
                title: data.title,
                description: data.description,
                category: data.category,
                student: {
                    connect: { id: student.id }
                }
            },
            include: {
                student: {
                    select: {
                        name: true,
                        email: true,
                        studentId: true
                    }
                },
                reviewedBy: {
                    select: {
                        name: true,
                        email: true
                    }
                }
            },
        })

        return {
            success: true,
            data: idea
        }
    } catch (error) {
        log.error('Error submitting idea:', error)
        return handleError(error)
    }
}

export async function getIdeas(
    status?: string,
    page: number = 1,
    limit: number = 10
): Promise<ServiceResponse<PaginatedResponse<IdeaWithRelations>>> {
    try {
        const session = await getSession()
        if (!session?.user) {
            return { success: false, error: 'Unauthorized' }
        }

        // Calculate skip value for pagination
        const skip = (page - 1) * limit

        // Get total count for pagination
        const total = await prisma.studentIdea.count({
            where: {
                ...(status && status !== 'all' ? { status: status as any } : {})
            }
        })

        const ideas = await prisma.studentIdea.findMany({
            where: {
                ...(status && status !== 'all' ? { status: status as any } : {})
            },
            include: {
                student: {
                    select: {
                        name: true,
                        email: true,
                        studentId: true
                    }
                },
                reviewedBy: {
                    select: {
                        name: true,
                        email: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            skip,
            take: limit
        })

        return {
            success: true,
            data: {
                data: ideas,
                total,
                page,
                totalPages: Math.ceil(total / limit)
            }
        }
    } catch (error) {
        log.error('Error fetching ideas:', error)
        return handleError(error)
    }
}

export async function getStudentIdeas(
    page: number = 1,
    limit: number = 10
): Promise<ServiceResponse<PaginatedResponse<IdeaWithRelations>>> {
    try {
        const session = await getSession()
        if (!session?.user) {
            return { success: false, error: 'Unauthorized' }
        }

        const student = await prisma.student.findFirst({
            where: { email: session.user.email as string }
        })

        if (!student) {
            return { success: false, error: 'Student record not found' }
        }

        // Calculate skip value for pagination
        const skip = (page - 1) * limit

        // Get total count for pagination
        const total = await prisma.studentIdea.count({
            where: {
                studentId: student.id
            }
        })

        const ideas = await prisma.studentIdea.findMany({
            where: {
                studentId: student.id
            },
            include: {
                student: {
                    select: {
                        name: true,
                        email: true,
                        studentId: true
                    }
                },
                reviewedBy: {
                    select: {
                        name: true,
                        email: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            skip,
            take: limit
        })

        return {
            success: true,
            data: {
                data: ideas,
                total,
                page,
                totalPages: Math.ceil(total / limit)
            }
        }
    } catch (error) {
        log.error('Error fetching student ideas:', error)
        return handleError(error)
    }
}

export async function updateIdeaStatus(
    id: number,
    status: 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'IMPLEMENTED',
    reviewNotes?: string
): Promise<ServiceResponse<IdeaWithRelations>> {
    try {
        const session = await getSession()
        if (!session?.user) {
            return { success: false, error: 'Unauthorized' }
        }

        const { id: userId } = session.user as any
        if (!userId) {
            return { success: false, error: 'Unauthorized' }
        }

        const idea = await prisma.studentIdea.update({
            where: { id },
            data: {
                status,
                reviewNotes,
                reviewedBy: {
                    connect: { id: parseInt(userId) }
                }
            },
            include: {
                student: {
                    select: {
                        name: true,
                        email: true,
                        studentId: true
                    }
                },
                reviewedBy: {
                    select: {
                        name: true,
                        email: true
                    }
                }
            }
        })

        return {
            success: true,
            data: idea
        }
    } catch (error) {
        log.error('Error updating idea status:', error)
        return handleError(error)
    }
} 