import { NextResponse } from 'next/server'
import { PaymentVerificationService } from '@/services/payment-verification.service'
import { headers } from 'next/headers'

export async function POST(request: Request) {
    try {
        const headersList = await headers()
        const signature = headersList.get('x-paystack-signature')

        if (!signature) {
            return NextResponse.json(
                { error: 'No signature provided' },
                { status: 401 }
            )
        }

        const payload = await request.json()
        await PaymentVerificationService.handleWebhook(payload, signature)

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Webhook processing error:', error)

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