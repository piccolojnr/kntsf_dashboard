import { NextResponse } from 'next/server'
import services from '@/lib/services'
import { z } from 'zod'

const subscribeSchema = z.object({
    email: z.string().email('Invalid email address'),
    name: z.string().optional(),
    studentId: z.string().optional()
})

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const validation = subscribeSchema.safeParse(body)

        if (!validation.success) {
            return NextResponse.json(
                { error: validation.error.errors[0].message },
                { status: 400 }
            )
        }

        const response = await services.newsletter.subscribe(validation.data)

        if (!response.success) {
            return NextResponse.json(
                { error: response.error },
                { status: 400 }
            )
        }

        return NextResponse.json(response.data)
    } catch (error) {
        console.error('Error subscribing to newsletter:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
} 