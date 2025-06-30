'use server'

import { compare, hash } from "bcryptjs";
import prisma from "../prisma/client";
import cloudinary from '@/lib/cloudinary';
import { getCurrentWeekEnd, getCurrentWeekStart } from "../weekly-leaderboard";
import { GameUser } from "@prisma/client";





export interface WeeklyLeaderboardEntry {
    userId: string;
    user: GameUser;
    playerName: string;
    totalScore: number;
    gamesPlayed: number;
    avgScore: number;
    periodId?: string;
    gameId?: string;
    isCurrentUser?: boolean;
}


export async function loginUser(username: string, password: string) {
    const user = await prisma.gameUser.findUnique({ where: { username: username } });
    if (!user) {
        return { error: "User not found" };
    }

    const isValid = await compare(password, user.password);

    if (!isValid) {
        return { error: "Invalid password" };
    }
    return { data: { ...user, isGuest: false } };
}

export async function registerUser(username: string, password: string, studentId: string, imageFile?: File) {
    if (!username || !password || !studentId) {
        return { error: "Missing required fields" };
    }
    // Check if student exists
    console.log("Checking student with ID:", studentId);
    const student = await prisma.student.findUnique({ where: { studentId } });
    if (!student) {
        return { error: "Only students can register. Invalid student ID." };
    }


    const existing = await prisma.gameUser.findUnique({ where: { username } });
    if (existing) {
        return { error: "username already exists" };
    }

    // check if the student already has a game user
    const existingUser = await prisma.gameUser.findFirst({ where: { studentId: student.id } });
    if (existingUser) {
        return { error: "Student already has a game user account" };
    }

    const hashedPassword = await hash(password, 10);
    let avatarUrl: string | undefined = undefined;
    if (imageFile) {
        // Validate image file
        if (imageFile.size > 5 * 1024 * 1024) {
            return { error: "Image file must be less than 5MB" };
        }
        if (!imageFile.type.startsWith("image/")) {
            return { error: "File must be an image" };
        }
        const buffer = Buffer.from(await imageFile.arrayBuffer());
        const uploadResult = await new Promise<any>((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                {
                    folder: "game_users",
                    public_id: `user_${username}_${Date.now()}`,
                    transformation: [{ width: 300, height: 300, crop: "fill", quality: "auto" }],
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            ).end(buffer);
        });
        avatarUrl = uploadResult.secure_url;
    }
    const user = await prisma.gameUser.create({
        data: { username, password: hashedPassword, studentId: student.id, avatarUrl },
    });
    return { data: { ...user, isGuest: false, } };
}

export async function updateUser(userId: string, updates: { username?: string; password?: string; imageFile?: File }) {
    const user = await prisma.gameUser.findUnique({ where: { id: userId } });
    if (!user) {
        return { error: "User not found" };
    }
    const data: any = {};
    if (updates.username) {
        data.username = updates.username;
    }
    if (updates.password) {
        data.password = await hash(updates.password, 10);
    }
    if (updates.imageFile) {
        if (updates.imageFile.size > 5 * 1024 * 1024) {
            return { error: "Image file must be less than 5MB" };
        }
        if (!updates.imageFile.type.startsWith("image/")) {
            return { error: "File must be an image" };
        }
        const buffer = Buffer.from(await updates.imageFile.arrayBuffer());
        const uploadResult = await new Promise<any>((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                {
                    folder: "game_users",
                    public_id: `user_${user.username}_${Date.now()}`,
                    transformation: [{ width: 300, height: 300, crop: "fill", quality: "auto" }],
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            ).end(buffer);
        });
        data.avatarUrl = uploadResult.secure_url;
    }
    const updatedUser = await prisma.gameUser.update({ where: { id: userId }, data });
    return { data: { ...updatedUser, avatarUrl: updatedUser.avatarUrl } };
}

// Utility: Get or create the current leaderboard period for a game
async function getOrCreateCurrentPeriod() {
    const startDate = getCurrentWeekStart();
    const endDate = getCurrentWeekEnd();
    let period = await prisma.leaderboardPeriod.findFirst({
        where: { startDate, endDate },
    });
    if (!period) {
        period = await prisma.leaderboardPeriod.create({
            data: { startDate, endDate },
        });
    }
    return period;
}

