import { NextRequest, NextResponse } from "next/server";
import { generatePasswordResetToken } from "@/lib/services/game.service";
import { sendPasswordResetEmail } from "@/lib/services/email.service";

export async function POST(request: NextRequest) {
    try {
        const { identifier } = await request.json();

        if (!identifier) {
            return NextResponse.json(
                { error: "Username or Student ID is required" },
                { status: 400 }
            );
        }

        const result = await generatePasswordResetToken(identifier);

        if (result.error) {
            return NextResponse.json(
                { error: result.error },
                { status: 404 }
            );
        }

        // Send password reset email
        if (!result.data) {
            return NextResponse.json(
                { error: "Failed to generate reset token" },
                { status: 500 }
            );
        }

        const emailResult = await sendPasswordResetEmail({
            email: result.data.user.email,
            name: result.data.user.name || "User",
            username: result.data.user.username,
            resetToken: result.data.token
        });

        if (!emailResult.success) {
            console.error("Failed to send password reset email:", emailResult.error);
            return NextResponse.json(
                { error: "Failed to send password reset email" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Password reset email sent successfully"
        });

    } catch (error) {
        console.error("Forgot password error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
