import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/mongodb';
import Friend from '@/models/Friend';
import User from '@/models/User';

// GET - Get all friends and pending requests
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession();
        if (!session?.user?.email) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
        }

        const { searchParams } = new URL(req.url);
        const type = searchParams.get('type') || 'all'; // all, friends, pending, sent

        let query: any = {};

        if (type === 'friends') {
            // Get accepted friends
            query = {
                $or: [
                    { userId: user._id, status: 'accepted' },
                    { friendId: user._id, status: 'accepted' }
                ]
            };
        } else if (type === 'pending') {
            // Get pending requests received by the user
            query = {
                friendId: user._id,
                status: 'pending'
            };
        } else if (type === 'sent') {
            // Get pending requests sent by the user
            query = {
                userId: user._id,
                status: 'pending'
            };
        } else {
            // Get all relationships
            query = {
                $or: [
                    { userId: user._id },
                    { friendId: user._id }
                ]
            };
        }

        const friendships = await Friend.find(query)
            .populate('userId', 'name email avatar stats status')
            .populate('friendId', 'name email avatar stats status')
            .populate('requestedBy', 'name email avatar')
            .sort({ createdAt: -1 });

        // Format the response
        const formattedFriendships = friendships.map(friendship => {
            const isSender = friendship.userId._id.toString() === user._id.toString();
            const friend = isSender ? friendship.friendId : friendship.userId;

            return {
                _id: friendship._id,
                friend: {
                    _id: (friend as any)._id,
                    name: (friend as any).name,
                    email: (friend as any).email,
                    avatar: (friend as any).avatar,
                    stats: (friend as any).stats,
                    status: (friend as any).status
                },
                status: friendship.status,
                requestedBy: friendship.requestedBy,
                isSender,
                createdAt: friendship.createdAt
            };
        });

        return NextResponse.json({
            success: true,
            friendships: formattedFriendships
        });

    } catch (error: any) {
        console.error('Error fetching friends:', error);
        return NextResponse.json({
            success: false,
            error: error.message || 'Failed to fetch friends'
        }, { status: 500 });
    }
}

// POST - Send friend request
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession();
        if (!session?.user?.email) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
        }

        const { friendId } = await req.json();

        if (!friendId) {
            return NextResponse.json({ success: false, error: 'Friend ID is required' }, { status: 400 });
        }

        // Check if trying to add yourself
        if (friendId === user._id.toString()) {
            return NextResponse.json({ success: false, error: 'Cannot add yourself as a friend' }, { status: 400 });
        }

        // Check if friend exists
        const friend = await User.findById(friendId);
        if (!friend) {
            return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
        }

        // Check if friendship already exists
        const existingFriendship = await Friend.findOne({
            $or: [
                { userId: user._id, friendId: friendId },
                { userId: friendId, friendId: user._id }
            ]
        });

        if (existingFriendship) {
            if (existingFriendship.status === 'accepted') {
                return NextResponse.json({ success: false, error: 'Already friends' }, { status: 400 });
            } else if (existingFriendship.status === 'pending') {
                return NextResponse.json({ success: false, error: 'Friend request already sent' }, { status: 400 });
            } else if (existingFriendship.status === 'blocked') {
                return NextResponse.json({ success: false, error: 'Cannot send friend request' }, { status: 400 });
            }
        }

        // Create friend request
        const friendship = await Friend.create({
            userId: user._id,
            friendId: friendId,
            status: 'pending',
            requestedBy: user._id
        });

        const populatedFriendship = await Friend.findById(friendship._id)
            .populate('userId', 'name email avatar stats')
            .populate('friendId', 'name email avatar stats')
            .populate('requestedBy', 'name email avatar');

        return NextResponse.json({
            success: true,
            message: 'Friend request sent successfully',
            friendship: populatedFriendship
        });

    } catch (error: any) {
        console.error('Error sending friend request:', error);
        return NextResponse.json({
            success: false,
            error: error.message || 'Failed to send friend request'
        }, { status: 500 });
    }
}
