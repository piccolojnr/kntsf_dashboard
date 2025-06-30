import { NextResponse } from 'next/server';
import { getPreviousWeekWinner } from '@/lib/services/game.service';

export async function GET() {
    try {
        const winner = await getPreviousWeekWinner();
        if (!winner) {
            return NextResponse.json({ success: true, data: null });
        }
        return NextResponse.json({
            success: true,
            data: {
                playerName: winner.playerName,
                totalScore: winner.totalScore,
                avatarUrl: winner.user?.avatarUrl || null,
            },
        });
    } catch (error) {
        console.error('Error fetching previous week winner:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
} 