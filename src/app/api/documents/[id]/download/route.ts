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

        // Redirect to the file URL
        return NextResponse.redirect(response.data.fileUrl)
    } catch (error) {
        console.error('Error downloading document:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
} 