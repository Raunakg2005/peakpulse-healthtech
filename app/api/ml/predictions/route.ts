import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

const ML_API_URL = process.env.ML_API_URL || 'http://localhost:8000';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { userId } = body;

        if (!userId) {
            return NextResponse.json({ error: 'User ID required' }, { status: 400 });
        }

        await connectDB();
        const user = await User.findById(userId);

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Prepare user features for ML predictions
        const userFeatures = {
            user_id: user._id.toString(),
            total_activities: user.stats?.completedChallenges || 0,
            current_streak: user.stats?.currentStreak || 0,
            longest_streak: user.stats?.longestStreak || 0,
            avg_session_duration: 30,
            challenges_enrolled: 5,
            challenges_completed: user.stats?.completedChallenges || 0,
            last_activity_days_ago: 0,
            completion_rate: 0.86,
            avg_difficulty: 2.5,
            weekly_frequency: 5,
            total_points: user.stats?.totalPoints || 0,
            badges_earned: user.stats?.badges?.length || 0,
            social_interactions: 15,
            preferred_time: 'morning',
            goal_progress: 0.75,
        };

        // Call ML API for predictions (with graceful fallback)
        const predictions: Record<string, any> = {};

        try {
            const dropoutRes = await fetch(`${ML_API_URL}/api/predict/dropout`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userFeatures),
                signal: AbortSignal.timeout(5000),
            });
            if (dropoutRes.ok) {
                predictions.dropout = await dropoutRes.json();
            }
        } catch (e) {
            console.log('Dropout prediction unavailable (ML service offline)');
            predictions.dropout = null;
        }

        try {
            const engagementRes = await fetch(`${ML_API_URL}/api/predict/engagement`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userFeatures),
                signal: AbortSignal.timeout(5000),
            });
            if (engagementRes.ok) {
                predictions.engagement = await engagementRes.json();
            }
        } catch (e) {
            console.log('Engagement prediction unavailable (ML service offline)');
            predictions.engagement = null;
        }

        try {
            const recommendRes = await fetch(`${ML_API_URL}/api/recommend-challenge`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userFeatures),
                signal: AbortSignal.timeout(5000),
            });
            if (recommendRes.ok) {
                predictions.recommendations = await recommendRes.json();
            }
        } catch (e) {
            console.log('Recommendations unavailable (ML service offline)');
            predictions.recommendations = null;
        }

        // Update user's ML data if predictions succeeded
        if (predictions.dropout || predictions.engagement) {
            await User.findByIdAndUpdate(userId, {
                'mlData.dropoutRisk': predictions.dropout?.dropout_risk,
                'mlData.engagementLevel': predictions.engagement?.engagement_level,
                'mlData.lastPrediction': new Date(),
            });
        }

        return NextResponse.json({
            success: true,
            predictions,
            userFeatures,
            mlServiceAvailable: !!(predictions.dropout || predictions.engagement),
        });
    } catch (error) {
        console.error('Predictions error:', error);
        return NextResponse.json(
            { error: 'Failed to get predictions' },
            { status: 500 }
        );
    }
}
