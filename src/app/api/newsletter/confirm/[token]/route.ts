import { NextResponse } from 'next/server'
import services from '@/lib/services'

export async function POST(_: Request,
    { params }: { params: Promise<{ token: string }> }
) {
    try {
        const { token } = await params;

        const response = await services.newsletter.confirmSubscription(token);

        if (!response.success) {
            return NextResponse.json(
                { error: response.error },
                { status: 400 }
            )
        }

        return NextResponse.json(response.data)
    } catch (error) {
        console.error('Error confirming newsletter subscription:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
} 