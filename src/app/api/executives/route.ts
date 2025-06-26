import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma/client"
import type { Prisma } from "@prisma/client"

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const category = searchParams.get("category")
        const page = searchParams.get("page")
        const pageSize = searchParams.get("pageSize")

        const where: Prisma.UserWhereInput = {
            ...(category && { category }),
            published: true,
        }

        let executives, total
        if (page && pageSize) {
            const pageNum = Math.max(1, parseInt(page, 10) || 1)
            const sizeNum = Math.max(1, parseInt(pageSize, 10) || 10)
            total = await prisma.user.count({ where })
            executives = await prisma.user.findMany({
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
                orderBy: [{ index: "asc" }, { name: "asc" }],
                skip: (pageNum - 1) * sizeNum,
                take: sizeNum,
            })
        } else {
            executives = await prisma.user.findMany({
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
                orderBy: [{ index: "asc" }, { name: "asc" }],
            })
            total = executives.length
        }

        // Transform the data to match our Executive interface
        const transformedExecutives = executives.map((exec) => ({
            id: exec.id,
            name: exec.name || "Unknown",
            image: exec.image,
            position: exec.position || "Executive",
            positionDescription: exec.positionDescription,
            biography: exec.biography,
            socialLinks: exec.socialLinks as any,
            category: exec.category || "other_executive",
            email: exec.email,
        }))

        return NextResponse.json({
            success: true,
            data: transformedExecutives,
            total,
        })
    } catch (error: any) {
        console.error("Error fetching executives:", error)
        return NextResponse.json(
            {
                success: false,
                error: "Failed to fetch executives",
            },
            { status: 500 },
        )
    }
}
