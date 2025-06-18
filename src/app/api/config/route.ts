import { NextResponse } from 'next/server';
import services from '@/lib/services';

export async function GET() {
    try {
        const response = await services.config.getPublicConfig();

        if (!response.success) {
            return NextResponse.json(
                { error: response.error },
                { status: 404 }
            );
        }

        return NextResponse.json(response);
    } catch (error) {
        console.error('Error fetching public config:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 