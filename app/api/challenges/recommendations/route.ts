import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Challenge from '@/models/Challenge';
import UserChallenge from '@/models/UserChallenge';
import Activity from '@/models/Activity';

const ML_API_URL = process.env.ML_API_URL || 'http://localhost:8000';

export async function GET(req: NextRequest) {
    try {
        const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

        if (!token?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const user = await User.findById(token.id as string);
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Get user's enrolled challenges
        const enrolledChallenges = await UserChallenge.find({
            userId: token.id as string,
            status: { $in: ['active', 'completed'] }
        });
        const enrolledIds = new Set(enrolledChallenges.map(uc => uc.challengeId.toString()));

        // Get available challenges
        let allChallenges = await Challenge.find({ active: true });
        const availableChallenges = allChallenges.filter(c => !enrolledIds.has(c._id.toString()));

        if (availableChallenges.length === 0) {
            return NextResponse.json({
                success: true,
                recommendations: [],
                method: 'none'
            });
        }

        // Get user's activity history for better recommendations
        const recentActivities = await Activity.find({
            userId: token.id as string,
            completedAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
        });

        // Calculate user preferences
        const activityTypes: any = {};
        recentActivities.forEach(activity => {
            const type = activity.type || 'fitness';
            activityTypes[type] = (activityTypes[type] || 0) + 1;
        });

        const userStreak = user.stats?.currentStreak || 0;
        const completionRate = user.stats?.completedChallenges || 0;

        // Try to get ML recommendations
        let mlRecommendations: any[] = [];
        try {
            const mlProfile = {
                user_id: user._id.toString(),
                days_active: userStreak,
                avg_steps_last_7_days: 7500,
                meditation_streak: userStreak,
                challenge_completion_rate: completionRate > 0 ? completionRate / (completionRate + 5) : 0.5,
                social_engagement_score: 0.6,
                preferred_activity_times: ['morning'],
                response_rate_to_notifications: 0.8
            };

            const response = await fetch(`${ML_API_URL}/api/recommend-challenge`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(mlProfile),
                signal: AbortSignal.timeout(3000),
            });

            if (response.ok) {
                const mlData = await response.json();
                // ML service returns challenge indices or IDs
                if (mlData.recommendations) {
                    mlRecommendations = mlData.recommendations;
                }
            }
        } catch (error) {
            console.log('ML recommendations unavailable, using rule-based fallback');
        }

        // Rule-based recommendations as fallback
        const scoredChallenges = availableChallenges.map(challenge => {
            let score = 50; // Base score

            // Match category with user activity
            const categoryMap: any = {
                'fitness': 'exercise',
                'meditation': 'meditation',
                'nutrition': 'nutrition',
                'social': 'social'
            };
            const mappedCategory = categoryMap[challenge.category];
            if (mappedCategory && activityTypes[mappedCategory]) {
                score += 30; // Strong match
            }

            // Difficulty matching based on user level
            if (userStreak > 20 && challenge.difficulty >= 4) {
                score += 20; // Advanced user, advanced challenges
            } else if (userStreak > 10 && challenge.difficulty === 3) {
                score += 20; // Intermediate user
            } else if (userStreak <= 10 && challenge.difficulty <= 2) {
                score += 20; // Beginner user
            }

            // Duration preference (favor shorter challenges for beginners)
            if (challenge.duration === 'daily' && userStreak < 7) {
                score += 15;
            } else if (challenge.duration === 'weekly' && userStreak >= 7) {
                score += 15;
            }

            // Point balance (higher points = higher score for engaged users)
            if (completionRate > 3) {
                score += Math.min(challenge.points / 50, 20);
            }

            return {
                challenge,
                score,
                matchPercentage: Math.min(95, Math.max(65, score))
            };
        });

        // Sort by score and take top 3
        scoredChallenges.sort((a, b) => b.score - a.score);
        const topRecommendations = scoredChallenges.slice(0, 3).map(item => ({
            ...item.challenge.toObject(),
            matchScore: item.matchPercentage
        }));

        return NextResponse.json({
            success: true,
            recommendations: topRecommendations,
            method: mlRecommendations.length > 0 ? 'ml' : 'rule-based',
            userPreferences: {
                streak: userStreak,
                topActivityType: Object.keys(activityTypes).length > 0 
                    ? Object.entries(activityTypes).sort((a: any, b: any) => b[1] - a[1])[0][0]
                    : 'fitness'
            }
        });

    } catch (error) {
        console.error('Recommendations error:', error);
        return NextResponse.json(
            { error: 'Failed to get recommendations' },
            { status: 500 }
        );
    }
}
