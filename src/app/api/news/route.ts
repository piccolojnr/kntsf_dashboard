import { type NextRequest, NextResponse } from "next/server"
import { getAllArticles } from "@/lib/services/news.service"

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const page = Number.parseInt(searchParams.get("page") || "1")
        const pageSize = Number.parseInt(searchParams.get("limit") || "10")
        const featured = searchParams.get("featured") ? searchParams.get("featured") === "true" : undefined
        const category = searchParams.get("category") || undefined
        const search = searchParams.get("search") || undefined
        const published = searchParams.get("published") ? searchParams.get("published") === "true" : true

        const result = await getAllArticles({
            page,
            pageSize,
            search,
            category,
            featured,
            published,
        })

        if (!result.success) {
            return NextResponse.json({ success: false, error: result.error }, { status: 400 })
        }

        return NextResponse.json({
            success: true,
            data: result.data,
        })
    } catch (error) {
        console.error("Failed to fetch news articles:", error)
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
    }
}
