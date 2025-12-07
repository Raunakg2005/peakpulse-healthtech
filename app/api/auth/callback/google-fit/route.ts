import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';

// OAuth callback handler
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession();
        if (!session?.user?.email) {
            return NextResponse.redirect(new URL('/signin?error=unauthorized', req.url));
        }

        const { searchParams } = new URL(req.url);
        const code = searchParams.get('code');
        const error = searchParams.get('error');

        if (error) {
            console.error('❌ Google Fit OAuth error:', error);
            return NextResponse.redirect(new URL('/dashboard/insights?error=oauth_error', req.url));
        }

        if (!code) {
            return NextResponse.redirect(new URL('/dashboard/insights?error=missing_code', req.url));
        }

        console.log('🔄 Exchanging authorization code for tokens...');

        // Exchange authorization code for tokens
        const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                code,
                client_id: process.env.GOOGLE_FIT_CLIENT_ID!,
                client_secret: process.env.GOOGLE_FIT_CLIENT_SECRET!,
                redirect_uri: process.env.GOOGLE_FIT_REDIRECT_URI!,
                grant_type: 'authorization_code',
            }),
        });

        if (!tokenResponse.ok) {
            const errorData = await tokenResponse.json();
            console.error('❌ Token exchange error:', errorData);
            return NextResponse.redirect(new URL('/dashboard/insights?error=token_error', req.url));
        }

        const tokens = await tokenResponse.json();
        const { access_token, refresh_token, expires_in, scope } = tokens;

        console.log('✅ Tokens received successfully');

        // Calculate token expiry
        const tokenExpiry = new Date();
        tokenExpiry.setSeconds(tokenExpiry.getSeconds() + expires_in);

        // Save tokens to user's database record
        await dbConnect();

        const user = await User.findOneAndUpdate(
            { email: session.user.email },
            {
                $set: {
                    'googleFit.accessToken': access_token,
                    'googleFit.refreshToken': refresh_token,
                    'googleFit.tokenExpiry': tokenExpiry,
                    'googleFit.isConnected': true,
                    'googleFit.scopes': scope.split(' '),
                    'googleFit.lastSync': new Date(),
                }
            },
            { new: true }
        );

        if (!user) {
            console.error('❌ User not found');
            return NextResponse.redirect(new URL('/dashboard/insights?error=user_not_found', req.url));
        }

        console.log('✅ Google Fit connected successfully for:', session.user.email);

        // Redirect to insights page with success message
        return NextResponse.redirect(new URL('/dashboard/insights?connected=true', req.url));

    } catch (error: any) {
        console.error('❌ Google Fit callback error:', error);

        // Redirect to insights page with error
        return NextResponse.redirect(new URL('/dashboard/insights?error=connection_failed', req.url));
    }
}
