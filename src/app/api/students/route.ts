import { NextResponse } from 'next/server'
import services from '@/lib/services'
import { z } from 'zod'



const studentSchema = z.object({
    studentId: z.string().min(1, 'Student ID is required'),
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email format'),
    course: z.string().min(1, 'Course is required'),
    level: z.string().min(1, 'Level is required'),
    number: z.string().min(1, 'Number is required')
})

export async function POST(request: Request) {
    try {
        const data = await request.json()
        const validation = studentSchema.safeParse(data)

        if (!validation.success) {
            return NextResponse.json(
                { error: validation.error },
                { status: 400 }
            )
        }

        const response = await services.student.create(data)
        if (!response) {
            return NextResponse.json(
                response,
                { status: 500 }
            )
        }

        return NextResponse.json(response)
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

        return NextResponse.json(response)
    } catch (error) {
        console.error('Error fetching students:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
} 