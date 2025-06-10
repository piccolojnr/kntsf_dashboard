import { NextRequest, NextResponse } from 'next/server';
import { getAllArticles } from '@/lib/services/news.service';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const featured = searchParams.get('featured') ? searchParams.get('featured') === 'true' : true;
        const category = searchParams.get('category') || undefined;

        const result = await getAllArticles(page, limit, featured, category);


        if (!result.success) {
            return NextResponse.json({ error: result.error }, { status: 400 });
        }

        return NextResponse.json(result);
    } catch (error) {
        console.error('Failed to fetch news articles:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 