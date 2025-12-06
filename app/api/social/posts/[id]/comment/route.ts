import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import connectDB from '@/lib/mongodb';
import SocialPost from '@/models/SocialPost';
import mongoose from 'mongoose';

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

        if (!token?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { content } = await req.json();

        if (!content?.trim()) {
            return NextResponse.json({ error: 'Comment content is required' }, { status: 400 });
        }

        await connectDB();

        const { id } = await params;
        const post = await SocialPost.findById(id);

        if (!post) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 });
        }

        // Add comment with proper ObjectId
        const comment = {
            userId: new mongoose.Types.ObjectId(token.id as string),
            content: content.trim(),
            createdAt: new Date()
        };

        post.comments = post.comments || [];
        post.comments.push(comment);
        await post.save();

        // Populate the comment with user details
        await post.populate('comments.userId', 'name email avatar');

        return NextResponse.json({
            success: true,
            comment: post.comments[post.comments.length - 1]
        });

    } catch (error) {
        console.error('Comment post error:', error);
        return NextResponse.json({ error: 'Failed to post comment' }, { status: 500 });
    }
}
