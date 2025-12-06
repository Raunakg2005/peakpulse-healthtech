import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Activity from '@/models/Activity';
import UserChallenge from '@/models/UserChallenge';

export async function GET(req: NextRequest) {
    try {
        const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

        if (!token?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const user = await User.findById(token.id);
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const recentActivities = await Activity.find({
            $or: [
                { userId: token.id },
                { userId: user.email }
            ]
        })
            .sort({ _id: -1 })
            .limit(50);

        const activeChallengesCount = await UserChallenge.countDocuments({
            userId: token.id,
            status: 'active',
        });

        const completedChallengesCount = await UserChallenge.countDocuments({
            userId: token.id,
            status: 'completed',
        });

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const weeklyActivitiesCount = await Activity.countDocuments({
            $or: [
                { userId: token.id },
                { userId: user.email }
            ],
            completedAt: { $gte: sevenDaysAgo },
        });

        const dashboardData = {
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
            },
            stats: {
                currentStreak: user.stats?.currentStreak || 0,
                longestStreak: user.stats?.longestStreak || 0,
                totalPoints: user.stats?.totalPoints || 0,
                level: user.stats?.level || 1,
                badges: user.stats?.badges || [],
                completedChallenges: completedChallengesCount,
            },
            activeChallenges: activeChallengesCount,
            weeklyActivities: weeklyActivitiesCount,
            recentActivities: recentActivities,
            mlData: {
                dropoutRisk: user.mlData?.dropoutRisk || null,
                engagementLevel: user.mlData?.engagementLevel || null,
                lastPrediction: user.mlData?.lastPrediction || null,
            },
        };

        return NextResponse.json({ success: true, data: dashboardData });
    } catch (error) {
        console.error('Dashboard data fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
    }
}
