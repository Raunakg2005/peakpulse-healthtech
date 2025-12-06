import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(req: NextRequest) {
    try {
        await connectDB();

        const { searchParams } = new URL(req.url);
        const limitParam = searchParams.get('limit');
        const query = User.find()
            .select('name email avatar stats.totalPoints stats.currentStreak stats.level stats.badges')
            .sort({ 'stats.totalPoints': -1 });

        if (limitParam && limitParam !== 'all') {
            query.limit(parseInt(limitParam));
        }

        const leaderboard = await query;

        const rankedUsers = leaderboard.map((user, index) => ({
            rank: index + 1,
            id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            points: user.stats?.totalPoints || 0,
            streak: user.stats?.currentStreak || 0,
            level: user.stats?.level || 1,
            badges: user.stats?.badges || [],
        }));

        return NextResponse.json({
            success: true,
            leaderboard: rankedUsers,
        });
    } catch (error) {
        console.error('Leaderboard fetch error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch leaderboard' },
            { status: 500 }
        );
    }
}
