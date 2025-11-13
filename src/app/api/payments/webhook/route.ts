import { NextResponse } from 'next/server'
import { PaymentVerificationService } from '@/services/payment-verification.service'
import { getPaymentGateway } from '@/services/payment-gateway.factory'
import { headers } from 'next/headers'

export async function POST(request: Request) {
    try {
        const headersList = await headers()
        const payload = await request.json()

        // Get the active gateway to determine the signature header name
        const gateway = getPaymentGateway()
        const signatureHeaderName = gateway.getWebhookSignatureHeader()
        const signature = headersList.get(signatureHeaderName) || ''

        // Verify webhook signature (ExpressPay POSTURL may not have signature, gateway handles this)
        const payloadString = typeof payload === 'string' ? payload : JSON.stringify(payload)
        const isValid = gateway.verifyWebhookSignature(payloadString, signature)

        if (!isValid) {
            return NextResponse.json(
                { error: 'Invalid webhook signature' },
                { status: 401 }
            )
        }

        // Process webhook - ExpressPay POSTURL requires immediate HTTP 200 response
        // The service will query transaction status asynchronously
        PaymentVerificationService.handleWebhook(payload, signature).catch((error) => {
            console.error('Error processing webhook asynchronously:', error)
        })

        // Return HTTP 200 immediately as per ExpressPay requirement
        return NextResponse.json({ success: true }, { status: 200 })
    } catch (error) {
        console.error('Webhook processing error:', error)

        // Still return 200 for ExpressPay POSTURL even on error
        // to prevent ExpressPay from retrying
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Internal server error' },
            { status: 200 }
        )
    }
} 