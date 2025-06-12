import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma/client";
import { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const category = searchParams.get("category");

        const where: Prisma.UserWhereInput
            = {
            ...(category && { category }),
            published: true
        };

        const executives = await prisma.user.findMany({
            where,
            select: {
                id: true,
                name: true,
                image: true,
                position: true,
                positionDescription: true,
                biography: true,
                socialLinks: true,
                category: true,
                email: true,
            },
            orderBy: {
                index: "asc",
            },
        });

        return NextResponse.json({
            success: true,
            data: executives,
        });
    } catch (error: any) {
        console.error("Error fetching executives:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Failed to fetch executives",
            },
            { status: 500 }
        );
    }
} 