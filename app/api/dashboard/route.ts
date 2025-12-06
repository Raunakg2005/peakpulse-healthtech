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

        // First check all activities in the database for debugging
        const allActivities = await Activity.find({}).limit(10);
        console.log('All activities sample:', allActivities.map(a => ({ 
            id: a._id, 
            userId: a.userId, 
            userIdType: typeof a.userId,
            name: a.name 
        })));
        console.log('Looking for userId:', {
            tokenId: token.id,
            tokenIdType: typeof token.id,
            userObjectId: user._id,
            userObjectIdString: user._id.toString(),
            email: user.email
        });

        // Query activities with multiple potential userId formats
        const recentActivities = await Activity.find({
            $or: [
                { userId: token.id },
                { userId: token.id.toString() },
                { userId: user._id },
                { userId: user._id.toString() },
                { userId: user.email }
            ]
        })
            .sort({ completedAt: -1, timestamp: -1, _id: -1 })
            .limit(50);

        console.log('Found activities for user:', recentActivities.length);

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
