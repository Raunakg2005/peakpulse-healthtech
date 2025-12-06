import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import connectDB from '@/lib/mongodb';
import UserChallenge from '@/models/UserChallenge';
import Activity from '@/models/Activity';

export async function GET(req: NextRequest) {
    try {
        const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

        if (!token?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const challengeId = searchParams.get('challengeId');

        if (!challengeId) {
            return NextResponse.json({ error: 'Challenge ID is required' }, { status: 400 });
        }

        await connectDB();

        // Get the user challenge
        const userChallenge = await UserChallenge.findOne({
            userId: token.id as string,
            challengeId,
            status: 'active'
        }).populate('challengeId');

        if (!userChallenge) {
            return NextResponse.json({ error: 'Challenge not found or not active' }, { status: 404 });
        }

        const challenge: any = userChallenge.challengeId;
        const startDate = new Date(userChallenge.startedAt);
        const today = new Date();
        today.setHours(23, 59, 59, 999);

        let progress = 0;
        let details: any = {};

        // Calculate progress based on challenge type
        const challengeTitle = challenge.title?.toLowerCase() || '';

        if (challengeTitle.includes('hydration') || challengeTitle.includes('water')) {
            // Hydration challenge - track today's progress toward daily goal
            const todayStart = new Date(today);
            todayStart.setHours(0, 0, 0, 0);
            
            const todayEnd = new Date(today);
            todayEnd.setHours(23, 59, 59, 999);

            // Get today's water activities
            const todayWaterActivities = await Activity.find({
                userId: token.id as string,
                type: 'hydration',
                completedAt: {
                    $gte: todayStart,
                    $lte: todayEnd
                }
            });

            // Count today's glasses
            const todayGlasses = todayWaterActivities.reduce((sum, activity) => {
                const glasses = activity.notes ? parseInt(activity.notes.split(' ')[0]) || 0 : 0;
                return sum + glasses;
            }, 0);

            const dailyGoal = challenge.criteria.target; // e.g., 8 glasses per day
            
            // For display: show today's progress as a percentage
            progress = Math.min((todayGlasses / dailyGoal) * 100, 100);

            // Count total days where goal was met (for streak tracking)
            const allWaterActivities = await Activity.find({
                userId: token.id as string,
                type: 'hydration',
                completedAt: {
                    $gte: startDate,
                    $lte: today
                }
            });

            // Group all activities by date
            const dailyGlasses = new Map<string, number>();
            allWaterActivities.forEach(activity => {
                const dateKey = new Date(activity.completedAt).toDateString();
                const glasses = activity.notes ? parseInt(activity.notes.split(' ')[0]) || 0 : 0;
                dailyGlasses.set(dateKey, (dailyGlasses.get(dateKey) || 0) + glasses);
            });

            const daysGoalMet = Array.from(dailyGlasses.values()).filter(count => count >= dailyGoal).length;
            const totalDaysInChallenge = Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

            details = {
                totalGlasses: todayGlasses,
                targetGlasses: dailyGoal,
                daysTracked: daysGoalMet,
                totalDays: totalDaysInChallenge
            };

        } else if (challengeTitle.includes('steps')) {
            // Steps challenge - count step activities
            const stepActivities = await Activity.find({
                userId: token.id as string,
                name: { $regex: /walk|step/i },
                completedAt: {
                    $gte: startDate,
                    $lte: today
                }
            });

            progress = Math.min((stepActivities.length / challenge.criteria.target) * 100, 100);

            details = {
                completedDays: stepActivities.length,
                targetDays: challenge.criteria.target
            };

        } else {
            // General activity challenge
            const activities = await Activity.find({
                userId: token.id as string,
                completedAt: {
                    $gte: startDate,
                    $lte: today
                }
            });

            progress = Math.min((activities.length / challenge.criteria.target) * 100, 100);

            details = {
                completedActivities: activities.length,
                targetActivities: challenge.criteria.target
            };
        }

        // Update progress in database
        userChallenge.progress = Math.round(progress);
        await userChallenge.save();

        return NextResponse.json({
            success: true,
            progress: Math.round(progress),
            details,
            challenge: challenge.title
        });

    } catch (error) {
        console.error('Challenge progress error:', error);
        return NextResponse.json({ error: 'Failed to fetch challenge progress' }, { status: 500 });
    }
}
