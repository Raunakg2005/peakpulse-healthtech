import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import connectDB from '@/lib/mongodb';
import Activity from '@/models/Activity';
import User from '@/models/User';

export async function POST(req: NextRequest) {
    try {
        const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

        if (!token?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { type, name, duration, intensity, calories, notes } = body;

        if (!type || !name || !duration) {
            return NextResponse.json(
                { error: 'Type, name, and duration are required' },
                { status: 400 }
            );
        }

        await connectDB();

        const activity = await Activity.create({
            userId: token.id as string,
            type,
            name,
            duration: parseInt(duration),
            intensity: intensity || 'moderate',
            calories: parseInt(calories) || 0,
            notes: notes || '',
            completedAt: new Date(),
        });

        const user = await User.findById(token.id as string);
        if (user) {
            const lastActivity = await Activity.findOne({
                userId: token.id as string,
                _id: { $ne: activity._id },
            }).sort({ completedAt: -1 });

            const now = new Date();
            if (!lastActivity) {
                user.stats.currentStreak = 1;
            } else {
                const lastDate = new Date(lastActivity.completedAt);
                const daysDiff = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
                user.stats.currentStreak = daysDiff <= 1 ? user.stats.currentStreak + 1 : 1;
            }

            if (user.stats.currentStreak > user.stats.longestStreak) {
                user.stats.longestStreak = user.stats.currentStreak;
            }

            const pointsEarned = Math.floor(parseInt(duration) * (intensity === 'high' ? 2 : intensity === 'moderate' ? 1.5 : 1));
            user.stats.totalPoints += pointsEarned;

            await user.save();

            return NextResponse.json({
                success: true,
                activity,
                pointsEarned,
            }, { status: 201 });
        }

        return NextResponse.json({
            success: true,
            activity,
            pointsEarned: 0,
        }, { status: 201 });
    } catch (error) {
        console.error('Activity creation error:', error);
        return NextResponse.json({ error: 'Failed to create activity' }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

        if (!token?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get('limit') || '20');
        const type = searchParams.get('type');

        const query: any = { userId: token.id as string };
        if (type) query.type = type;

        const activities = await Activity.find(query)
            .sort({ completedAt: -1 })
            .limit(limit);

        return NextResponse.json({ success: true, activities });
    } catch (error) {
        console.error('Activity fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 });
    }
}
