import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import connectDB from '@/lib/mongodb';
import Activity from '@/models/Activity';

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { glasses, ml } = body; // Support both glasses and ml

        await connectDB();

        // Get user by email
        const User = (await import('@/models/User')).default;
        const user = await User.findOne({ email: session.user.email });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const waterMl = ml || (glasses * 250); // 1 glass = 250ml

        // Log water intake as an activity
        const activity = await Activity.create({
            userId: user._id,
            type: 'hydration',
            name: 'Water Intake',
            duration: 0, // Not applicable for water
            calories: 0,
            points: Math.floor(glasses * 5), // 5 points per glass
            timestamp: new Date(),
            completedAt: new Date(),
            notes: `${glasses} glasses (${waterMl}ml)`
        });

        return NextResponse.json({
            success: true,
            activity,
            message: `Logged ${glasses} glasses of water`
        }, { status: 201 });
    } catch (error) {
        console.error('Water logging error:', error);
        return NextResponse.json(
            { error: 'Failed to log water intake' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        // Get user by email
        const User = (await import('@/models/User')).default;
        const user = await User.findOne({ email: session.user.email });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Get today's water intake
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const waterActivities = await Activity.find({
            userId: user._id,
            type: 'hydration',
            completedAt: {
                $gte: today,
                $lt: tomorrow
            }
        }).sort({ completedAt: -1 });

        // Calculate total glasses today
        const totalGlasses = waterActivities.reduce((sum, activity) => {
            const glasses = activity.notes ? parseInt(activity.notes.split(' ')[0]) || 0 : 0;
            return sum + glasses;
        }, 0);

        return NextResponse.json({
            success: true,
            totalGlasses,
            activities: waterActivities,
            goal: 8 // Default goal of 8 glasses per day
        });
    } catch (error) {
        console.error('Water fetch error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch water intake' },
            { status: 500 }
        );
    }
}
