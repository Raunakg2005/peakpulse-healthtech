# 🏃 Google Fit Integration Guide

## Overview

PeakPulse integrates with Google Fit API to automatically sync health and fitness data from wearable devices and Google Fit-enabled apps.

---

## 🎯 Features

### Supported Data Types
- **Activity Data**
  - Steps count
  - Distance traveled
  - Active minutes
  - Calories burned
  
- **Heart Rate**
  - Resting heart rate
  - Active heart rate
  - Heart rate zones

- **Sleep Data**
  - Sleep duration
  - Sleep stages (light, deep, REM)
  - Sleep quality score

- **Body Measurements**
  - Weight
  - Body fat percentage
  - BMI

- **Nutrition** (if tracked)
  - Calories consumed
  - Macronutrients

---

## 🔧 Setup Instructions

### 1. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable **Google Fit API**:
   - Navigate to "APIs & Services" → "Library"
   - Search for "Fitness API"
   - Click "Enable"

4. Create OAuth 2.0 Credentials:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client ID"
   - Application type: "Web application"
   - Add authorized redirect URIs:
     ```
     http://localhost:3000/api/auth/callback/google
     https://yourdomain.com/api/auth/callback/google
     ```

5. Configure OAuth Consent Screen:
   - User Type: External
   - Add scopes:
     - `https://www.googleapis.com/auth/fitness.activity.read`
     - `https://www.googleapis.com/auth/fitness.body.read`
     - `https://www.googleapis.com/auth/fitness.heart_rate.read`
     - `https://www.googleapis.com/auth/fitness.sleep.read`

### 2. Environment Configuration

Add to `.env.local`:
```env
# Google OAuth (already configured)
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret

# Google Fit specific scopes
GOOGLE_FIT_SCOPES=https://www.googleapis.com/auth/fitness.activity.read https://www.googleapis.com/auth/fitness.body.read https://www.googleapis.com/auth/fitness.heart_rate.read
```

### 3. NextAuth Configuration

Update `auth.ts` to include Fitness scopes:
```typescript
authorization: {
  params: {
    scope: [
      'openid',
      'email',
      'profile',
      'https://www.googleapis.com/auth/fitness.activity.read',
      'https://www.googleapis.com/auth/fitness.body.read',
      'https://www.googleapis.com/auth/fitness.heart_rate.read',
      'https://www.googleapis.com/auth/fitness.sleep.read'
    ].join(' ')
  }
}
```

---

## 📡 API Endpoints

### Sync Google Fit Data
```http
POST /api/googlefit/sync
Authorization: Bearer {session-token}
```

**Request:**
```json
{
  "dataTypes": ["steps", "calories", "heart_rate"],
  "startDate": "2025-12-01",
  "endDate": "2025-12-07"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "steps": 75234,
    "calories": 2450,
    "heart_rate": {
      "average": 72,
      "resting": 65,
      "max": 145
    },
    "distance": 52.4,
    "activeMinutes": 180
  },
  "lastSync": "2025-12-07T10:30:00Z"
}
```

### Get Fitness History
```http
GET /api/googlefit/history?days=7&type=steps
```

### Manual Refresh
```http
POST /api/googlefit/refresh
```

---

## 🔄 Data Synchronization

### Automatic Sync
- Syncs every 15 minutes when user is active
- Background sync every 6 hours
- Real-time updates on dashboard refresh

### Manual Sync
- User can trigger sync via dashboard
- Syncs last 7 days of data
- Shows sync status and timestamp

### Data Storage
```typescript
// MongoDB Schema
{
  userId: ObjectId,
  source: "google_fit",
  dataType: "steps",
  value: 10234,
  date: Date,
  timestamp: Date,
  metadata: {
    device: "Pixel Watch 2",
    syncedAt: Date
  }
}
```

---

## 🎨 UI Components

### Sync Button
```tsx
<GoogleFitSync 
  onSync={handleSync}
  lastSyncTime={lastSync}
  autoSync={true}
/>
```

### Data Display
- Real-time activity cards
- Historical charts (7/30/90 days)
- Sync status indicator
- Device information

---

## 🔒 Security & Privacy

### Data Access
- Users must explicitly grant permissions
- Can revoke access anytime from settings
- Data encrypted at rest and in transit

