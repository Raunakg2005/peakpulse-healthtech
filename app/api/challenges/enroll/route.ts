import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import connectDB from '@/lib/mongodb';
import UserChallenge from '@/models/UserChallenge';
import Challenge from '@/models/Challenge';

export async function POST(req: NextRequest) {
    try {
        const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

        if (!token?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { challengeId } = body;

        if (!challengeId) {
            return NextResponse.json({ error: 'Challenge ID is required' }, { status: 400 });
        }

        await connectDB();

        const challenge = await Challenge.findById(challengeId);
        if (!challenge) {
            return NextResponse.json({ error: 'Challenge not found' }, { status: 404 });
        }

        const existing = await UserChallenge.findOne({
            userId: token.id as string,
            challengeId,
            status: { $in: ['active', 'completed'] },
        });

        if (existing) {
            return NextResponse.json({ error: 'Already enrolled in this challenge' }, { status: 400 });
        }

        const userChallenge = await UserChallenge.create({
            userId: token.id as string,
            challengeId,
            status: 'active',
            progress: 0,
            startedAt: new Date(),
            pointsEarned: 0,
        });

        return NextResponse.json({ success: true, userChallenge }, { status: 201 });
    } catch (error) {
        console.error('Challenge enrollment error:', error);
        return NextResponse.json({ error: 'Failed to enroll in challenge' }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

        if (!token?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status');

        const query: any = { userId: token.id as string };
        if (status) query.status = status;

        const userChallenges = await UserChallenge.find(query)
            .populate('challengeId')
            .sort({ startedAt: -1 });

        return NextResponse.json({ success: true, challenges: userChallenges });
    } catch (error) {
        console.error('User challenges fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch challenges' }, { status: 500 });
    }
}
