import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma/client'
import { BASE_URL } from '@/lib/constants'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ permitCode: string }> }
) {
    try {
        const { permitCode } = await params
        if (!permitCode) {
            return NextResponse.json(
                { error: 'Permit code is required' },
                { status: 400 }
            )
        }
        const permit = await prisma.permit.findUnique({
            where: {
                originalCode: permitCode,
            },
            include: {
                student: true,
            }
        })

        if (!permit) {
            return NextResponse.json(
                { error: 'Permit not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            data: permit,
            permitCode,
            qrCode: `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(`${BASE_URL}/permits/verify?code=${permitCode}`)}&size=200x200`,
        })
    } catch (error) {
        console.error('Error fetching permit:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
} 