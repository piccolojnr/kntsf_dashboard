import { NextRequest, NextResponse } from "next/server";
import { addPollOption } from "@/lib/services/poll.service";
import { addCorsHeaders, handleCors } from "@/lib/cors";
import { z } from "zod";

const addOptionSchema = z.object({
    pollId: z.number(),
    text: z.string().min(1, "Option text is required").max(500, "Option text too long"),
    studentId: z.string().min(1, "Student ID is required")
});

export async function POST(request: NextRequest) {
    // Handle CORS preflight
    const corsResponse = handleCors(request);
    if (corsResponse) return corsResponse;

    try {
        const body = await request.json();

        // Validate the request body
        const validatedData = addOptionSchema.parse(body);

        const option = await addPollOption(validatedData);

        const response = NextResponse.json({
            success: true,
            data: option
        });

        return addCorsHeaders(response);
    } catch (error) {
        console.error("Error adding poll option:", error);

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
                error: error instanceof Error ? error.message : "Failed to add poll option"
            },
            { status: 500 }
        );

        return addCorsHeaders(response);
    }
}
