import prisma from '@/lib/prisma/client'
import { PaymentInitiationRequest, PaymentInitiationResponse, StudentData } from '@/types/payment'
import { nanoid } from 'nanoid'

export class PaymentService {
    private static readonly PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY
    private static readonly PAYSTACK_BASE_URL = 'https://api.paystack.co'

    private static async findOrCreateStudent(studentId: string, studentData?: StudentData) {
        try {
            let student = await prisma.student.findUnique({
                where: { studentId }
            })

            if (!student) {
                if (!studentData) {
                    throw new Error('Student not found in the database. Please provide the student\'s data to create a new record.')
                }

                student = await prisma.student.create({
                    data: studentData
                })
            }

            return student
        } catch (error) {
            console.error('Error finding or creating student:', error)
            throw new Error('Failed to find or create student')
        }
    }

    private static async initializePaystackTransaction(
        email: string,
        amount: number,
        reference: string,
        callback_url: string,
        metadata?: Record<string, any>
    ) {
        const response = await fetch(`${this.PAYSTACK_BASE_URL}/transaction/initialize`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.PAYSTACK_SECRET_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email,
                amount: amount * 100, // Convert to kobo
                reference,
                metadata,
                callback_url,
            }),
        })

        if (!response.ok) {
            throw new Error('Failed to initialize Paystack transaction')
        }

        return response.json()
    }

    public static async initiatePayment(
        request: PaymentInitiationRequest
    ): Promise<PaymentInitiationResponse> {
        const { studentId, studentData, amount, callback_url, currency = 'NGN', metadata } = request
        // Find or create student
        const student = await this.findOrCreateStudent(studentId, studentData)

        // Generate unique payment reference
        const paymentReference = `PERMIT-${nanoid(10)}`

        // Create payment record
        const payment = await prisma.payment.create({
            data: {
                studentId: student.id,
                amount,
                currency,
                paymentReference,
                metadata,
            },
        })

        try {
            // Initialize Paystack transaction
            const paystackResponse = await this.initializePaystackTransaction(
                student.email,
                amount,
                paymentReference,
                callback_url,
                metadata
            )

            if (!paystackResponse.data || !paystackResponse.data.authorization_url) {
                throw new Error('Paystack transaction initialization failed')
            }

            // Update payment record with Paystack reference
            await prisma.payment.update({
                where: { id: payment.id },
                data: {
                    paystackRef: paystackResponse.data.reference,
                },
            })

            return {
                checkoutUrl: paystackResponse.data.authorization_url,
                reference: paymentReference,
                status: payment.status,
            }
        } catch (error) {
            // Update payment status to failed
            await prisma.payment.update({
                where: { id: payment.id },
                data: { status: 'FAILED' },
            })

            throw error
        }
    }
} 