import { NextResponse } from 'next/server'
import { PaymentVerificationService } from '@/services/payment-verification.service'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ reference: string }> }
) {
    try {
        const { reference } = await params

        if (!reference) {
            return NextResponse.json(
                { error: 'Payment reference is required' },
                { status: 400 }
            )
        }

        const result = await PaymentVerificationService.verifyPayment(reference)

        return NextResponse.json(result)
    } catch (error) {
        console.error('Payment verification error:', error)

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