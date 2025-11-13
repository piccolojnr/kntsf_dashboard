import { PaymentStatus } from '@prisma/client'

export interface StudentData {
    studentId: string
    name: string
    email: string
    course: string
    level: string
    number: string
}

export interface PaymentInitiationRequest {
    studentId: string
    studentData?: StudentData
    amount: number
    callback_url: string
    currency?: string
    metadata?: Record<string, any>
}

export interface PaymentInitiationResponse {
    checkoutUrl: string
    reference: string
    status: PaymentStatus
}

/**
 * @deprecated Use gateway-specific response types from payment-gateway.interface.ts
 * This interface is kept for backward compatibility only
 */
export interface PaystackResponse {
    status: boolean
    message: string
    data: {
        authorization_url: string
        access_code: string
        reference: string
    }
} 