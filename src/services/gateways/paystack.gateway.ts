import crypto from 'crypto'
import {
    IPaymentGateway,
    PaymentInitiationData,
    PaymentVerificationResult,
    WebhookPayload,
} from '../payment-gateway.interface'
import { PaymentStatus } from '@prisma/client'

interface PaystackResponse {
    status: boolean
    message: string
    data: {
        authorization_url: string
        access_code: string
        reference: string
        id?: string
        paid_at?: string
        gateway_response?: string
        status: "success" | "failed"
    }
}

export class PaystackGateway implements IPaymentGateway {
    private readonly secretKey: string
    private readonly baseUrl: string = 'https://api.paystack.co'

    constructor() {
        const secretKey = process.env.PAYSTACK_SECRET_KEY
        if (!secretKey) {
            throw new Error('PAYSTACK_SECRET_KEY environment variable is required')
        }
        this.secretKey = secretKey
    }

    async initializeTransaction(
        data: PaymentInitiationData
    ): Promise<{ checkoutUrl: string; reference: string }> {
        const response = await fetch(`${this.baseUrl}/transaction/initialize`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${this.secretKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: data.email,
                amount: data.amount * 100, // Convert to kobo
                reference: data.reference,
                metadata: data.metadata,
                callback_url: data.callback_url,
            }),
        })

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            throw new Error(
                errorData.message || 'Failed to initialize Paystack transaction'
            )
        }

        const result: PaystackResponse = await response.json()

        if (!result.status || !result.data?.authorization_url) {
            throw new Error(
                result.message || 'Paystack transaction initialization failed'
            )
        }

        return {
            checkoutUrl: result.data.authorization_url,
            reference: result.data.reference,
        }
    }

    async verifyTransaction(reference: string): Promise<PaymentVerificationResult> {
        const response = await fetch(
            `${this.baseUrl}/transaction/verify/${reference}`,
            {
                headers: {
                    Authorization: `Bearer ${this.secretKey}`,
                },
            }
        )

        if (!response.ok) {
            throw new Error('Failed to verify Paystack transaction')
        }

        const result: PaystackResponse = await response.json()

        if (!result.data) {
            throw new Error('Invalid Paystack response')
        }

        const { status, gateway_response } = result.data

        const paymentStatus: PaymentStatus =
            status === 'success'
                ? 'SUCCESS'
                : status === 'failed'
                    ? 'FAILED'
                    : 'PENDING'

        return {
            status: paymentStatus,
            transactionId: result.data.id || reference,
            amount: 0, // Will be set by the service layer
            timestamp: result.data.paid_at || new Date().toISOString(),
            message: gateway_response || result.message || 'Transaction processed',
            gatewayResponse: result.data,
        }
    }

    verifyWebhookSignature(payload: string, signature: string): boolean {
        const hash = crypto
            .createHmac('sha512', this.secretKey)
            .update(payload)
            .digest('hex')
        return hash === signature
    }

    async handleWebhook(payload: WebhookPayload): Promise<{
        reference: string
        status: PaymentStatus
    }> {
        const { event, data } = payload

        if (event === 'charge.success') {
            return {
                reference: data.reference,
                status: 'SUCCESS',
            }
        } else if (event === 'charge.failed') {
            return {
                reference: data.reference,
                status: 'FAILED',
            }
        }

        throw new Error(`Unhandled webhook event: ${event}`)
    }

    getWebhookSignatureHeader(): string {
        return 'x-paystack-signature'
    }
}

