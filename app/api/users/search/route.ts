import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Friend from '@/models/Friend';

// GET - Search for users
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession();
        if (!session?.user?.email) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const currentUser = await User.findOne({ email: session.user.email });
        if (!currentUser) {
            return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
        }

        const { searchParams } = new URL(req.url);
        const query = searchParams.get('q') || '';
        const limit = parseInt(searchParams.get('limit') || '20');

        if (!query || query.trim().length < 2) {
            return NextResponse.json({
                success: true,
                users: []
            });
        }

        // Search for users by name or email
        const users = await User.find({
            _id: { $ne: currentUser._id }, // Exclude current user
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { email: { $regex: query, $options: 'i' } }
            ]
        })
            .select('name email avatar stats status')
            .limit(limit);

        // Get friendship status for each user
        const userIds = users.map(u => u._id);
        const friendships = await Friend.find({
            $or: [
                { userId: currentUser._id, friendId: { $in: userIds } },
                { userId: { $in: userIds }, friendId: currentUser._id }
            ]
        });

        // Create a map of friendship statuses
        const friendshipMap = new Map();
        friendships.forEach(friendship => {
            const otherUserId = friendship.userId.toString() === currentUser._id.toString()
                ? friendship.friendId.toString()
                : friendship.userId.toString();

            friendshipMap.set(otherUserId, {
                status: friendship.status,
                friendshipId: friendship._id,
                isSender: friendship.userId.toString() === currentUser._id.toString()
            });
        });

        // Add friendship status to each user
        const usersWithStatus = users.map(user => ({
            _id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            status: user.status,
            stats: user.stats,
            friendshipStatus: friendshipMap.get(user._id.toString()) || null
        }));

        return NextResponse.json({
            success: true,
            users: usersWithStatus
        });

    } catch (error: any) {
        console.error('Error searching users:', error);
        return NextResponse.json({
            success: false,
            error: error.message || 'Failed to search users'
        }, { status: 500 });
    }
}
