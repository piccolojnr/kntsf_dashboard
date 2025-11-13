import prisma from '@/lib/prisma/client'
import { PaymentInitiationRequest, PaymentInitiationResponse, StudentData } from '@/types/payment'
import { nanoid } from 'nanoid'
import { getPaymentGateway } from './payment-gateway.factory'

export class PaymentService {
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
            // If student exists but email is missing, update it
            if (!student.email && studentData?.email) {
                student = await prisma.student.update({
                    where: { studentId: student.studentId },
                    data: {
                        email: studentData.email,
                        number: studentData.number,
                    }
                })
            }

            return student
        } catch (error) {
            console.error('Error finding or creating student:', error)
            throw new Error('Failed to find or create student')
        }
    }


    public static async initiatePayment(
        request: PaymentInitiationRequest
    ): Promise<PaymentInitiationResponse> {
        const { studentId, studentData, amount, callback_url, currency = 'GHS', metadata } = request
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
            // Get the active payment gateway
            const gateway = getPaymentGateway()

            // Initialize payment transaction
            const gatewayResponse = await gateway.initializeTransaction({
                email: student.email || "",
                amount,
                reference: paymentReference,
                callback_url,
                currency,
                metadata: {
                    ...metadata,
                    name: student.name || studentData?.name,
                    phoneNumber: student.number || studentData?.number,
                },
            })

            // Update payment record with gateway reference
            await prisma.payment.update({
                where: { id: payment.id },
                data: {
                    gatewayRef: gatewayResponse.reference,
                },
            })

            return {
                checkoutUrl: gatewayResponse.checkoutUrl,
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