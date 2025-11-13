import { PaymentStatus } from '@prisma/client'

export interface PaymentInitiationData {
    email: string
    amount: number
    reference: string
    callback_url: string
    metadata?: Record<string, any>
    currency?: string
}

export interface PaymentVerificationResult {
    status: PaymentStatus
    transactionId: string
    amount: number
    timestamp: string
    message: string
    gatewayResponse: any
}

export interface WebhookPayload {
    event: string
    data: any
    [key: string]: any
}

export interface IPaymentGateway {
    /**
     * Initialize a payment transaction and return the checkout URL
     */
    initializeTransaction(data: PaymentInitiationData): Promise<{
        checkoutUrl: string
        reference: string
    }>

    /**
     * Verify a payment transaction by reference
     */
    verifyTransaction(reference: string): Promise<PaymentVerificationResult>

    /**
     * Verify webhook signature authenticity
     */
    verifyWebhookSignature(payload: string, signature: string): boolean

    /**
     * Process webhook payload and return payment reference
     */
    handleWebhook(payload: WebhookPayload): Promise<{
        reference: string
        status: PaymentStatus
    }>

    /**
     * Get the webhook signature header name for this gateway
     */
    getWebhookSignatureHeader(): string
}

