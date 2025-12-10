import prisma from '@/lib/prisma/client'
import services from '@/lib/services'
import { Payment, PaymentStatus, Permit, Student } from '@prisma/client'
import { getPaymentGateway } from './payment-gateway.factory'

export class PaymentVerificationService {

    public static async verifyPayment(reference: string): Promise<{
        status: PaymentStatus,
        transactionId: string,
        amount: number,
        timestamp: string,
        message: string,
        payment: Payment,
        permit: Permit | null,
    }> {
        try {
            // Get the active payment gateway first to determine lookup strategy
            const gateway = getPaymentGateway()
            const gatewayType = process.env.PAYMENT_GATEWAY || 'expresspay'

            console.log(`Verifying payment with reference: ${reference}, gateway: ${gatewayType}`)

            // Try to find payment by paymentReference first (order-id for ExpressPay)
            let payment = await prisma.payment.findUnique({
                where: { paymentReference: reference },
                include: { student: true },
            })

            // For ExpressPay: if not found by paymentReference, try gatewayRef (token)
            // This handles cases where token is passed directly
            if (!payment && gatewayType.toLowerCase() === 'expresspay') {
                console.log(`Payment not found by paymentReference, trying gatewayRef lookup...`)
                payment = await prisma.payment.findFirst({
                    where: { gatewayRef: reference },
                    include: { student: true },
                })
            }

            if (!payment) {
                console.error(`Payment not found for reference: ${reference}`)
                throw new Error(`Payment not found for reference: ${reference}`)
            }

            console.log(`Payment found: ID=${payment.id}, paymentReference=${payment.paymentReference}, gatewayRef=${payment.gatewayRef ? '***' : 'null'}`)

            // For ExpressPay: gatewayRef contains token (used for query.php)
            // For PayStack: gatewayRef contains PayStack reference
            // If no gatewayRef, use paymentReference (fallback)
            const verificationReference = payment.gatewayRef || reference

            if (!verificationReference) {
                throw new Error('No verification reference available for payment')
            }

            console.log(`Using verification reference: ${verificationReference.substring(0, 20)}...`)

            // Verify transaction using gateway
            const verificationResult = await gateway.verifyTransaction(verificationReference)

            // Update payment status
            await prisma.payment.update({
                where: { id: payment.id },
                data: {
                    status: verificationResult.status,
                    metadata: {
                        ...payment.metadata as Record<string, any>,
                        verificationResponse: verificationResult.gatewayResponse,
                    },
                },
            })
            // If payment is successful, create permit
            let permit: Permit & {
                student: Student
                issuedBy: {
                    username: string
                } | null
            } | null = null
            if (verificationResult.status === 'SUCCESS' && !payment.permitId) {
                const res = await services.permit.create({
                    studentId: payment.student.studentId + "",
                    paymentId: payment.id,
                })
                permit = res.data || null
            } else if (verificationResult.status === 'SUCCESS' && payment.permitId) {
                permit = await prisma.permit.findUnique({
                    where: { id: payment.permitId },
                    include: {
                        student: true,
                        issuedBy: {
                            select: {
                                username: true
                            }
                        }
                    }
                })
                if (!permit) {
                    throw new Error('Permit not found')
                }

            }

            return {
                status: verificationResult.status,
                message: verificationResult.message,
                transactionId: verificationResult.transactionId,
                amount: verificationResult.amount || payment.amount,
                timestamp: verificationResult.timestamp,
                payment,
                permit: permit || null,
            }
        } catch (error) {
            console.error('Payment verification error:', error)
            throw error
        }
    }

    public static async handleWebhook(payload: any, signature: string) {
        try {
            // Get the active payment gateway
            const gateway = getPaymentGateway()

            // Verify webhook signature
            const payloadString = typeof payload === 'string' ? payload : JSON.stringify(payload)
            const isValid = gateway.verifyWebhookSignature(payloadString, signature)

            if (!isValid) {
                throw new Error('Invalid webhook signature')
            }

            // Process webhook using gateway
            const webhookResult = await gateway.handleWebhook(payload)

            // Find payment by gateway reference (token for ExpressPay, PayStack ref for PayStack)
            // For ExpressPay: webhookResult.reference is the token (stored in gatewayRef)
            // For PayStack: webhookResult.reference is the PayStack reference (stored in gatewayRef)
            let payment = await prisma.payment.findFirst({
                where: { gatewayRef: webhookResult.reference },
                include: { student: true },
            })

            // Fallback: try paymentReference if gatewayRef lookup fails
            if (!payment) {
                payment = await prisma.payment.findFirst({
                    where: { paymentReference: webhookResult.reference },
                    include: { student: true },
                })
            }

            if (!payment) {
                throw new Error('Payment not found')
            }

            // Update payment status
            await prisma.payment.update({
                where: { id: payment.id },
                data: {
                    status: webhookResult.status,
                    metadata: {
                        ...payment.metadata as Record<string, any>,
                        webhookData: payload,
                    },
                },
            })

            // Create permit if payment is successful
            if (webhookResult.status === 'SUCCESS' && !payment.permitId) {
                await services.permit.create({
                    studentId: payment.student.studentId + "",
                    paymentId: payment.id,
                })
            } else if (webhookResult.status === 'SUCCESS' && payment.permitId) {
                await prisma.permit.findUnique({
                    where: { id: payment.permitId },
                    include: {
                        student: true,
                        issuedBy: {
                            select: {
                                username: true
                            }
                        }
                    }
                })
            }

            return { success: true }
        } catch (error) {
            console.error('Webhook processing error:', error)
            throw error
        }
    }

