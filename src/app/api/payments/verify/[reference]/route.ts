import { NextResponse } from 'next/server'
import { PaymentVerificationService } from '@/services/payment-verification.service'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ reference: string }> }
) {
    const { reference } = await params
    try {

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
        console.error('Verification reference:', reference)

        if (error instanceof Error) {
            // Return more detailed error for debugging
            return NextResponse.json(
                {
                    error: error.message,
                    reference: reference,
                    details: 'Check server logs for more information'
                },
                { status: 400 }
            )
        }

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
} 