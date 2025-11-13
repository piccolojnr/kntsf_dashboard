import crypto from 'crypto'
import {
    IPaymentGateway,
    PaymentInitiationData,
    PaymentVerificationResult,
    WebhookPayload,
} from '../payment-gateway.interface'
import { PaymentStatus } from '@prisma/client'

interface ExpressPaySubmitResponse {
    status: number
    message: string
    token?: string
    order_id?: string
}

interface ExpressPayQueryResponse {
    result: number // 1 = Approved, 4 = Pending
    'result-text': string
    'order-id': string
    token: string
    'transaction-id': string
    currency: string
    amount: number
    'date-processed': string
}

export class ExpressPayGateway implements IPaymentGateway {
    private readonly merchantId: string
    private readonly apiKey: string
    private readonly baseUrl: string
    private readonly checkoutUrl: string

    constructor() {
        const merchantId = process.env.EXPRESSPAY_MERCHANT_ID
        const apiKey = process.env.EXPRESSPAY_API_KEY
        const baseUrl = process.env.EXPRESSPAY_API_BASE_URL || 'https://sandbox.expresspaygh.com/api'
        const checkoutUrl = process.env.EXPRESSPAY_API_BASE_URL || 'https://sandbox.expresspaygh.com/api/checkout.php'

        if (!merchantId) {
            throw new Error('EXPRESSPAY_MERCHANT_ID environment variable is required')
        }
        if (!apiKey) {
            throw new Error('EXPRESSPAY_API_KEY environment variable is required')
        }

        this.merchantId = merchantId
        this.apiKey = apiKey
        this.baseUrl = baseUrl
        this.checkoutUrl = checkoutUrl
    }

    async initializeTransaction(
        data: PaymentInitiationData
    ): Promise<{ checkoutUrl: string; reference: string }> {
        // Extract name from metadata or use email as fallback
        const name = data.metadata?.name || data.email.split('@')[0]
        const nameParts = name.split(' ')
        const firstName = nameParts[0] || name
        const lastName = nameParts.slice(1).join(' ') || ''

        // Extract phone from metadata if available
        const phoneNumber = data.metadata?.phoneNumber || data.metadata?.number || ''

        // Construct webhook URL for POSTURL callback
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL ||
            (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
            'http://localhost:3000'
        const webhookUrl = `${baseUrl}/api/payments/webhook`

        // Prepare form data
        const formData = new URLSearchParams({
            'merchant-id': this.merchantId,
            'api-key': this.apiKey,
            'amount': data.amount.toString(),
            'currency': data.currency || 'GHS',
            'firstname': firstName,
            'lastname': lastName,
            'email': data.email,
            'phonenumber': phoneNumber,
            'order-id': data.reference,
            'redirect-url': data.callback_url,
            'post-url': data.metadata?.postUrl || webhookUrl, // POSTURL callback - required for mobile money
        })

        const response = await fetch(`${this.baseUrl}/submit.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData.toString(),
        })




        if (!response.ok) {
            throw new Error('Failed to initialize ExpressPay transaction')
        }

        const result: ExpressPaySubmitResponse = await response.json()
        console.log("Payment response", result)


        if (result.status !== 1 || !result.token) {
            throw new Error(result.message || 'ExpressPay transaction initialization failed')
        }

        // Store token in reference (gatewayRef) for later verification via query.php
        return {
            checkoutUrl: `${this.checkoutUrl}?token=${result.token}`,
            reference: result.token, // Store token for query.php verification
        }
    }

    async verifyTransaction(token: string): Promise<PaymentVerificationResult> {
        // ExpressPay uses query.php with token parameter (not order-id)
        const formData = new URLSearchParams({
            'merchant-id': this.merchantId,
            'api-key': this.apiKey,
            'token': token,
        })

        const response = await fetch(`${this.baseUrl}/query.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData.toString(),
        })

        // Read response text once (can only be consumed once)
        const responseText = await response.text()
        console.log("ExpressPay query.php raw response:", responseText)

        if (!response.ok) {
            console.error('ExpressPay query.php error:', {
                status: response.status,
                statusText: response.statusText,
                error: responseText,
                token: token.substring(0, 20) + '...' // Log partial token for debugging
            })
            throw new Error(`Failed to query ExpressPay transaction: ${response.status} ${response.statusText}. ${responseText}`)
        }

        let result: ExpressPayQueryResponse
        try {
            result = JSON.parse(responseText)
        } catch (parseError) {
            console.error("Failed to parse ExpressPay response:", parseError)
            console.error("Response text was:", responseText)
            throw new Error('Invalid JSON response from ExpressPay query endpoint')
        }

        console.log("ExpressPay verify response parsed:", result)

        // Check if result indicates an error (result !== 1 and result !== 4)
        if (result.result === undefined || result.result === null) {
            throw new Error(result['result-text'] || 'Invalid response from ExpressPay')
        }

        // Map ExpressPay result field: 1 = Approved (SUCCESS), 4 = Pending, others = FAILED
        let paymentStatus: PaymentStatus = 'PENDING'
        if (result.result === 1) {
            paymentStatus = 'SUCCESS'
        } else if (result.result === 4) {
            paymentStatus = 'PENDING'
        } else {
            paymentStatus = 'FAILED'
        }

        return {
            status: paymentStatus,
            transactionId: result['transaction-id'] || token,
            amount: result.amount || 0,
            timestamp: result['date-processed'] || new Date().toISOString(),
            message: result['result-text'] || 'Transaction processed',
            gatewayResponse: result,
        }
    }

    verifyWebhookSignature(payload: string, signature: string): boolean {
        // ExpressPay POSTURL may not include signature header
        // If signature is provided, verify it; otherwise, if token exists in payload, accept it
        try {
            const payloadData = typeof payload === 'string' ? JSON.parse(payload) : payload

            // If token exists in payload, it's likely a valid ExpressPay POSTURL callback
            if (payloadData.token) {
                return true
            }

            // If signature is provided, verify it
            if (signature) {
                const hash = crypto
                    .createHmac('sha256', this.apiKey)
                    .update(payload)
                    .digest('hex')
                return hash === signature || payloadData.signature === signature
            }

            return false
        } catch {
            // If payload is not JSON or parsing fails, check if signature matches
            if (signature) {
                const hash = crypto
                    .createHmac('sha256', this.apiKey)
                    .update(payload)
                    .digest('hex')
                return hash === signature
            }
            return false
        }
    }

    async handleWebhook(payload: WebhookPayload): Promise<{
        reference: string
        status: PaymentStatus
    }> {
        // ExpressPay POSTURL callback contains token
        // We need to query the transaction using the token to get actual status
        const token = payload.token || (payload as any).token

        if (!token) {
            throw new Error('Token not found in ExpressPay POSTURL payload')
        }

        // Query transaction status using token
        const queryResult = await this.verifyTransaction(token)

        // Return token as reference (stored in gatewayRef) and status from query
        return {
            reference: token,
            status: queryResult.status,
        }
    }

    getWebhookSignatureHeader(): string {
        return 'x-expresspay-signature'
    }
}

