import { NextRequest, NextResponse } from "next/server";
import { verify, checkValidity, getPermitByCode } from "@/lib/services/permit.service";
import { getById } from "@/lib/services/student.service";
import prisma from "@/lib/prisma/client";

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const permitCode = searchParams.get("code");
        const studentId = searchParams.get("studentId");

        if (!permitCode && !studentId) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Either permit code or student ID is required",
                },
                { status: 400 }
            );
        }

        if (permitCode) {
            // OPTIMIZATION: Use fast lookup first, then verify if needed
            const permitResult = await getPermitByCode(permitCode);

            if (permitResult.success && permitResult.data) {
                const permit = permitResult.data;
                const isExpired = new Date() > permit.expiryDate;

                if (isExpired) {
                    // Update status to expired
                    await prisma.permit.update({
                        where: { id: permit.id },
                        data: { status: 'expired' }
                    });

                    return NextResponse.json({
                        success: true,
                        data: {
                            valid: false,
                            permit: permit,
                            reason: 'expired',
                        },
                    });
                }

                return NextResponse.json({
                    success: true,
                    data: {
                        valid: true,
                        permit: permit,
                        reason: undefined,
                    },
                });
            }

            // Fallback to old verification method if fast lookup fails
            const result = await verify(permitCode);
            return NextResponse.json({
                success: true,
                data: {
                    valid: result.valid,
                    permit: result.permit,
                    reason: result.reason,
                },
            });
        }

        if (studentId) {
            // Check student's active permits
            const studentResult = await getById(studentId);
            if (!studentResult.success || !studentResult.data) {
                return NextResponse.json(
                    {
                        success: false,
                        error: "Student not found",
                    },
                    { status: 404 }
                );
            }

            const activePermit = studentResult.data.permits.find(
                (p) => p.status === "active"
            );

            if (!activePermit) {
                return NextResponse.json({
                    success: true,
                    data: {
                        hasActivePermit: false,
                        message: "No active permit found for this student",
                    },
                });
            }

            // Check permit validity
            const validityResult = await checkValidity(activePermit.id);
            return NextResponse.json({
                success: true,
                data: {
                    hasActivePermit: true,
                    permit: activePermit,
                    validity: validityResult.data,
                },
            });
        }
    } catch (error) {
        console.error("Error checking permit status:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Failed to check permit status",
            },
            { status: 500 }
        );
    }
} 