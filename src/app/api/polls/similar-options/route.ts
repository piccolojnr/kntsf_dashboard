import { NextRequest, NextResponse } from "next/server";
import { findSimilarOptions } from "@/lib/services/poll.service";
import { addCorsHeaders, handleCors } from "@/lib/cors";
import { z } from "zod";

const similarOptionsSchema = z.object({
    pollId: z.number(),
    text: z.string().min(1, "Text is required"),
    threshold: z.number().min(0).max(1).optional().default(0.8)
});

export async function POST(request: NextRequest) {
    // Handle CORS preflight
    const corsResponse = handleCors(request);
    if (corsResponse) return corsResponse;

    try {
        const body = await request.json();

        // Validate the request body
        const validatedData = similarOptionsSchema.parse(body);

        const similarOptions = await findSimilarOptions(
            validatedData.pollId,
            validatedData.text,
            validatedData.threshold
        );

        const response = NextResponse.json({
            success: true,
            data: {
                similarOptions,
                count: similarOptions.length
            }
        });

        return addCorsHeaders(response);
    } catch (error) {
        console.error("Error finding similar options:", error);

        if (error instanceof z.ZodError) {
            const response = NextResponse.json(
                {
                    success: false,
                    error: "Invalid request data",
                    details: error.errors
                },
                { status: 400 }
            );
            return addCorsHeaders(response);
        }

        const response = NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Failed to find similar options"
            },
            { status: 500 }
        );

        return addCorsHeaders(response);
    }
}
