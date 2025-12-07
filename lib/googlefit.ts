import User from '@/models/User';

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_FIT_API_BASE = 'https://www.googleapis.com/fitness/v1/users/me';

interface GoogleFitTokens {
    accessToken: string;
    refreshToken?: string;
    tokenExpiry: Date;
}

/**
 * Refresh Google Fit access token using refresh token
 */
export async function refreshGoogleFitToken(userId: string): Promise<GoogleFitTokens | null> {
    try {
        console.log('🔄 Refreshing Google Fit token for user:', userId);

        const user = await User.findById(userId).select('+googleFit.refreshToken +googleFit.accessToken');

        if (!user?.googleFit?.refreshToken) {
            console.error('❌ No refresh token found for user:', userId);
            return null;
        }

        console.log('✅ Refresh token found, requesting new access token');

        const response = await fetch(GOOGLE_TOKEN_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                client_id: process.env.GOOGLE_FIT_CLIENT_ID!,
                client_secret: process.env.GOOGLE_FIT_CLIENT_SECRET!,
                refresh_token: user.googleFit.refreshToken,
                grant_type: 'refresh_token',
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            console.error('❌ Token refresh error:', error);

            // If refresh token is invalid, mark as disconnected
            if (error.error === 'invalid_grant') {
                console.log('⚠️ Refresh token invalid, marking as disconnected');
                await User.findByIdAndUpdate(userId, {
                    $set: { 'googleFit.isConnected': false }
                });
            }

            return null;
        }

        const tokens = await response.json();
        const { access_token, expires_in, refresh_token } = tokens;

        // Calculate new expiry (with 5 minute buffer)
        const tokenExpiry = new Date();
        tokenExpiry.setSeconds(tokenExpiry.getSeconds() + expires_in - 300);

        console.log('✅ New access token received, expires at:', tokenExpiry);

        // Update user's tokens (keep existing refresh token if not provided)
        await User.findByIdAndUpdate(userId, {
            $set: {
                'googleFit.accessToken': access_token,
                'googleFit.refreshToken': refresh_token || user.googleFit.refreshToken,
                'googleFit.tokenExpiry': tokenExpiry,
                'googleFit.isConnected': true
            }
        });

        return {
            accessToken: access_token,
            refreshToken: refresh_token || user.googleFit.refreshToken,
            tokenExpiry,
        };

    } catch (error) {
        console.error('❌ Error refreshing Google Fit token:', error);
        return null;
    }
}

/**
 * Get valid access token, refreshing if necessary
 */
export async function getValidAccessToken(userId: string): Promise<string | null> {
    try {
        const user = await User.findById(userId).select('+googleFit.accessToken googleFit.tokenExpiry');

        if (!user?.googleFit?.accessToken) {
            return null;
        }

        // Check if token is expired or will expire in next 5 minutes
        const now = new Date();
        const expiryBuffer = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes buffer

        if (!user.googleFit.tokenExpiry || user.googleFit.tokenExpiry <= expiryBuffer) {
            // Token expired or about to expire, refresh it
            const tokens = await refreshGoogleFitToken(userId);
            return tokens?.accessToken || null;
        }

        return user.googleFit.accessToken;

    } catch (error) {
        console.error('Error getting valid access token:', error);
        return null;
    }
}

/**
 * Make authenticated request to Google Fit API
 */
export async function googleFitRequest(
    userId: string,
    endpoint: string,
    options: RequestInit = {}
): Promise<any> {
    const accessToken = await getValidAccessToken(userId);

    if (!accessToken) {
        throw new Error('No valid access token available');
    }

    const url = endpoint.startsWith('http') ? endpoint : `${GOOGLE_FIT_API_BASE}${endpoint}`;

    const response = await fetch(url, {
        ...options,
        headers: {
            ...options.headers,
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Google Fit API error: ${response.status} - ${error}`);
    }

    return response.json();
}

/**
 * Get activity data (steps, calories, distance) for a date range
 */
export async function getActivityData(
    userId: string,
    startTime: Date,
    endTime: Date
) {
    const startTimeMillis = startTime.getTime();
    const endTimeMillis = endTime.getTime();

    const body = {
        aggregateBy: [
            { dataTypeName: 'com.google.step_count.delta' },
            { dataTypeName: 'com.google.calories.expended' },
            { dataTypeName: 'com.google.distance.delta' },
            { dataTypeName: 'com.google.active_minutes' },
        ],
        bucketByTime: { durationMillis: 86400000 }, // 1 day buckets
        startTimeMillis,
        endTimeMillis,
    };

    return googleFitRequest(userId, '/dataset:aggregate', {
        method: 'POST',
        body: JSON.stringify(body),
    });
}

/**
 * Get heart rate data for a date range
 */
export async function getHeartRateData(
    userId: string,
    startTime: Date,
    endTime: Date
) {
    const startTimeMillis = startTime.getTime();
    const endTimeMillis = endTime.getTime();

    const body = {
        aggregateBy: [
            { dataTypeName: 'com.google.heart_rate.bpm' },
        ],
        bucketByTime: { durationMillis: 86400000 }, // 1 day buckets
        startTimeMillis,
        endTimeMillis,
    };

    return googleFitRequest(userId, '/dataset:aggregate', {
        method: 'POST',
        body: JSON.stringify(body),
    });
}

/**
 * Get sleep data for a date range
 */
export async function getSleepData(
    userId: string,
    startTime: Date,
    endTime: Date
) {
    const startTimeMillis = startTime.getTime();
    const endTimeMillis = endTime.getTime();

    const body = {
        aggregateBy: [
            { dataTypeName: 'com.google.sleep.segment' },
        ],
        bucketByTime: { durationMillis: 86400000 }, // 1 day buckets
        startTimeMillis,
        endTimeMillis,
    };

    return googleFitRequest(userId, '/dataset:aggregate', {
        method: 'POST',
        body: JSON.stringify(body),
    });
}

/**
 * Get body measurements (weight, height) for a date range
 */
export async function getBodyData(
    userId: string,
    startTime: Date,
    endTime: Date
) {
    const startTimeMillis = startTime.getTime();
    const endTimeMillis = endTime.getTime();

    const body = {
        aggregateBy: [
            { dataTypeName: 'com.google.weight' },
            { dataTypeName: 'com.google.height' },
            { dataTypeName: 'com.google.body.fat.percentage' },
        ],
        bucketByTime: { durationMillis: 86400000 }, // 1 day buckets
        startTimeMillis,
        endTimeMillis,
    };

    return googleFitRequest(userId, '/dataset:aggregate', {
        method: 'POST',
        body: JSON.stringify(body),
    });
}

/**
 * Get nutrition data for a date range
 */
export async function getNutritionData(
    userId: string,
    startTime: Date,
    endTime: Date
) {
    const startTimeMillis = startTime.getTime();
    const endTimeMillis = endTime.getTime();

    const body = {
        aggregateBy: [
            { dataTypeName: 'com.google.nutrition' },
            { dataTypeName: 'com.google.hydration' },
        ],
        bucketByTime: { durationMillis: 86400000 }, // 1 day buckets
        startTimeMillis,
        endTimeMillis,
    };

    return googleFitRequest(userId, '/dataset:aggregate', {
        method: 'POST',
        body: JSON.stringify(body),
    });
}
