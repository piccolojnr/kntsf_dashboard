'use server'

import prisma from '../prisma/client'
import { log } from '../logger'
import { ServiceResponse } from '../types/common'
import { handleError } from '../utils'
import { Payment, PaymentStatus } from '@prisma/client'
import { PaymentVerificationService } from '@/services/payment-verification.service'

export interface PaymentWithRelations extends Payment {
    student: {
        studentId: string
        name: string
        email: string
        course: string
        level: string
    }
    permit?: {
        id: number
        permitCode: string
        status: string
        createdAt: Date
    } | null
}

export interface PaymentStats {
    totalPayments: number
    totalAmount: number
    successfulPayments: number
    failedPayments: number
    pendingPayments: number
    cancelledPayments: number
    averageAmount: number
    monthlyRevenue: Array<{
        month: string
        amount: number
        count: number
    }>
}

export interface PaymentFilters {
    status?: PaymentStatus | string;
    startDate?: string;
    endDate?: string;
    minAmount?: number;
    maxAmount?: number;
    page?: number;
    pageSize?: number;
    /**
     * Optional free-text search on student name, student ID, or email
     */
    query?: string;
}

export async function getPayments(): Promise<ServiceResponse<PaymentWithRelations[]>> {
    try {
        const payments = await prisma.payment.findMany({
            include: {
                student: {
                    select: {
                        studentId: true,
                        name: true,
                        email: true,
                        course: true,
                        level: true
                    }
                },
                permit: {
                    select: {
                        id: true,
                        permitCode: true,
                        status: true,
                        createdAt: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return {
            success: true,
            data: payments.map(payment => ({
                ...payment,
                student: {
                    studentId: payment.student.studentId,
                    name: payment.student.name || '',
                    email: payment.student.email || '',
                    course: payment.student.course || '',
                    level: payment.student.level || ''
                },
                permit: payment.permit ? {
                    id: payment.permit.id,
                    permitCode: payment.permit.permitCode,
                    status: payment.permit.status,
                    createdAt: payment.permit.createdAt
                } : null
            }))
        }
    } catch (error) {
        log.error('Error fetching payments:', error)
        return handleError(error)
    }
}

export async function getPaymentById(id: number): Promise<ServiceResponse<PaymentWithRelations>> {
    try {
        const payment = await prisma.payment.findUnique({
            where: { id },
            include: {
                student: {
                    select: {
                        studentId: true,
                        name: true,
                        email: true,
                        course: true,
                        level: true
                    }
                },
                permit: {
                    select: {
                        id: true,
                        permitCode: true,
                        status: true,
                        createdAt: true
                    }
                }
            }
        })

        if (!payment) {
            return {
                success: false,
                error: 'Payment not found'
            }
        }

        return {
            success: true,
            data: {
                ...payment,
                student: {
                    studentId: payment.student.studentId,
                    name: payment.student.name || '',
                    email: payment.student.email || '',
                    course: payment.student.course || '',
                    level: payment.student.level || ''
                },
                permit: payment.permit ? {
                    id: payment.permit.id,
                    permitCode: payment.permit.permitCode,
                    status: payment.permit.status,
                    createdAt: payment.permit.createdAt
                } : null
            }
        }
    } catch (error) {
        log.error('Error fetching payment by ID:', error)
        return handleError(error)
    }
}

export async function getPaymentStats(): Promise<ServiceResponse<PaymentStats>> {
    try {
        // Get basic payment statistics
        const [totalStats, statusStats, monthlyStats] = await Promise.all([
            prisma.payment.aggregate({
                _count: true,
                _sum: { amount: true },
                _avg: { amount: true }
            }),
            prisma.payment.groupBy({
                by: ['status'],
                _count: true,
                _sum: { amount: true }
            }),
            prisma.payment.groupBy({
                by: ['createdAt'],
                _count: true,
                _sum: { amount: true },
                orderBy: { createdAt: 'desc' },
                take: 12
            })
        ])

        // Process monthly stats
        const monthlyRevenue = monthlyStats.map(stat => ({
            month: new Date(stat.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short'
            }),
            amount: stat._sum.amount || 0,
            count: stat._count
        }))

        // Process status stats
        const stats: PaymentStats = {
            totalPayments: totalStats._count,
            totalAmount: totalStats._sum.amount || 0,
            averageAmount: totalStats._avg.amount || 0,
            successfulPayments: statusStats.find(s => s.status === 'SUCCESS')?._count || 0,
            failedPayments: statusStats.find(s => s.status === 'FAILED')?._count || 0,
            pendingPayments: statusStats.find(s => s.status === 'PENDING')?._count || 0,
            cancelledPayments: statusStats.find(s => s.status === 'CANCELLED')?._count || 0,
            monthlyRevenue
        }

        return {
            success: true,
            data: stats
        }
    } catch (error) {
        log.error('Error fetching payment statistics:', error)
        return handleError(error)
    }
}

export async function getPaymentsByStatus(status: PaymentStatus): Promise<ServiceResponse<PaymentWithRelations[]>> {
    try {
        const payments = await prisma.payment.findMany({
            where: { status },
            include: {
                student: {
                    select: {
                        studentId: true,
                        name: true,
                        email: true,
                        course: true,
                        level: true
                    }
                },
                permit: {
                    select: {
                        id: true,
                        permitCode: true,
                        status: true,
                        createdAt: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return {
            success: true,
            data: payments.map(payment => ({
                ...payment,
                student: {
                    studentId: payment.student.studentId,
                    name: payment.student.name || '',
                    email: payment.student.email || '',
                    course: payment.student.course || '',
                    level: payment.student.level || ''
                },
                permit: payment.permit ? {
                    id: payment.permit.id,
                    permitCode: payment.permit.permitCode,
                    status: payment.permit.status,
                    createdAt: payment.permit.createdAt
                } : null
            }))
        }
    } catch (error) {
        log.error('Error fetching payments by status:', error)
        return handleError(error)
    }
}

export async function searchPayments(query: string): Promise<ServiceResponse<PaymentWithRelations[]>> {
    try {
        const payments = await prisma.payment.findMany({
            where: {
                OR: [
                    {
                        paymentReference: {
                            contains: query
                        }
                    },
                    {
                        student: {
                            OR: [
                                {
                                    name: {
                                        contains: query
                                    }
                                },
                                {
                                    studentId: {
                                        contains: query
                                    }
                                },
                                {
                                    email: {
                                        contains: query
                                    }
                                }
                            ]
                        }
                    }
                ]
            },
            include: {
                student: {
                    select: {
                        studentId: true,
                        name: true,
                        email: true,
                        course: true,
                        level: true
                    }
                },
                permit: {
                    select: {
                        id: true,
                        permitCode: true,
                        status: true,
                        createdAt: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return {
            success: true,
            data: payments.map(payment => ({
                ...payment,
                student: {
                    studentId: payment.student.studentId,
                    name: payment.student.name || '',
                    email: payment.student.email || '',
                    course: payment.student.course || '',
                    level: payment.student.level || ''
                },
                permit: payment.permit ? {
                    id: payment.permit.id,
                    permitCode: payment.permit.permitCode,
                    status: payment.permit.status,
                    createdAt: payment.permit.createdAt
                } : null
            }))
        }
    } catch (error) {
        log.error('Error searching payments:', error)
        return handleError(error)
    }
}

export async function getPaymentsPaginated(filters: PaymentFilters = {}): Promise<ServiceResponse<{ data: PaymentWithRelations[]; total: number; page: number; pageSize: number }>> {
    try {
        const {
            status,
            startDate,
            endDate,
            minAmount,
            maxAmount,
            page = 1,
            pageSize = 10,
            query,
        } = filters;

        const where: any = {
            student: {
                deletedAt: null,
                ...(query && {
                    OR: [
                        {
                            name: {
                                contains: query,
                            },
                        },
                        {
                            studentId: {
                                contains: query,
                            },
                        },
                        {
                            email: {
                                contains: query,
                            },
                        },
                    ],
                }),
            },
        };
        if (status) where.status = status;
        if (startDate) where.createdAt = { ...(where.createdAt || {}), gte: new Date(startDate) };
        if (endDate) where.createdAt = { ...(where.createdAt || {}), lte: new Date(endDate) };
        if (minAmount !== undefined) where.amount = { ...(where.amount || {}), gte: minAmount };
        if (maxAmount !== undefined) where.amount = { ...(where.amount || {}), lte: maxAmount };

        const [total, data] = await Promise.all([
            prisma.payment.count({ where }),
            prisma.payment.findMany({
                where,
                include: {
                    student: {
                        select: {
                            studentId: true,
                            name: true,
                            email: true,
                            course: true,
                            level: true
                        }
                    },
                    permit: {
                        select: {
                            id: true,
                            permitCode: true,
                            status: true,
                            createdAt: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * pageSize,
                take: pageSize,
            })
        ]);
        return {
            success: true,
            data: {
                data: data.map(payment => ({
                    ...payment,
                    student: {
                        studentId: payment.student.studentId,
                        name: payment.student.name || '',
                        email: payment.student.email || '',
                        course: payment.student.course || '',
                        level: payment.student.level || ''
                    },
                    permit: payment.permit ? {
                        id: payment.permit.id,
                        permitCode: payment.permit.permitCode,
                        status: payment.permit.status,
                        createdAt: payment.permit.createdAt
                    } : null
                })),
                total, page, pageSize
            }
        };
    } catch (error) {
        log.error('Error fetching paginated payments:', error);
        return handleError(error);
    }
}

export interface BulkVerificationFilters {
    startDate?: string;
    endDate?: string;
    reference?: string;
}

export interface BulkVerificationResult {
    total: number;
    successful: number;
    failed: number;
    skipped: number;
    errors: Array<{ paymentId: number; error: string }>;
}

export async function verifyPaymentsBulk(filters: BulkVerificationFilters): Promise<ServiceResponse<BulkVerificationResult>> {
    try {
        // Call PaymentVerificationService directly since this is a server action
        const result = await PaymentVerificationService.verifyPaymentsBulk(filters)

        return {
            success: true,
            data: result
        }
    } catch (error) {
        log.error('Error verifying payments in bulk:', error)
        return handleError(error)
    }
}