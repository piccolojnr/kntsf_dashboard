import { NextRequest, NextResponse } from 'next/server';
import { getArticle } from '@/lib/services/news.service';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;
        if (!slug) {
            return NextResponse.json(
                { error: 'Article slug is required' },
                { status: 400 }
            );
        }
        const result = await getArticle(slug);

        if (!result.success) {
            return NextResponse.json({ error: result.error }, { status: 404 });
        }

        return NextResponse.json(result);
    } catch (error) {
        console.error('Failed to fetch article:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 