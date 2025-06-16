import { NextResponse } from 'next/server'
import services from '@/lib/services'
import { z } from 'zod'
const ideaSchema = z.object({
    studentId: z.string().min(1, 'Student ID is required'),
    title: z.string().min(5, 'Title must be at least 5 characters long'),
    description: z.string().min(10, 'Description must be at least 10 characters long'),
    category: z.string().min(3, 'Category must be at least 3 characters long')
});



export async function POST(request: Request) {
    try {
        const data = await request.json()
        // Validate the incoming data against the schema
        const validation = ideaSchema.safeParse(data)
        if (!validation.success) {
            return NextResponse.json(
                { error: validation.error.errors[0].message },
                { status: 400 }
            )
        }

        const response = await services.idea.submitIdea(data)
        if (!response.success) {
            return NextResponse.json(
                response,
                {
                    status:
                        response.error === 'Unauthorized' ? 200 : 400
                }
            )
        }

        return NextResponse.json(response)
    } catch (error) {
        console.error('Error submitting idea:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
} 