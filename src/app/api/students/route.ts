import { NextResponse } from 'next/server'
import services from '@/lib/services'

export async function POST(request: Request) {
    try {
        const data = await request.json()
        const response = await services.student.create(data)

        if (!response.success) {
            return NextResponse.json(
                { error: response.error },
                { status: 400 }
            )
        }

        return NextResponse.json(response.data)
    } catch (error) {
        console.error('Error creating student:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') || '1')
        const pageSize = parseInt(searchParams.get('pageSize') || '10')
        const search = searchParams.get('search') || undefined

        const response = await services.student.getAll({
            page,
            pageSize,
            search
        })

        if (!response.success) {
            return NextResponse.json(
                { error: response.error },
                { status: 400 }
            )
        }

        return NextResponse.json(response.data)
    } catch (error) {
        console.error('Error fetching students:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
} 