import { NextRequest, NextResponse } from "next/server";
import { getPollResults } from "@/lib/services/poll.service";
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

        const results = await getPollResults(pollId);

        const response = NextResponse.json({
            success: true,
            data: results
        });

        return addCorsHeaders(response);
    } catch (error) {
        console.error("Error fetching poll results:", error);
        const response = NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Failed to fetch poll results"
            },
            { status: 500 }
        );

        return addCorsHeaders(response);
    }
}
