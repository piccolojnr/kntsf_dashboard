import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma/client'

export async function GET(
    _: Request,
    { params }: { params: Promise<{ studentId: string }> }
) {
    try {
        const { studentId } = await params
        if (!studentId) {
            return NextResponse.json(
                { error: 'Student ID is required' },
                { status: 400 }
            )
        }
        const student = await prisma.student.findUnique({
            where: {
                studentId: studentId,
            },
        })

        if (!student) {
            return NextResponse.json(
                { error: 'Student not found' },
                { status: 404 }
            )
        }

        return NextResponse.json(student)
    } catch (error) {
        console.error('Error fetching student:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
} 