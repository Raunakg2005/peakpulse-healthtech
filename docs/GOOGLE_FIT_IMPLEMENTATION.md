# Google Fit Integration - Implementation Guide

## Overview
This guide explains how to use the Google Fit integration in your application.

## Files Created

### 1. Database Model
- **`models/User.ts`** - Updated with `googleFit` field to store OAuth tokens

### 2. API Routes

#### OAuth Flow
- **`/api/googlefit/connect`** - Initiates OAuth flow, redirects to Google
- **`/api/auth/callback/google-fit`** - OAuth callback handler, exchanges code for tokens

#### Data Management
- **`/api/googlefit/data`** - Fetches Google Fit data
- **`/api/googlefit/disconnect`** - Disconnects Google Fit and revokes tokens

### 3. Utility Library
- **`lib/googlefit.ts`** - Helper functions for Google Fit API calls

### 4. Documentation
- **`docs/GOOGLE_FIT_SETUP.md`** - Setup instructions
- **`.env.local.example`** - Environment variables template

## Environment Variables Required

Add these to your `.env.local` file:

```env
GOOGLE_FIT_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_FIT_CLIENT_SECRET=your-client-secret
GOOGLE_FIT_REDIRECT_URI=http://localhost:3000/api/auth/callback/google-fit
```

## Usage Examples

### 1. Connect Google Fit

Create a button in your UI:

```tsx
<button onClick={() => window.location.href = '/api/googlefit/connect'}>
  Connect Google Fit
</button>
```

### 2. Check Connection Status

```tsx
const [isConnected, setIsConnected] = useState(false);

useEffect(() => {
  fetch('/api/user/profile')
    .then(res => res.json())
    .then(data => {
      setIsConnected(data.user?.googleFit?.isConnected || false);
    });
}, []);
```

### 3. Fetch Activity Data

```tsx
// Get last 7 days of activity data
const fetchActivityData = async () => {
  const response = await fetch('/api/googlefit/data?type=activity&days=7');
  const data = await response.json();
  
  if (data.success) {
    console.log('Activity data:', data.data);
  }
};
```

### 4. Fetch Different Data Types

```tsx
// Heart rate data
fetch('/api/googlefit/data?type=heart_rate&days=7')

// Sleep data
fetch('/api/googlefit/data?type=sleep&days=7')

// Body measurements
fetch('/api/googlefit/data?type=body&days=30')
```

### 5. Disconnect Google Fit

```tsx
const disconnectGoogleFit = async () => {
  const response = await fetch('/api/googlefit/disconnect', {
    method: 'POST'
  });
  
  const data = await response.json();
  if (data.success) {
    console.log('Disconnected successfully');
  }
};
```

## Data Structures

### Activity Data Response
```json
{
  "success": true,
  "dataType": "activity",
  "startTime": "2024-01-01T00:00:00.000Z",
  "endTime": "2024-01-07T23:59:59.999Z",
  "data": {
    "bucket": [
      {
        "startTimeMillis": "1704067200000",
        "endTimeMillis": "1704153600000",
        "dataset": [
          {
            "dataSourceId": "...",
            "point": [
              {
                "value": [
                  {
                    "intVal": 8542  // steps
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
}
```

### Processing Activity Data

```tsx
const processActivityData = (data: any) => {
  return data.bucket.map((bucket: any) => {
    const date = new Date(parseInt(bucket.startTimeMillis));
    const steps = bucket.dataset[0]?.point[0]?.value[0]?.intVal || 0;
    const calories = bucket.dataset[1]?.point[0]?.value[0]?.fpVal || 0;
    const distance = bucket.dataset[2]?.point[0]?.value[0]?.fpVal || 0;
    
    return {
      date,
      steps,
      calories: Math.round(calories),
      distance: Math.round(distance), // in meters
    };
  });
};
```

## Available Data Types

### 1. Activity Data
- **Steps**: `com.google.step_count.delta`
- **Calories**: `com.google.calories.expended`
- **Distance**: `com.google.distance.delta`
- **Active Minutes**: `com.google.active_minutes`

### 2. Heart Rate
- **BPM**: `com.google.heart_rate.bpm`

### 3. Sleep
- **Sleep Sessions**: `com.google.sleep.segment`

