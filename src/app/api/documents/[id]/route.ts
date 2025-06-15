import { NextResponse } from 'next/server'
import services from '@/lib/services'

export async function GET(
    _: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: idString } = await params
        const id = parseInt(idString)
        const response = await services.document.getDocumentById(id)

        if (!response.success || !response.data) {
            return NextResponse.json(
                { error: response.error },
                { status: 400 }
            )
        }

        // Return the document data
        return NextResponse.json(response.data, { status: 200 })
    } catch (error) {
        console.error('Error getting document:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
} 