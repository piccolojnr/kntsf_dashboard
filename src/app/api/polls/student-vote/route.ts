import { NextRequest, NextResponse } from "next/server";
import { getStudentVote } from "@/lib/services/poll.service";
import { addCorsHeaders, handleCors } from "@/lib/cors";
import { z } from "zod";

const studentVoteSchema = z.object({
    pollId: z.number(),
    studentId: z.string().min(1, "Student ID is required")
});

export async function POST(request: NextRequest) {
    // Handle CORS preflight
    const corsResponse = handleCors(request);
    if (corsResponse) return corsResponse;

    try {
        const body = await request.json();

        // Validate the request body
        const validatedData = studentVoteSchema.parse(body);

        const vote = await getStudentVote(validatedData.pollId, validatedData.studentId);

        const response = NextResponse.json({
            success: true,
            data: vote
        });

        return addCorsHeaders(response);
    } catch (error) {
        console.error("Error fetching student vote:", error);

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
                error: error instanceof Error ? error.message : "Failed to fetch student vote"
            },
            { status: 500 }
        );

        return addCorsHeaders(response);
    }
}
