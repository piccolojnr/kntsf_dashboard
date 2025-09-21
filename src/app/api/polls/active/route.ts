import { NextRequest, NextResponse } from "next/server";
import { getActivePolls } from "@/lib/services/poll.service";
import { addCorsHeaders, handleCors } from "@/lib/cors";

export async function GET(request: NextRequest) {
    // Handle CORS preflight
    const corsResponse = handleCors(request);
    if (corsResponse) return corsResponse;

    try {
        const polls = await getActivePolls();

        const response = NextResponse.json({
            success: true,
            data: polls
        });

        return addCorsHeaders(response);
    } catch (error) {
        console.error("Error fetching active polls:", error);
        const response = NextResponse.json(
            {
                success: false,
                error: "Failed to fetch active polls"
            },
            { status: 500 }
        );

        return addCorsHeaders(response);
    }
}
