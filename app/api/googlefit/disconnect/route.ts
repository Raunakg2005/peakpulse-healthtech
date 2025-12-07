import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

// Disconnect Google Fit
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession();
        if (!session?.user?.email) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const user = await User.findOne({ email: session.user.email }).select('+googleFit.accessToken');

        if (!user) {
            return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
        }

        // Revoke Google access token
        if (user.googleFit?.accessToken) {
            try {
                await fetch(`https://oauth2.googleapis.com/revoke?token=${user.googleFit.accessToken}`, {
                    method: 'POST',
                });
            } catch (error) {
                console.error('Error revoking Google token:', error);
                // Continue anyway to clear local data
            }
        }

        // Clear Google Fit data from user record
        await User.findOneAndUpdate(
            { email: session.user.email },
            {
                $set: {
                    'googleFit.accessToken': null,
                    'googleFit.refreshToken': null,
                    'googleFit.tokenExpiry': null,
                    'googleFit.isConnected': false,
                    'googleFit.lastSync': null,
                    'googleFit.scopes': [],
                }
            }
        );

        console.log('✅ Google Fit disconnected for:', user.email);

        return NextResponse.json({
            success: true,
            message: 'Google Fit disconnected successfully'
        });

    } catch (error: any) {
        console.error('Google Fit disconnect error:', error);
        return NextResponse.json({
            success: false,
            error: error.message || 'Failed to disconnect Google Fit'
        }, { status: 500 });
    }
}
