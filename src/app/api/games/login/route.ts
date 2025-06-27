import { NextRequest, NextResponse } from 'next/server';
import { loginUser } from '@/lib/services/game.service';

export async function POST(request: NextRequest) {
    try {
        const { username, password } = await request.json();
        if (!username || !password) {
            return NextResponse.json({ success: false, error: 'Missing username or password' }, { status: 400 });
        }
        const result = await loginUser(username, password);
        if (result.error) {
            return NextResponse.json({ success: false, error: result.error }, { status: 401 });
        }
        return NextResponse.json({ success: true, data: result.data });
    } catch (error) {
        console.error('Error logging in user:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
} 