import { NextRequest, NextResponse } from "next/server";
import { mergePollOptions } from "@/lib/services/poll.service";
import { addCorsHeaders, handleCors } from "@/lib/cors";
import { z } from "zod";

const mergeOptionsSchema = z.object({
    sourceOptionId: z.number(),
    targetOptionId: z.number()
});

export async function POST(request: NextRequest) {
    // Handle CORS preflight
    const corsResponse = handleCors(request);
    if (corsResponse) return corsResponse;

    try {
        const body = await request.json();

        // Validate the request body
        const validatedData = mergeOptionsSchema.parse(body);

        const result = await mergePollOptions(
            validatedData.sourceOptionId,
            validatedData.targetOptionId
        );

        const response = NextResponse.json({
            success: true,
            data: result
        });

        return addCorsHeaders(response);
    } catch (error) {
        console.error("Error merging poll options:", error);

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
                error: error instanceof Error ? error.message : "Failed to merge poll options"
            },
            { status: 500 }
        );

        return addCorsHeaders(response);
    }
}
