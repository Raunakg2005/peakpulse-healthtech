# 📡 PeakPulse API Documentation

## Base URLs

- **Frontend API**: `http://localhost:3000/api`
- **ML Service**: `http://localhost:8000`

## Authentication

All protected endpoints require authentication via NextAuth session cookies.

### Authentication Headers
```
Cookie: next-auth.session-token=<token>
```

---

## User Management APIs

### Get User Profile

**Endpoint:** `GET /api/user/profile`

**Authentication:** Required

**Response:**
```json
{
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "image": "https://...",
    "profile": {
      "age": 30,
      "gender": "male",
      "height": 175,
      "heightUnit": "cm",
      "weight": 70,
      "weightUnit": "kg",
      "activityLevel": "moderate",
      "primaryGoal": "fitness"
    },
    "stats": {
      "totalPoints": 1500,
      "level": 8,
      "currentStreak": 15,
      "longestStreak": 30,
      "completedChallenges": 5,
      "badges": ["streak_7", "first_challenge", "10k_steps"]
    }
  }
}
```

### Update User Profile

**Endpoint:** `PATCH /api/user/profile`

**Authentication:** Required

**Request Body:**
```json
{
  "name": "John Doe",
  "profile": {
    "age": 30,
    "gender": "male",
    "height": 175,
    "heightUnit": "cm",
    "weight": 70,
    "weightUnit": "kg",
    "activityLevel": "moderate",
    "primaryGoal": "fitness"
  }
}
```

**Response:**
```json
{
  "message": "Profile updated successfully",
  "user": { /* updated user object */ }
}
```

---

## Activity Tracking APIs

### Get Calorie Data

**Endpoint:** `GET /api/calories`

**Authentication:** Required

**Response:**
```json
{
  "totalBurned": 2500,
  "bmr": 1650,
  "activityCalories": 850,
  "calorieGoal": 2200,
  "maintenanceCalories": 2300,
  "weightLossCalories": 1800,
  "weightGainCalories": 2800,
  "activities": [
    {
      "name": "Running",
      "duration": 30,
      "calories": 300,
      "timestamp": "2025-12-06T10:00:00Z"
    }
  ]
}
```

### Log Activity

**Endpoint:** `POST /api/calories/activity`

**Authentication:** Required

**Request Body:**
```json
{
  "name": "Running",
  "duration": "30",
  "intensity": "moderate"
}
```

**Response:**
```json
{
  "success": true,
  "activity": {
    "name": "Running",
    "duration": 30,
    "calories": 300,
    "timestamp": "2025-12-06T10:00:00Z"
  },
  "gamification": {
    "pointsEarned": 10,
    "newTotalPoints": 1510,
    "leveledUp": false,
    "newBadges": []
  }
}
```

### Get All Activities

**Endpoint:** `GET /api/activities`

**Authentication:** Required

**Query Parameters:**
- `limit` (optional): Number of activities to return

**Response:**
```json
{
  "activities": [
    {
      "_id": "...",
      "userId": "...",
      "type": "Running",
      "duration": 30,
      "intensity": "moderate",
      "caloriesBurned": 300,
      "met": 9.8,
      "timestamp": "2025-12-06T10:00:00Z"
    }
  ]
}
```

---

## Gamification APIs

### Award Points

**Endpoint:** `POST /api/gamification`

**Authentication:** Required

**Request Body:**
```json
{
  "action": "complete_activity",
  "metadata": {
    "activityType": "Running",
    "duration": 30,
    "caloriesBurned": 300
  }
}
```

**Available Actions:**
- `complete_activity` (10 pts)
- `complete_challenge` (50 pts)
- `maintain_streak` (5 pts)
- `social_interaction` (3 pts)
- `achieve_goal` (25 pts)
- `refer_friend` (100 pts)
- `complete_profile` (20 pts)
- `share_achievement` (15 pts)
- `help_community` (30 pts)
- `perfect_week` (100 pts)
- `level_up` (50 pts)

