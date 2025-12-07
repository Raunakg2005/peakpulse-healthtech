# Google Fit API Integration Guide

## Prerequisites

Before you begin, you need to set up Google Fit API in Google Cloud Console.

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note your **Project ID**

## Step 2: Enable Google Fit API

1. In Google Cloud Console, go to **APIs & Services** > **Library**
2. Search for "Fitness API"
3. Click on **Fitness API** and click **Enable**

## Step 3: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. If prompted, configure the OAuth consent screen:
   - User Type: **External** (for testing) or **Internal** (for organization)
   - App name: Your app name (e.g., "PeakPulse")
   - User support email: Your email
   - Developer contact: Your email
   - Add scopes:
     - `https://www.googleapis.com/auth/fitness.activity.read`
     - `https://www.googleapis.com/auth/fitness.body.read`
     - `https://www.googleapis.com/auth/fitness.location.read`
     - `https://www.googleapis.com/auth/fitness.nutrition.read`
     - `https://www.googleapis.com/auth/fitness.sleep.read`
   - Add test users (your email) if using External type

4. Create OAuth Client ID:
   - Application type: **Web application**
   - Name: "PeakPulse Web Client"
   - Authorized JavaScript origins:
     - `http://localhost:3000` (for development)
     - Your production domain (e.g., `https://yourapp.com`)
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google-fit` (for development)
     - `https://yourapp.com/api/auth/callback/google-fit` (for production)

5. Click **Create**
6. Copy the **Client ID** and **Client Secret**

## Step 4: Add Environment Variables

Add the following to your `.env.local` file:

```env
# Google Fit API Configuration
GOOGLE_FIT_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
GOOGLE_FIT_CLIENT_SECRET=your-client-secret-here
GOOGLE_FIT_REDIRECT_URI=http://localhost:3000/api/auth/callback/google-fit

# For production, also add:
# GOOGLE_FIT_REDIRECT_URI=https://yourapp.com/api/auth/callback/google-fit
```

## Step 5: Google Fit API Scopes

The following scopes are available:

### Activity Data
- `https://www.googleapis.com/auth/fitness.activity.read` - Read activity data (steps, calories, distance)
- `https://www.googleapis.com/auth/fitness.activity.write` - Write activity data

### Body Measurements
- `https://www.googleapis.com/auth/fitness.body.read` - Read body measurements (weight, height, BMI)
- `https://www.googleapis.com/auth/fitness.body.write` - Write body measurements

### Location
- `https://www.googleapis.com/auth/fitness.location.read` - Read location data
- `https://www.googleapis.com/auth/fitness.location.write` - Write location data

### Nutrition
- `https://www.googleapis.com/auth/fitness.nutrition.read` - Read nutrition data
- `https://www.googleapis.com/auth/fitness.nutrition.write` - Write nutrition data

### Sleep
- `https://www.googleapis.com/auth/fitness.sleep.read` - Read sleep data
- `https://www.googleapis.com/auth/fitness.sleep.write` - Write sleep data

### Heart Rate
- `https://www.googleapis.com/auth/fitness.heart_rate.read` - Read heart rate data
- `https://www.googleapis.com/auth/fitness.heart_rate.write` - Write heart rate data

## Step 6: Data Types Available

### Activity Data Types
- `com.google.step_count.delta` - Steps
- `com.google.calories.expended` - Calories burned
- `com.google.distance.delta` - Distance traveled
- `com.google.active_minutes` - Active minutes
- `com.google.activity.segment` - Activity type (walking, running, cycling, etc.)

### Body Data Types
- `com.google.weight` - Weight
- `com.google.height` - Height
- `com.google.body.fat.percentage` - Body fat percentage

### Heart Rate
- `com.google.heart_rate.bpm` - Heart rate in BPM

### Sleep
- `com.google.sleep.segment` - Sleep sessions

### Nutrition
- `com.google.nutrition` - Nutrition data
- `com.google.hydration` - Water intake

## Step 7: Testing

1. Start your development server
2. Navigate to the Google Fit connection page
3. Click "Connect Google Fit"
4. Sign in with your Google account
5. Grant the requested permissions
6. You should be redirected back to your app with access granted

## Important Notes

### Rate Limits
- Google Fit API has rate limits
- Default: 25,000 requests per day per project
- Burst limit: 100 requests per 100 seconds per user

### Data Retention
- Google Fit stores data for up to 18 months
- Historical data queries are limited to this timeframe

### Privacy & Security
- Always use HTTPS in production
- Store tokens securely (encrypted in database)
- Never expose Client Secret in frontend code
- Implement proper token refresh logic
- Follow Google's OAuth 2.0 best practices

### Testing Users
- During development (External app type), you can only have up to 100 test users
- Publish your app for production use to remove this limit

## Troubleshooting

### "Access Blocked: This app's request is invalid"
- Check that your redirect URI matches exactly what's configured in Google Cloud Console
- Ensure the OAuth consent screen is properly configured

### "Invalid Grant" Error
- Refresh token may have expired
- User may have revoked access
- Re-authenticate the user

### No Data Returned
- User may not have Google Fit data
- Check the time range of your query
- Verify the correct data source is being queried

## Next Steps

After completing this setup:
1. Implement OAuth flow in your app
2. Store access and refresh tokens securely
3. Implement data fetching endpoints
4. Display Google Fit data in your dashboard
5. Implement data sync functionality
