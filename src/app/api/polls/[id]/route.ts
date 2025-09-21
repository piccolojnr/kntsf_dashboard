import { NextRequest, NextResponse } from "next/server";
import { getPollById } from "@/lib/services/poll.service";
import { addCorsHeaders, handleCors } from "@/lib/cors";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    // Handle CORS preflight
    const corsResponse = handleCors(request);
    if (corsResponse) return corsResponse;

    try {
        const pollId = parseInt((await params).id);

        if (isNaN(pollId)) {
            const response = NextResponse.json(
                {
                    success: false,
                    error: "Invalid poll ID"
                },
                { status: 400 }
            );
            return addCorsHeaders(response);
        }

        const poll = await getPollById(pollId);

        if (!poll) {
            const response = NextResponse.json(
                {
                    success: false,
                    error: "Poll not found"
                },
                { status: 404 }
            );
            return addCorsHeaders(response);
        }

        const response = NextResponse.json({
            success: true,
            data: poll
        });

        return addCorsHeaders(response);
    } catch (error) {
        console.error("Error fetching poll:", error);
        const response = NextResponse.json(
            {
                success: false,
                error: "Failed to fetch poll"
            },
            { status: 500 }
        );

        return addCorsHeaders(response);
    }
}
