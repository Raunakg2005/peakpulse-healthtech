import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';

// Scopes for Google Fit API
const GOOGLE_FIT_SCOPES = [
    'https://www.googleapis.com/auth/fitness.activity.read',
    'https://www.googleapis.com/auth/fitness.body.read',
    'https://www.googleapis.com/auth/fitness.heart_rate.read',
    'https://www.googleapis.com/auth/fitness.sleep.read',
    'https://www.googleapis.com/auth/fitness.nutrition.read',
    'https://www.googleapis.com/auth/fitness.location.read',
];

// Initiate Google Fit OAuth flow
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const clientId = process.env.GOOGLE_FIT_CLIENT_ID;
        const redirectUri = process.env.GOOGLE_FIT_REDIRECT_URI;

        console.log('🔍 Google Fit Connect Debug:');
        console.log('Client ID exists:', !!clientId);
        console.log('Client ID length:', clientId?.length || 0);
        console.log('Redirect URI:', redirectUri);

        if (!clientId || !redirectUri) {
            console.error('❌ Missing Google Fit configuration');
            console.error('GOOGLE_FIT_CLIENT_ID:', clientId ? 'SET' : 'MISSING');
            console.error('GOOGLE_FIT_REDIRECT_URI:', redirectUri ? 'SET' : 'MISSING');
            return NextResponse.json({
                error: 'Google Fit not configured. Please add GOOGLE_FIT_CLIENT_ID and GOOGLE_FIT_REDIRECT_URI to environment variables.'
            }, { status: 500 });
        }

        // Build authorization URL
        const authUrl = new URL(GOOGLE_AUTH_URL);
        authUrl.searchParams.append('client_id', clientId);
        authUrl.searchParams.append('redirect_uri', redirectUri);
        authUrl.searchParams.append('response_type', 'code');
        authUrl.searchParams.append('scope', GOOGLE_FIT_SCOPES.join(' '));
        authUrl.searchParams.append('access_type', 'offline'); // Request refresh token
        authUrl.searchParams.append('prompt', 'consent'); // Force consent screen to get refresh token

        console.log('✅ Redirecting to Google OAuth...');
        console.log('Auth URL:', authUrl.toString().substring(0, 100) + '...');

        // Redirect to Google OAuth
        return NextResponse.redirect(authUrl.toString());

    } catch (error: any) {
        console.error('Google Fit connect error:', error);
        return NextResponse.json({
            error: 'Failed to initiate Google Fit connection'
        }, { status: 500 });
    }
}
