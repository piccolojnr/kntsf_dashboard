import { NextRequest, NextResponse } from "next/server";
import { updatePollOption, deletePollOption } from "@/lib/services/poll.service";
import { addCorsHeaders, handleCors } from "@/lib/cors";
import { z } from "zod";

const updateOptionSchema = z.object({
    text: z.string().min(1, "Option text is required").max(500, "Option text too long")
});

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    // Handle CORS preflight
    const corsResponse = handleCors(request);
    if (corsResponse) return corsResponse;

    try {
        const optionId = parseInt((await params).id);

        if (isNaN(optionId)) {
            const response = NextResponse.json(
                {
                    success: false,
                    error: "Invalid option ID"
                },
                { status: 400 }
            );
            return addCorsHeaders(response);
        }

        const body = await request.json();

        // Validate the request body
        const validatedData = updateOptionSchema.parse(body);

        const option = await updatePollOption({
            optionId,
            text: validatedData.text
        });

        const response = NextResponse.json({
            success: true,
            data: option
        });

        return addCorsHeaders(response);
    } catch (error) {
        console.error("Error updating poll option:", error);

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
                error: error instanceof Error ? error.message : "Failed to update poll option"
            },
            { status: 500 }
        );

        return addCorsHeaders(response);
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    // Handle CORS preflight
    const corsResponse = handleCors(request);
    if (corsResponse) return corsResponse;

    try {
        const optionId = parseInt((await params).id);

        if (isNaN(optionId)) {
            const response = NextResponse.json(
                {
                    success: false,
                    error: "Invalid option ID"
                },
                { status: 400 }
            );
            return addCorsHeaders(response);
        }

        await deletePollOption(optionId);

        const response = NextResponse.json({
            success: true,
            message: "Option deleted successfully"
        });

        return addCorsHeaders(response);
    } catch (error) {
        console.error("Error deleting poll option:", error);

        const response = NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Failed to delete poll option"
            },
            { status: 500 }
        );

        return addCorsHeaders(response);
    }
}
