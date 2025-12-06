import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Challenge from '@/models/Challenge';

export async function GET(req: NextRequest) {
    try {
        await connectDB();

        const { searchParams } = new URL(req.url);
        const category = searchParams.get('category');
        const difficulty = searchParams.get('difficulty');

        const query: any = {};
        if (category) query.category = category;
        if (difficulty) query.difficulty = difficulty;

        const challenges = await Challenge.find(query)
            .sort({ createdAt: -1 })
            .limit(50);

        return NextResponse.json({
            success: true,
            challenges,
        });
    } catch (error) {
        console.error('Challenges fetch error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch challenges' },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { title, description, category, difficulty, duration, points } = body;

        if (!title || !description || !category) {
            return NextResponse.json(
                { error: 'Title, description, and category are required' },
                { status: 400 }
            );
        }

        await connectDB();

        const challenge = await Challenge.create({
            title,
            description,
            category,
            difficulty: difficulty || 'intermediate',
            duration: duration || 7,
            points: points || 100,
        });

        return NextResponse.json({
            success: true,
            challenge,
        }, { status: 201 });
    } catch (error) {
        console.error('Challenge creation error:', error);
        return NextResponse.json(
            { error: 'Failed to create challenge' },
            { status: 500 }
        );
    }
}
