import prisma from '@/lib/prisma/client'
import services from '@/lib/services'
import { Payment, PaymentStatus, Permit, Student } from '@prisma/client'
import crypto from 'crypto'

export class PaymentVerificationService {
    private static readonly PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY
    private static readonly PAYSTACK_BASE_URL = 'https://api.paystack.co'

    private static verifyPaystackSignature(payload: string, signature: string): boolean {
        const hash = crypto
            .createHmac('sha512', this.PAYSTACK_SECRET_KEY!)
            .update(payload)
            .digest('hex')
        return hash === signature
    }

    private static async verifyPaystackTransaction(reference: string) {
        const response = await fetch(
            `${this.PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
            {
                headers: {
                    Authorization: `Bearer ${this.PAYSTACK_SECRET_KEY}`,
                },
            }
        )

        if (!response.ok) {
            throw new Error('Failed to verify Paystack transaction')
        }

        return response.json()
    }

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
            const payment = await prisma.payment.findUnique({
                where: { paymentReference: reference },
                include: { student: true },
            })

            if (!payment) {
                throw new Error('Payment not found')
            }

            const paystackResponse = await this.verifyPaystackTransaction(reference)

            if (!paystackResponse.data) {
                throw new Error('Invalid Paystack response')
            }

            const { status, gateway_response } = paystackResponse.data

            // Update payment status
            const paymentStatus: PaymentStatus =
                status === 'success' ? 'SUCCESS' :
                    status === 'failed' ? 'FAILED' :
                        'PENDING'

            await prisma.payment.update({
                where: { id: payment.id },
                data: {
                    status: paymentStatus,
                    metadata: {
                        ...payment.metadata as Record<string, any>,
                        verificationResponse: paystackResponse.data,
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
            if (paymentStatus === 'SUCCESS' && !payment.permitId) {
                const res = await services.permit.create({
                    studentId: payment.student.studentId + "",
                    paymentId: payment.id,
                    amountPaid: payment.amount,
                    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
                })
                permit = res.data || null
            } else if (paymentStatus === 'SUCCESS' && payment.permitId) {
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
                status: paymentStatus,
                message: gateway_response,
                transactionId: paystackResponse.data.id,
                amount: payment.amount,
                timestamp: paystackResponse.data.paid_at,
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
            // Verify Paystack signature
            const isValid = this.verifyPaystackSignature(
                JSON.stringify(payload),
                signature
            )

            if (!isValid) {
                throw new Error('Invalid Paystack signature')
            }

            const { event, data } = payload

            if (event === 'charge.success') {
                const payment = await prisma.payment.findFirst({
                    where: { paystackRef: data.reference },
                })

                if (!payment) {
                    throw new Error('Payment not found')
                }

                // Update payment status
                await prisma.payment.update({
                    where: { id: payment.id },
                    data: {
                        status: 'SUCCESS',
                        metadata: {
                            ...payment.metadata as Record<string, any>,
                            webhookData: data,
                        },
                    },
                })

                // Create permit if payment is successful
                // TODO: get expiry date from config or environment variable
                await services.permit.create({
                    studentId: payment.studentId + "",
                    paymentId: payment.id,
                    amountPaid: payment.amount,
                    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
                })
            }

            return { success: true }
        } catch (error) {
            console.error('Webhook processing error:', error)
            throw error
        }
    }
} 