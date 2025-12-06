import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Activity from '@/models/Activity';

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();
        
        // Get user data
        const user = await User.findOne({ 
            email: session.user.email 
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Calculate BMR using Mifflin-St Jeor Equation
        const height = user.profile?.height || 170;
        const heightInCm = user.profile?.heightUnit === 'cm' ? height : height * 30.48;
        const weight = user.profile?.weight || 70;
        const weightInKg = user.profile?.weightUnit === 'kg' ? weight : weight * 0.453592;
        const age = user.profile?.age || 25;

        let bmr;
        if (user.profile?.gender === 'Male') {
            bmr = Math.round(10 * weightInKg + 6.25 * heightInCm - 5 * age + 5);
        } else {
            bmr = Math.round(10 * weightInKg + 6.25 * heightInCm - 5 * age - 161);
        }

        // Activity level multipliers
        const activityFactors: any = {
            sedentary: 1.2,
            lightly_active: 1.375,
            moderately_active: 1.55,
            very_active: 1.725,
            extra_active: 1.9
        };

        const activityFactor = activityFactors[user.profile?.activityLevel || 'sedentary'];
        const maintenanceCalories = Math.round(bmr * activityFactor);

        // Get today's activities
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const activities = await Activity.find({
            userId: session.user.email,
            timestamp: { $gte: today }
        });

        // Calculate activity calories
        const activityCalories = activities.reduce((total: number, activity: any) => {
            return total + (activity.caloriesBurned || 0);
        }, 0);

        // Calculate total burned (BMR + activity calories)
        const totalBurned = bmr + activityCalories;

        // Determine calorie goal based on user's primary goal
        let calorieGoal = maintenanceCalories;
        if (user.profile?.primaryGoal === 'Weight Loss') {
            calorieGoal = maintenanceCalories - 500;
        } else if (user.profile?.primaryGoal === 'Muscle Gain' || user.profile?.primaryGoal === 'Weight Gain') {
            calorieGoal = maintenanceCalories + 500;
        }

        return NextResponse.json({
            bmr,
            activityCalories,
            totalBurned,
            calorieGoal,
            maintenanceCalories,
            activities: activities.map((activity: any) => ({
                name: activity.type,
                duration: activity.duration,
                calories: activity.caloriesBurned,
                timestamp: activity.timestamp
            }))
        });

    } catch (error) {
        console.error('Failed to fetch calorie data:', error);
        return NextResponse.json(
            { error: 'Failed to fetch calorie data' },
            { status: 500 }
        );
    }
}