**Response:**
```json
{
  "success": true,
  "pointsEarned": 10,
  "newTotalPoints": 1510,
  "leveledUp": true,
  "newLevel": 9,
  "oldLevel": 8,
  "newBadges": [
    {
      "id": "streak_30",
      "name": "Streak Master",
      "description": "Maintain a 30-day streak",
      "icon": "🔥",
      "rarity": "rare",
      "points": 250
    }
  ],
  "message": "Earned 10 points!"
}
```

### Get User Badges

**Endpoint:** `GET /api/gamification`

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "earned": [
    {
      "id": "streak_7",
      "name": "First Week",
      "description": "Maintain a 7-day streak",
      "icon": "🔥",
      "category": "streak",
      "rarity": "common",
      "points": 50
    }
  ],
  "available": [
    {
      "badge": {
        "id": "streak_30",
        "name": "Streak Master",
        /* ... */
      },
      "progress": 50,
      "eligible": false
    }
  ],
  "stats": {
    "totalBadges": 3,
    "totalPossible": 25,
    "completionRate": 12
  }
}
```

---

## Leaderboard APIs

### Get Leaderboard

**Endpoint:** `GET /api/leaderboard`

**Authentication:** Required

**Query Parameters:**
- `limit` (optional): Number of users (default: 50)

**Response:**
```json
{
  "leaderboard": [
    {
      "rank": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "points": 15000,
      "streak": 45,
      "level": 18,
      "badges": ["streak_30", "marathon_runner", "challenge_master"]
    }
  ]
}
```

---

## ML Service APIs

### Predict Dropout Risk (Quantum)

**Endpoint:** `POST http://localhost:8000/api/predict-dropout-quantum`

**Request Body:**
```json
{
  "user_id": "507f1f77bcf86cd799439011",
  "days_active": 15,
  "completion_rate": 0.75,
  "social_score": 0.6,
  "avg_steps": 7500
}
```

**Response:**
```json
{
  "user_id": "507f1f77bcf86cd799439011",
  "dropout_probability": 0.23,
  "prediction": "active",
  "confidence": 0.87,
  "quantum_component": 0.21,
  "classical_component": 0.25,
  "hybrid_weights": {
    "classical": 0.6,
    "quantum": 0.4
  },
  "recommendation": "User showing good engagement patterns",
  "model_version": "v1.0_quantum"
}
```

### Compare Quantum vs Classical

**Endpoint:** `POST http://localhost:8000/api/predict-compare`

**Request Body:**
```json
{
  "user_id": "507f1f77bcf86cd799439011",
  "days_active": 15,
  "completion_rate": 0.75,
  "social_score": 0.6,
  "avg_steps": 7500
}
```

**Response:**
```json
{
  "user_id": "507f1f77bcf86cd799439011",
  "quantum": {
    "dropout_probability": 0.23,
    "prediction": "active",
    "confidence": 0.87
  },
  "classical": {
    "dropout_probability": 0.28,
    "prediction": "active",
    "confidence": 0.82
  },
  "quantum_advantage": 0.05,
  "recommendation": "Quantum model shows 5% improvement"
}
```

### Predict Engagement Level

**Endpoint:** `POST http://localhost:8000/api/predict-engagement`

**Request Body:**
```json
{
  "user_id": "507f1f77bcf86cd799439011",
  "features": {
    "days_active": 15,
    "activities_completed": 30,
    "challenges_completed": 5,
    "social_interactions": 20
  }
}
```

**Response:**
```json
{
  "engagement_level": "high",
  "confidence": 0.85,
  "factors": {
    "activity_frequency": "excellent",
    "social_engagement": "good",
    "challenge_completion": "moderate"
  }
}
```

### Get Activity Recommendations

**Endpoint:** `POST http://localhost:8000/api/recommend-activities`

**Request Body:**
```json
{
  "user_id": "507f1f77bcf86cd799439011",
  "preferences": {
    "difficulty": "medium",
    "duration": 30,
    "type": "cardio"
  }
}
```