    public static async verifyPaymentsBulk(filters: {
        startDate?: string
        endDate?: string
        reference?: string
    }): Promise<{
        total: number
        successful: number
        failed: number
        skipped: number
        errors: Array<{ paymentId: number; error: string }>
    }> {
        const { startDate, endDate, reference } = filters
        const gateway = getPaymentGateway()
        const errors: Array<{ paymentId: number; error: string }> = []
        const bulkVerifiedAt = new Date().toISOString()

        try {
            // Build where clause
            const where: any = {
                gatewayRef: { not: null }, // Only process payments with gatewayRef
                status: { in: ['PENDING'] }, // Only PENDING or FAILED payments
                student: {
                    deletedAt: null
                }
            }



            // Handle reference filter
            if (reference) {
                where.OR = [
                    { paymentReference: reference },
                    { gatewayRef: reference }
                ]
            } else {
                // Date range filtering
                const dateRange = this.buildDateRange(startDate, endDate)
                where.createdAt = dateRange
            }

            // Fetch payments matching criteria (without student for efficiency)
            const payments = await prisma.payment.findMany({
                where,
                select: {
                    id: true,
                    gatewayRef: true,
                    permitId: true,
                    amount: true,
                    metadata: true,
                    student: {
                        select: {
                            studentId: true
                        }
                    }
                }
            }) as Array<{
                id: number
                gatewayRef: string
                permitId: number | null
                amount: number
                metadata: any
                student: { studentId: string }
            }>

            const total = payments.length
            let successful = 0
            let failed = 0

            // Process payments sequentially
            for (const payment of payments) {
                try {
                    // Verify transaction using gateway
                    const verificationResult = await gateway.verifyTransaction(payment.gatewayRef)

                    // Update payment status
                    await prisma.payment.update({
                        where: { id: payment.id },
                        data: {
                            status: verificationResult.status,
                            metadata: {
                                ...payment.metadata as Record<string, any>,
                                verificationResponse: verificationResult.gatewayResponse,
                                bulkVerifiedAt
                            },
                        },
                    })

                    // Create permit if successful and permit doesn't exist
                    if (verificationResult.status === 'SUCCESS' && !payment.permitId) {
                        await services.permit.create({
                            studentId: payment.student.studentId + "",
                            paymentId: payment.id,
                        })
                    }

                    // Count based on actual verification result status
                    if (verificationResult.status === 'SUCCESS') {
                        successful++
                    } else if (verificationResult.status === 'FAILED') {
                        failed++
                        errors.push({
                            paymentId: payment.id,
                            error: verificationResult.message || 'Transaction failed'
                        })
                    } else {
                        // PENDING or other status
                        successful++
                    }
                } catch (error) {
                    failed++
                    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

                    // Mark payment as failed if verification fails
                    await prisma.payment.update({
                        where: { id: payment.id },
                        data: {
                            status: 'FAILED',
                            metadata: {
                                ...payment.metadata as Record<string, any>,
                                verificationError: errorMessage,
                                bulkVerifiedAt
                            },
                        },
                    })

                    errors.push({
                        paymentId: payment.id,
                        error: errorMessage
                    })
                }
            }

            return {
                total,
                successful,
                failed,
                skipped: 0,
                errors
            }
        } catch (error) {
            console.error('Bulk payment verification error:', error)
            throw error
        }
    }

    private static buildDateRange(startDate?: string, endDate?: string): { gte?: Date; lte?: Date } {
        // Default to today if no dates provided
        const start = startDate ? new Date(startDate) : new Date()
        start.setHours(0, 0, 0, 0)

        const end = endDate ? new Date(endDate) : new Date()
        end.setHours(23, 59, 59, 999)

        return {
            gte: start,
            lte: end
        }
    }
} 