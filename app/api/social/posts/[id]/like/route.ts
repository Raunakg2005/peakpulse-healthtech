import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import connectDB from '@/lib/mongodb';
import SocialPost from '@/models/SocialPost';

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

        if (!token?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        await connectDB();

        const post = await SocialPost.findById(id);

        if (!post) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 });
        }

        const userIdStr = (token.id as string).toString();
        const likeIndex = post.likes.findIndex((like) =>
            like.userId.toString() === userIdStr
        );

        if (likeIndex > -1) {
            // Unlike
            post.likes.splice(likeIndex, 1);
        } else {
            // Like
            post.likes.push({ userId: token.id as any });
        }

        await post.save();

        return NextResponse.json({
            success: true,
            liked: likeIndex === -1,
            likesCount: post.likes.length,
        });
    } catch (error) {
        console.error('Like toggle error:', error);
        return NextResponse.json({ error: 'Failed to toggle like' }, { status: 500 });
    }
}