### 4. Body Measurements
- **Weight**: `com.google.weight`
- **Height**: `com.google.height`
- **Body Fat %**: `com.google.body.fat.percentage`

### 5. Nutrition
- **Nutrition**: `com.google.nutrition`
- **Hydration**: `com.google.hydration`

## Token Management

### Automatic Token Refresh
The system automatically refreshes expired tokens:
- Tokens are checked before each API call
- If expired or expiring soon (within 5 minutes), they're refreshed
- Refresh happens transparently in the background

### Token Storage
- Access tokens and refresh tokens are stored in MongoDB
- Tokens are marked with `select: false` for security
- Only explicitly requested when needed

### Token Expiry Handling
```tsx
const fetchData = async () => {
  const response = await fetch('/api/googlefit/data?type=activity');
  const data = await response.json();
  
  if (data.needsReauth) {
    // Token refresh failed, user needs to reconnect
    alert('Please reconnect Google Fit');
    window.location.href = '/api/googlefit/connect';
  }
};
```

## Error Handling

### Common Errors

1. **Not Connected**
```json
{
  "success": false,
  "error": "Google Fit not connected"
}
```

2. **Authorization Expired**
```json
{
  "success": false,
  "error": "Google Fit authorization expired. Please reconnect.",
  "needsReauth": true
}
```

3. **Invalid Data Type**
```json
{
  "success": false,
  "error": "Invalid data type"
}
```

## Best Practices

### 1. Check Connection Before Fetching
```tsx
if (user.googleFit?.isConnected) {
  // Fetch data
} else {
  // Show connect button
}
```

### 2. Handle Reauthorization
```tsx
const fetchWithReauth = async (url: string) => {
  const response = await fetch(url);
  const data = await response.json();
  
  if (data.needsReauth) {
    // Redirect to reconnect
    window.location.href = '/api/googlefit/connect';
    return null;
  }
  
  return data;
};
```

### 3. Cache Data Locally
```tsx
// Don't fetch on every render
useEffect(() => {
  const lastFetch = localStorage.getItem('googlefit_last_fetch');
  const now = Date.now();
  
  // Only fetch if more than 1 hour has passed
  if (!lastFetch || now - parseInt(lastFetch) > 3600000) {
    fetchGoogleFitData();
    localStorage.setItem('googlefit_last_fetch', now.toString());
  }
}, []);
```

### 4. Show Loading States
```tsx
const [loading, setLoading] = useState(false);

const fetchData = async () => {
  setLoading(true);
  try {
    const data = await fetch('/api/googlefit/data?type=activity');
    // Process data
  } finally {
    setLoading(false);
  }
};
```

## Rate Limits

Google Fit API has the following limits:
- **25,000 requests per day** per project
- **100 requests per 100 seconds** per user

To stay within limits:
1. Cache data locally
2. Batch requests when possible
3. Only fetch when necessary
4. Use appropriate time ranges

## Security Considerations

1. **Never expose tokens in frontend**
   - Tokens are stored server-side only
   - API routes handle all Google Fit communication

2. **Use HTTPS in production**
   - Update redirect URI to use HTTPS
   - Ensure all API calls use secure connections

3. **Implement proper error handling**
   - Don't expose sensitive error details to users
   - Log errors server-side for debugging

4. **Validate user permissions**
   - Always check user authentication
   - Verify user owns the data being accessed

## Testing

### 1. Test OAuth Flow
1. Click "Connect Google Fit"
2. Sign in with Google
3. Grant permissions
4. Verify redirect back to app
5. Check database for stored tokens

### 2. Test Data Fetching
1. Ensure Google Fit has data
2. Call data API endpoint
3. Verify response structure
4. Check data accuracy

### 3. Test Token Refresh
1. Manually expire token in database
2. Make API call
3. Verify token is refreshed automatically

### 4. Test Disconnection
1. Click disconnect
2. Verify tokens are cleared
3. Verify Google access is revoked

## Troubleshooting

See `docs/GOOGLE_FIT_SETUP.md` for common issues and solutions.

## Next Steps

1. Add Google Fit connection UI to profile page
2. Create dashboard widgets to display Google Fit data
3. Implement data sync background job
4. Add data visualization charts
5. Integrate with existing activity tracking
