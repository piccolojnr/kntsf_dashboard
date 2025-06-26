import { NextRequest, NextResponse } from 'next/server'
import { sendContactEmail } from '@/lib/services/email.service'
import { ServiceResponse } from '@/lib/types/common'

export async function POST(req: NextRequest): Promise<NextResponse<ServiceResponse>> {
    try {
        const body = await req.json()
        const { name, email, subject, message } = body
        if (!name || !email || !subject || !message) {
            return NextResponse.json({ success: false, error: 'All fields are required' }, { status: 400 })
        }
        const result = await sendContactEmail({ name, email, subject, message })
        if (!result.success) {
            return NextResponse.json(result, { status: 500 })
        }
        return NextResponse.json({ success: true })
    } catch {
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
    }
} 