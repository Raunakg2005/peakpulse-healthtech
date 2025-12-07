import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/mongodb';
import Friend from '@/models/Friend';
import User from '@/models/User';

// PATCH - Accept or reject friend request
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
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

        const { action } = await req.json(); // 'accept' or 'reject'

        if (!['accept', 'reject'].includes(action)) {
            return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
        }

        const { id } = await params;
        const friendship = await Friend.findById(id);

        if (!friendship) {
            return NextResponse.json({ success: false, error: 'Friend request not found' }, { status: 404 });
        }

        // Check if the user is the recipient of the friend request
        if (friendship.friendId.toString() !== user._id.toString()) {
            return NextResponse.json({ success: false, error: 'Unauthorized to modify this request' }, { status: 403 });
        }

        // Update the friendship status
        friendship.status = action === 'accept' ? 'accepted' : 'rejected';
        await friendship.save();

        const populatedFriendship = await Friend.findById(friendship._id)
            .populate('userId', 'name email avatar stats')
            .populate('friendId', 'name email avatar stats')
            .populate('requestedBy', 'name email avatar');

        return NextResponse.json({
            success: true,
            message: `Friend request ${action}ed successfully`,
            friendship: populatedFriendship
        });

    } catch (error: any) {
        console.error('Error updating friend request:', error);
        return NextResponse.json({
            success: false,
            error: error.message || 'Failed to update friend request'
        }, { status: 500 });
    }
}

// DELETE - Remove friend or cancel friend request
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
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

        const { id } = await params;
        const friendship = await Friend.findById(id);

        if (!friendship) {
            return NextResponse.json({ success: false, error: 'Friendship not found' }, { status: 404 });
        }

        // Check if the user is part of this friendship
        const isUserInvolved =
            friendship.userId.toString() === user._id.toString() ||
            friendship.friendId.toString() === user._id.toString();

        if (!isUserInvolved) {
            return NextResponse.json({ success: false, error: 'Unauthorized to delete this friendship' }, { status: 403 });
        }

        await Friend.findByIdAndDelete(id);

        return NextResponse.json({
            success: true,
            message: 'Friendship removed successfully'
        });

    } catch (error: any) {
        console.error('Error deleting friendship:', error);
        return NextResponse.json({
            success: false,
            error: error.message || 'Failed to delete friendship'
        }, { status: 500 });
    }
}
