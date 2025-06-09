import { NextResponse } from 'next/server'
import { PaymentService } from '@/services/payment.service'
import { PaymentInitiationRequest } from '@/types/payment'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const paymentRequest: PaymentInitiationRequest = {
            studentId: body.studentId,
            callback_url: body.callback_url,
            studentData: body.studentData,
            amount: body.amount,
            currency: body.currency,
            metadata: body.metadata,
        }

        // student id or student data is required
        if (!paymentRequest.studentId && !paymentRequest.studentData) {
            return NextResponse.json(
                { error: 'Student ID or student data is required' },
                { status: 400 }
            )
        }

        const response = await PaymentService.initiatePayment(paymentRequest)

        return NextResponse.json(response)
    } catch (error) {
        console.error('Payment initiation error:', error)

        if (error instanceof Error) {
            return NextResponse.json(
                { error: error.message },
                { status: 400 }
            )
        }

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
} 