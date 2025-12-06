import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import connectDB from '@/lib/mongodb';
import SocialPost from '@/models/SocialPost';

export async function POST(req: NextRequest) {
    try {
        const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

        if (!token?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { content, activityId, category } = body;

        if (!content || content.trim().length === 0) {
            return NextResponse.json({ error: 'Content is required' }, { status: 400 });
        }

        await connectDB();

        const post = await SocialPost.create({
            userId: token.id as string,
            content: content.trim(),
            activityId: activityId || null,
            category: category || 'general',
        });

        // Populate the user data before returning
        const populatedPost = await SocialPost.findById(post._id)
            .populate('userId', 'name email avatar');

        return NextResponse.json({
            success: true,
            post: populatedPost
        }, { status: 201 });
    } catch (error) {
        console.error('Post creation error:', error);
        return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
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
        const limit = parseInt(searchParams.get('limit') || '20');

        const posts = await SocialPost.find()
            .populate('userId', 'name email avatar')
            .sort({ createdAt: -1 })
            .limit(limit);

        return NextResponse.json({ success: true, posts });
    } catch (error) {
        console.error('Posts fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
    }
}