### OAuth Token Management
- Access tokens stored securely in database
- Refresh tokens used for seamless re-authentication
- Tokens expire after 1 hour (auto-refreshed)

### Privacy Controls
- Users can choose which data types to sync
- Option to disconnect Google Fit
- Data deletion on account removal

---

## 🐛 Troubleshooting

### Common Issues

**1. "Access Denied" Error**
- Check OAuth scopes are correctly configured
- Verify redirect URIs match exactly
- Re-authenticate with Google

**2. No Data Syncing**
- Ensure Google Fit app has data
- Check device is connected to Google Fit
- Verify API permissions are granted

**3. Sync Delays**
- Google Fit API has rate limits (10,000 requests/day)
- Data may take 5-15 minutes to appear in Google Fit
- Try manual refresh after 15 minutes

### Error Codes
- `401` - Invalid or expired token → Re-authenticate
- `403` - Insufficient permissions → Check scopes
- `429` - Rate limit exceeded → Wait and retry
- `503` - Google Fit service unavailable → Try later

---

## 📊 Data Processing

### Steps Data
```javascript
const stepsData = await fetch('https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate', {
  method: 'POST',
  body: JSON.stringify({
    aggregateBy: [{
      dataTypeName: 'com.google.step_count.delta'
    }],
    startTimeMillis: startDate,
    endTimeMillis: endDate
  })
});
```

### Calories Calculation
- Active calories from Google Fit
- BMR calculation from user profile
- Total daily energy expenditure (TDEE)

### Heart Rate Zones
- Zone 1 (50-60% max HR): Warm-up
- Zone 2 (60-70% max HR): Fat burn
- Zone 3 (70-80% max HR): Aerobic
- Zone 4 (80-90% max HR): Anaerobic
- Zone 5 (90-100% max HR): Max effort

---

## 🎯 ML Integration

### Data for ML Models
Google Fit data enhances:
- **Dropout Predictor**: Activity consistency
- **Engagement Classifier**: Real activity vs logged
- **Streak Predictor**: Continuous tracking patterns
- **Recommendation Engine**: Device-based insights

### Feature Engineering
```python
# Daily activity score
activity_score = (steps / 10000) * 0.4 + \
                 (active_minutes / 30) * 0.3 + \
                 (calories / bmr) * 0.3

# Consistency metric
consistency = std_dev(weekly_steps) / mean(weekly_steps)
```

---

## 🚀 Testing

### Test Account Setup
1. Create Google account
2. Install Google Fit app
3. Generate test data:
   - Walk 5000 steps
   - Log a workout
   - Add weight measurement

### Integration Tests
```bash
# Run Google Fit integration tests
npm run test:googlefit

# Test OAuth flow
npm run test:auth
```

---

## 📈 Metrics & Analytics

### Tracked Metrics
- Total users with Google Fit connected
- Daily sync success rate
- Average data points per user
- Most popular data types
- Device breakdown (Pixel Watch, Fitbit, etc.)

### Dashboard
- Real-time sync status
- Data quality indicators
- API usage statistics
- Error rate monitoring

---

## 🔮 Future Enhancements

### Planned Features
- ✅ Basic step tracking (Completed)
- ✅ Heart rate monitoring (In Progress)
- 🔄 Sleep analysis integration
- 📋 Nutrition data sync
- 🏃 Workout session details
- 📱 Real-time activity updates
- 🎯 Goal setting with Fit data
- 🏆 Achievements based on Fit milestones

### Advanced Features
- AI-powered activity recommendations
- Anomaly detection (unusual patterns)
- Predictive health insights
- Integration with medical devices
- Family sharing and challenges

---

## 📚 Resources

- [Google Fit REST API](https://developers.google.com/fit/rest)
- [OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Data Types Reference](https://developers.google.com/fit/datatypes)
- [Best Practices](https://developers.google.com/fit/scenarios)

---

## 🤝 Support

For Google Fit integration issues:
1. Check this documentation
2. Review [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)
3. Contact team at: healthtech-support@example.com
4. File an issue on GitHub

---

**Last Updated:** December 7, 2025  
**Status:** 🟡 In Progress - Active Development  
**Team:** 404 Healer Not Found
