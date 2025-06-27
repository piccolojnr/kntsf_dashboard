import { NextRequest, NextResponse } from 'next/server';
import { registerUser } from '@/lib/services/game.service';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const username = formData.get('username') as string;
        const password = formData.get('password') as string;
        const studentId = formData.get('studentId') as string;
        const imageFile = formData.get('image') as File | null;
        if (!username || !password || !studentId) {
            return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
        }
        const result = await registerUser(username, password, studentId, imageFile || undefined);
        if (result.error) {
            return NextResponse.json({ success: false, error: result.error }, { status: 400 });
        }
        return NextResponse.json({ success: true, data: result.data });
    } catch (error) {
        console.error('Error registering user:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
} 