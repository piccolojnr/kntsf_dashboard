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

export interface PaystackResponse {
    status: boolean
    message: string
    data: {
        authorization_url: string
        access_code: string
        reference: string
    }
} 