**Response:**
```json
{
  "recommendations": [
    {
      "activity": "Running",
      "duration": 30,
      "difficulty": "medium",
      "estimated_calories": 300,
      "confidence": 0.92
    },
    {
      "activity": "Cycling",
      "duration": 30,
      "difficulty": "medium",
      "estimated_calories": 250,
      "confidence": 0.88
    }
  ]
}
```

### Predict Challenge Difficulty

**Endpoint:** `POST http://localhost:8000/api/predict-difficulty`

**Request Body:**
```json
{
  "user_id": "507f1f77bcf86cd799439011",
  "challenge_type": "steps",
  "user_history": {
    "avg_daily_steps": 8000,
    "completion_rate": 0.75
  }
}
```

**Response:**
```json
{
  "recommended_difficulty": "medium",
  "suggested_goal": 10000,
  "success_probability": 0.78,
  "reasoning": "Based on your average daily steps and completion history"
}
```

### Select Message Tone

**Endpoint:** `POST http://localhost:8000/api/select-tone`

**Request Body:**
```json
{
  "user_id": "507f1f77bcf86cd799439011",
  "context": "motivation",
  "user_state": {
    "engagement_level": "medium",
    "recent_activity": "declining"
  }
}
```

**Response:**
```json
{
  "recommended_tone": "encouraging",
  "sample_messages": [
    "You're doing great! Keep up the momentum!",
    "Every step counts. Let's keep moving forward!"
  ]
}
```

---

## Error Responses

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Authentication required"
}
```

### 404 Not Found
```json
{
  "error": "Not Found",
  "message": "User not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal Server Error",
  "message": "Something went wrong"
}
```

---

## Rate Limiting

Currently no rate limiting is implemented. In production:
- 100 requests per minute per user
- 1000 requests per hour per user

---

## WebSocket Events (Future)

### Real-time Achievement Notifications
```javascript
// Connect to WebSocket
const ws = new WebSocket('ws://localhost:3000/ws');

// Listen for achievement events
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === 'achievement') {
    // Display notification
  }
};
```

---

## API Client Example

### JavaScript/TypeScript

```typescript
// lib/api.ts
export async function logActivity(activity: {
  name: string;
  duration: string;
  intensity: string;
}) {
  const response = await fetch('/api/calories/activity', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(activity)
  });
  return response.json();
}

// Usage
const result = await logActivity({
  name: 'Running',
  duration: '30',
  intensity: 'moderate'
});
```

### Python

```python
import requests

# ML Service
def predict_dropout(user_data):
    response = requests.post(
        'http://localhost:8000/api/predict-dropout-quantum',
        json=user_data
    )
    return response.json()

# Usage
result = predict_dropout({
    'user_id': '123',
    'days_active': 15,
    'completion_rate': 0.75,
    'social_score': 0.6,
    'avg_steps': 7500
})
```

---

## Testing

### cURL Examples

**Get User Profile:**
```bash
curl http://localhost:3000/api/user/profile \
  -H "Cookie: next-auth.session-token=<token>"
```

**Log Activity:**
```bash
curl -X POST http://localhost:3000/api/calories/activity \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=<token>" \
  -d '{"name":"Running","duration":"30","intensity":"moderate"}'
```

**Quantum Prediction:**
```bash
curl -X POST http://localhost:8000/api/predict-dropout-quantum \
  -H "Content-Type: application/json" \
  -d '{"user_id":"123","days_active":15,"completion_rate":0.75,"social_score":0.6,"avg_steps":7500}'
```

---

## API Versioning

Current version: **v1** (no version prefix)

Future versions will use URL prefix: `/api/v2/...`

---

## Changelog

### v1.0.0 (December 2025)
- Initial API release
- User management endpoints
- Activity tracking
- Gamification system
- ML predictions (7 models)
- Quantum dropout predictor
