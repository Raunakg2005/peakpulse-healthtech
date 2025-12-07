import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

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

        return NextResponse.json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                status: user.status,
                profile: user.profile,
                stats: user.stats,
                mlData: user.mlData,
            },
        });
    } catch (error) {
        console.error('User profile fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch user profile' }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

        if (!token?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { name, avatar, profile, onboardingCompleted } = body;

        await connectDB();

        const updateData: any = {};
        if (name) updateData.name = name;
        if (avatar) updateData.avatar = avatar;
        if (typeof onboardingCompleted === 'boolean') updateData.onboardingCompleted = onboardingCompleted;
        if (profile) {
            if (profile.age !== undefined) updateData['profile.age'] = profile.age;
            if (profile.gender) updateData['profile.gender'] = profile.gender;
            if (profile.height !== undefined) updateData['profile.height'] = profile.height;
            if (profile.heightUnit) updateData['profile.heightUnit'] = profile.heightUnit;
            if (profile.weight !== undefined) updateData['profile.weight'] = profile.weight;
            if (profile.weightUnit) updateData['profile.weightUnit'] = profile.weightUnit;
            if (profile.activityLevel) updateData['profile.activityLevel'] = profile.activityLevel;
            if (profile.primaryGoal) updateData['profile.primaryGoal'] = profile.primaryGoal;
            if (profile.secondaryGoals) updateData['profile.secondaryGoals'] = profile.secondaryGoals;
            if (profile.fitnessLevel) updateData['profile.fitnessLevel'] = profile.fitnessLevel;
            if (profile.goals) updateData['profile.goals'] = profile.goals;
            if (profile.preferences) updateData['profile.preferences'] = profile.preferences;
        }

        console.log('Updating user profile:', token.id);
        console.log('Update data:', JSON.stringify(updateData, null, 2));

        const user = await User.findByIdAndUpdate(
            token.id,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        console.log('✅ Profile updated successfully:', user.email);

        return NextResponse.json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                status: user.status,
                profile: user.profile,
            },
        });
    } catch (error) {
        console.error('User profile update error:', error);
        return NextResponse.json({ error: 'Failed to update user profile' }, { status: 500 });
    }
}