// Fetch current leaderboard for a game and period
export async function getCurrentWeeklyLeaderboard(currentUserId?: string, options?: { page?: number; pageSize?: number }): Promise<WeeklyLeaderboardEntry[]> {
    const period = await getOrCreateCurrentPeriod();
    const page = options?.page ?? 1;
    const pageSize = options?.pageSize ?? 50;
    const skip = (page - 1) * pageSize;
    const entries = await prisma.leaderboardEntry.findMany({
        where: { periodId: period.id },
        orderBy: { totalScore: 'desc' },
        include: { user: true },
        skip,
        take: pageSize,
    });
    const leaderboard = entries.map(entry => ({
        userId: entry.userId,
        playerName: entry.playerName,
        user: entry.user,
        totalScore: entry.totalScore,
        gamesPlayed: entry.gamesPlayed,
        avgScore: entry.avgScore,
        periodId: entry.periodId,
        isCurrentUser: currentUserId ? entry.userId === currentUserId : false,
    }));
    return leaderboard;
}

// Fetch historical leaderboard for a given week
export async function getHistoricalWeeklyLeaderboard(weekStart: Date, options?: { page?: number; pageSize?: number }): Promise<WeeklyLeaderboardEntry[]> {
    const period = await prisma.leaderboardPeriod.findFirst({
        where: { startDate: weekStart },
    });
    if (!period) return [];
    const page = options?.page ?? 1;
    const pageSize = options?.pageSize ?? 50;
    const skip = (page - 1) * pageSize;
    const entries = await prisma.leaderboardEntry.findMany({
        where: { periodId: period.id },
        orderBy: { totalScore: 'desc' },
        include: { user: true },
        skip,
        take: pageSize,
    });
    return entries.map(entry => ({
        userId: entry.userId,
        user: entry.user,
        playerName: entry.playerName,
        totalScore: entry.totalScore,
        gamesPlayed: entry.gamesPlayed,
        avgScore: entry.avgScore,
        periodId: entry.periodId,
    }));
}

// Update or create leaderboard entry for the current period
export async function updateWeeklyScore(userId: string, playerName: string, gameScore: number): Promise<void> {
    const period = await getOrCreateCurrentPeriod();
    const existingEntry = await prisma.leaderboardEntry.findUnique({
        where: { userId_periodId: { userId, periodId: period.id } },
    });
    if (existingEntry) {
        await prisma.leaderboardEntry.update({
            where: { id: existingEntry.id },
            data: {
                totalScore: { increment: gameScore },
                gamesPlayed: { increment: 1 },
                avgScore: Math.round((existingEntry.totalScore + gameScore) / (existingEntry.gamesPlayed + 1)),
                playerName,
            },
        });
    } else {
        await prisma.leaderboardEntry.create({
            data: {
                userId,
                playerName,
                totalScore: gameScore,
                gamesPlayed: 1,
                avgScore: gameScore,
                periodId: period.id,
            },
        });
    }
}

// Get player's rank for the current period
export async function getPlayerWeeklyRank(userId: string): Promise<number | null> {
    const leaderboard = await getCurrentWeeklyLeaderboard();
    const playerIndex = leaderboard.findIndex(entry => entry.userId === userId);
    return playerIndex >= 0 ? playerIndex + 1 : null;
}

// get winner of the previous week
export async function getPreviousWeekWinner(): Promise<WeeklyLeaderboardEntry | null> {
    const lastWeekStart = getCurrentWeekStart(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
    const lastWeekEnd = getCurrentWeekEnd(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
    const period = await prisma.leaderboardPeriod.findFirst({
        where: {
            startDate: lastWeekStart,
            endDate: lastWeekEnd,
        },
    });
    if (!period) return null;
    const winner = await prisma.leaderboardEntry.findFirst({
        where: { periodId: period.id },
        orderBy: { totalScore: 'desc' },
        include: { user: true },
    });
    return winner || null;
}
