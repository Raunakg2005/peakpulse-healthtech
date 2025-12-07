import { NextRequest, NextResponse } from 'next/server';

// Test endpoint to check environment variables
export async function GET(req: NextRequest) {
    const envVars = {
        GOOGLE_FIT_CLIENT_ID: process.env.GOOGLE_FIT_CLIENT_ID,
        GOOGLE_FIT_CLIENT_SECRET: process.env.GOOGLE_FIT_CLIENT_SECRET,
        GOOGLE_FIT_REDIRECT_URI: process.env.GOOGLE_FIT_REDIRECT_URI,
    };

    return NextResponse.json({
        message: 'Environment Variables Test',
        variables: {
            GOOGLE_FIT_CLIENT_ID: envVars.GOOGLE_FIT_CLIENT_ID ? `SET (${envVars.GOOGLE_FIT_CLIENT_ID.substring(0, 10)}...)` : 'MISSING',
            GOOGLE_FIT_CLIENT_SECRET: envVars.GOOGLE_FIT_CLIENT_SECRET ? `SET (${envVars.GOOGLE_FIT_CLIENT_SECRET.substring(0, 10)}...)` : 'MISSING',
            GOOGLE_FIT_REDIRECT_URI: envVars.GOOGLE_FIT_REDIRECT_URI || 'MISSING',
        },
        allEnvKeys: Object.keys(process.env).filter(key => key.includes('GOOGLE')),
    });
}
