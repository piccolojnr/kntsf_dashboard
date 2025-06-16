import { NextResponse } from 'next/server'
import services from '@/lib/services'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const category = searchParams.get('category') || undefined
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '10')

        const response = await services.document.getDocuments(category, page, limit)

        if (!response.success) {
            return NextResponse.json(
                { error: response.error },
                { status: 400 }
            )
        }

        return NextResponse.json(response)
    } catch (error) {
        console.error('Error fetching documents:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

