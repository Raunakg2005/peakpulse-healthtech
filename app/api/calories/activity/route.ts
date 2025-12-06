import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Activity from '@/models/Activity';

// MET (Metabolic Equivalent of Task) values for different activities
const MET_VALUES: any = {
    'Running': 9.8,
    'Cycling': 7.5,
    'Swimming': 8.0,
    'Walking': 3.8,
    'Yoga': 2.5,
    'Weight Training': 6.0,
    'Dancing': 5.0,
    'Hiking': 6.5,
    'HIIT': 12.0,
    'Pilates': 3.0
};

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { name, duration, intensity } = body;

        if (!name || !duration) {
            return NextResponse.json(
                { error: 'Activity name and duration are required' },
                { status: 400 }
            );
        }

        await connectDB();

        // Get user data for weight calculation
        const user = await User.findOne({
            email: session.user.email
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Convert weight to kg if needed
        const weightInKg = user.profile?.weightUnit === 'kg'
            ? user.profile?.weight || 70
            : (user.profile?.weight || 154) * 0.453592;

        // Calculate calories burned using MET formula
        // Calories = MET * weight(kg) * duration(hours)
        const met = MET_VALUES[name] || 5.0;
        const durationHours = parseInt(duration) / 60;

        // Adjust MET based on intensity
        let intensityMultiplier = 1.0;
        if (intensity === 'light') intensityMultiplier = 0.7;
        if (intensity === 'vigorous') intensityMultiplier = 1.3;

        const caloriesBurned = Math.round(met * weightInKg * durationHours * intensityMultiplier);

        console.log(`📊 Logging activity for ${session.user.email}: ${name} (${duration}min, ${caloriesBurned} kcal)`);

        // Save activity to database
        const activity = await Activity.create({
            userId: session.user.email,
            type: 'exercise', // Type should be the category
            name: name,       // Name is the specific activity (Running, etc)
            duration: parseInt(duration),
            intensity: intensity || 'moderate',
            caloriesBurned,
            met,
            timestamp: new Date(),
            completed: true
        });

        console.log(`✅ Activity saved to DB: ${activity._id}`);

        // Award points for completing activity
        try {
            const gamificationResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/gamification`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Cookie': request.headers.get('cookie') || ''
                },
                body: JSON.stringify({
                    action: 'complete_activity',
                    metadata: {
                        activityType: name,
                        duration: parseInt(duration),
                        caloriesBurned
                    }
                })
            });

            if (gamificationResponse.ok) {
                const gamificationData = await gamificationResponse.json();
                console.log(`🎮 Awarded ${gamificationData.pointsEarned} points`);

                return NextResponse.json({
                    success: true,
                    activity: {
                        name,
                        duration: parseInt(duration),
                        calories: caloriesBurned,
                        timestamp: new Date()
                    },
                    gamification: gamificationData
                });
            }
        } catch (gamificationError) {
            console.error('Failed to award points:', gamificationError);
        }

        return NextResponse.json({
            success: true,
            activity: {
                name,
                duration: parseInt(duration),
                calories: caloriesBurned,
                timestamp: new Date()
            }
        });

    } catch (error) {
        console.error('Failed to log activity:', error);
        return NextResponse.json(
            { error: 'Failed to log activity' },
            { status: 500 }
        );
    }
}
