import { NextResponse } from 'next/server'
import { PaymentVerificationService } from '@/services/payment-verification.service'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { startDate, endDate, reference } = body

        // Validate input: either date range OR single reference
        if (reference && (startDate || endDate)) {
            return NextResponse.json(
                { error: 'Cannot specify both reference and date range' },
                { status: 400 }
            )
        }

        if (!reference && !startDate && !endDate) {
            // If no filters provided, default to today
            const today = new Date().toISOString().split('T')[0]
            const result = await PaymentVerificationService.verifyPaymentsBulk({
                startDate: today,
                endDate: today
            })
            return NextResponse.json(result)
        }

        const result = await PaymentVerificationService.verifyPaymentsBulk({
            startDate,
            endDate,
            reference
        })

        return NextResponse.json(result)
    } catch (error) {
        console.error('Bulk payment verification error:', error)

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

