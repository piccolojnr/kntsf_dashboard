import { NextRequest, NextResponse } from 'next/server';
import {
    getCurrentWeeklyLeaderboard,
    updateWeeklyScore,
    getPlayerWeeklyRank,
    getHistoricalWeeklyLeaderboard,
} from '@/lib/services/game.service';

// GET /api/games/leaderboard?gameId=...&userId=...&page=...&pageSize=...
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const userId = searchParams.get('userId') || undefined;
        const weekStart = searchParams.get('weekStart');
        const historical = searchParams.get('historical') === 'true';
        const page = parseInt(searchParams.get('page') || '1', 10);
        const pageSize = parseInt(searchParams.get('pageSize') || '50', 10);


        if (historical && weekStart) {
            const weekStartDate = new Date(weekStart);
            const leaderboard = await getHistoricalWeeklyLeaderboard(weekStartDate, { page, pageSize });
            return NextResponse.json({ success: true, data: leaderboard });
        }

        const leaderboard = await getCurrentWeeklyLeaderboard(userId, { page, pageSize });
        return NextResponse.json({ success: true, data: leaderboard });
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}

// POST /api/games/score
export async function POST(request: NextRequest) {
    try {
        const { userId, playerName, gameScore } = await request.json();
        if (!userId || !playerName || !gameScore) {
            return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
        }
        await updateWeeklyScore(userId, playerName, Number(gameScore));
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating score:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}

// PUT /api/games/rank
export async function PUT(request: NextRequest) {
    try {
        const { userId } = await request.json();
        if (!userId) {
            return NextResponse.json({ success: false, error: 'Missing userId' }, { status: 400 });
        }
        const rank = await getPlayerWeeklyRank(userId);
        return NextResponse.json({ success: true, data: { rank } });
    } catch (error) {
        console.error('Error fetching player rank:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
} 