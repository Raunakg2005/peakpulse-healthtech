import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

// PATCH - Update user status
export async function PATCH(req: NextRequest) {
    try {
        const session = await getServerSession();
        if (!session?.user?.email) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const { status } = await req.json();

        if (!['active', 'non-active', 'rest-day'].includes(status)) {
            return NextResponse.json({ success: false, error: 'Invalid status' }, { status: 400 });
        }

        const user = await User.findOneAndUpdate(
            { email: session.user.email },
            { status },
            { new: true }
        ).select('name email avatar status stats');

        if (!user) {
            return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: 'Status updated successfully',
            user
        });

    } catch (error: any) {
        console.error('Error updating status:', error);
        return NextResponse.json({
            success: false,
            error: error.message || 'Failed to update status'
        }, { status: 500 });
    }
}
