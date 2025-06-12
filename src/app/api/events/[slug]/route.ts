import { type NextRequest, NextResponse } from "next/server"
import { getEvent } from "@/lib/services/events.service"

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
    try {
        const { slug } = await params

        if (!slug) {
            return NextResponse.json({ success: false, error: "Event slug is required" }, { status: 400 })
        }

        const result = await getEvent(slug)

        if (!result.success) {
            return NextResponse.json({ success: false, error: result.error }, { status: 404 })
        }

        return NextResponse.json({
            success: true,
            data: result.data,
        })
    } catch (error) {
        console.error("Failed to fetch event:", error)
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
    }
} 