import { NextResponse } from 'next/server'
import services from '@/lib/services'


export async function POST(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const email = searchParams.get('email')
        if (!email) {
            return NextResponse.json(
                { error: 'Email is required' },
                { status: 400 }
            )
        }

        const response = await services.newsletter.unsubscribe(email)
        console.log("Unsubscription response:", response)
        if (!response.success) {
            return NextResponse.json(
                response,
                { status: 400 }
            )
        }

        return NextResponse.json(response)
    } catch (error) {
        console.error('Error unsubscribing from newsletter:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
} 