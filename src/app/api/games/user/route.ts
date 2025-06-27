import { NextRequest, NextResponse } from 'next/server';
import { updateUser } from '@/lib/services/game.service';

export async function PATCH(request: NextRequest) {
    try {
        const formData = await request.formData();
        const userId = formData.get('userId') as string;
        const username = formData.get('username') as string | undefined;
        const password = formData.get('password') as string | undefined;
        const imageFile = formData.get('image') as File | null;
        if (!userId) {
            return NextResponse.json({ success: false, error: 'Missing userId' }, { status: 400 });
        }
        const result = await updateUser(userId, { username, password, imageFile: imageFile || undefined });
        if (result.error) {
            return NextResponse.json({ success: false, error: result.error }, { status: 400 });
        }
        return NextResponse.json({ success: true, data: result.data });
    } catch (error) {
        console.error('Error updating user:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
} 