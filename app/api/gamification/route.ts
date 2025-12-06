import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { BADGES, checkBadgeEligibility, POINT_REWARDS, calculateLevel } from '@/lib/gamification';

// Award points and check for new badges
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const body = await request.json();
        const { action, metadata } = body;

        // Get point reward for action
        let pointsEarned = POINT_REWARDS[action as keyof typeof POINT_REWARDS] || 0;

        // If action is complete_activity, use duration as points if available
        if (action === 'complete_activity' && metadata?.duration) {
            pointsEarned = metadata.duration;
        }

        if (pointsEarned === 0) {
            return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }

        // Find user and update points
        const user = await User.findOne({ email: session.user.email });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Calculate new totals
        const oldPoints = user.stats?.totalPoints || 0;
        const newPoints = oldPoints + pointsEarned;
        const oldLevel = user.stats?.level || 1;
        const newLevel = calculateLevel(newPoints);
        const leveledUp = newLevel > oldLevel;

        // Update stats
        await User.findByIdAndUpdate(user._id, {
            $inc: { 'stats.totalPoints': pointsEarned },
            $set: { 'stats.level': newLevel }
        });

        // Check for new badges
        const currentBadges = user.stats?.badges || [];
        const newBadges: string[] = [];

        // Get updated user stats for badge checking
        const updatedStats = {
            currentStreak: user.stats?.currentStreak || 0,
            totalPoints: newPoints,
            level: newLevel,
            completedChallenges: user.stats?.completedChallenges || 0,
            ...metadata // Include any additional stats from the action
        };

        for (const badge of BADGES) {
            // Skip if already earned
            if (currentBadges.includes(badge.id)) continue;

            // Check eligibility
            if (checkBadgeEligibility(badge, updatedStats)) {
                newBadges.push(badge.id);

                // Award badge points
                if (badge.points > 0) {
                    await User.findByIdAndUpdate(user._id, {
                        $inc: { 'stats.totalPoints': badge.points }
                    });
                }
            }
        }

        // Add new badges to user
        if (newBadges.length > 0) {
            await User.findByIdAndUpdate(user._id, {
                $addToSet: { 'stats.badges': { $each: newBadges } }
            });
        }

        // Prepare badge details for response
        const badgeDetails = newBadges.map(badgeId =>
            BADGES.find(b => b.id === badgeId)
        ).filter(Boolean);

        console.log(`🎮 Awarded ${pointsEarned} points to ${user.email} for ${action}`);
        if (newBadges.length > 0) {
            console.log(`🏅 New badges: ${newBadges.join(', ')}`);
        }
        if (leveledUp) {
            console.log(`⬆️ Level up! ${oldLevel} → ${newLevel}`);
        }

        return NextResponse.json({
            success: true,
            pointsEarned,
            newTotalPoints: newPoints + (badgeDetails.reduce((sum, b) => sum + (b?.points || 0), 0)),
            leveledUp,
            newLevel: leveledUp ? newLevel : undefined,
            oldLevel: leveledUp ? oldLevel : undefined,
            newBadges: badgeDetails,
            message: `Earned ${pointsEarned} points!`
        });

    } catch (error) {
        console.error('Failed to award points:', error);
        return NextResponse.json(
            { error: 'Failed to award points' },
            { status: 500 }
        );
    }
}

// Get user's badges and achievements
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const user = await User.findOne({ email: session.user.email });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const earnedBadgeIds = user.stats?.badges || [];

        // Get earned badges with details
        const earnedBadges = earnedBadgeIds.map(badgeId =>
            BADGES.find(b => b.id === badgeId)
        ).filter(Boolean);

        // Get available (not earned) badges
        const availableBadges = BADGES.filter(badge =>
            !earnedBadgeIds.includes(badge.id)
        );

        // Get progress towards next badges
        const userStats = {
            currentStreak: user.stats?.currentStreak || 0,
            totalPoints: user.stats?.totalPoints || 0,
            level: user.stats?.level || 1,
            completedChallenges: user.stats?.completedChallenges || 0,
        };

        const badgeProgress = availableBadges.map(badge => {
            const eligible = checkBadgeEligibility(badge, userStats);
            let progress = 0;

            // Calculate progress percentage
            const { criteria } = badge;
            const currentValue = userStats[criteria.metric as keyof typeof userStats] ||
                (criteria.type === 'streak' ? userStats.currentStreak : 0);
            progress = Math.min(100, (currentValue / criteria.threshold) * 100);

            return {
                badge,
                progress: Math.round(progress),
                eligible
            };
        });

        return NextResponse.json({
            success: true,
            earned: earnedBadges,
            available: badgeProgress,
            stats: {
                totalBadges: earnedBadges.length,
                totalPossible: BADGES.length,
                completionRate: Math.round((earnedBadges.length / BADGES.length) * 100)
            }
        });

    } catch (error) {
        console.error('Failed to fetch badges:', error);
        return NextResponse.json(
            { error: 'Failed to fetch badges' },
            { status: 500 }
        );
    }
}
