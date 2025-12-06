# 🎮 Gamification System Documentation

## Overview

The PeakPulse gamification system provides a comprehensive rewards and achievements framework to boost user engagement and motivation. The system includes:

- **Points & Levels**: Progressive leveling system with 30 levels
- **Badges**: 25 unique badges across 5 categories
- **Leaderboard**: Global ranking system
- **Real-time Notifications**: Achievement popups for badges, level-ups, and points

## Architecture

### Core Files

1. **`lib/gamification.ts`** - Constants and helper functions
   - Badge definitions (25 badges)
   - Level thresholds (30 levels)
   - Point reward mappings
   - Helper functions: `calculateLevel()`, `getLevelProgress()`, `checkBadgeEligibility()`

2. **`app/api/gamification/route.ts`** - API endpoints
   - `POST` - Award points and check for new badges
   - `GET` - Fetch user badges and progress

3. **`app/(dashboard)/achievements/page.tsx`** - Achievements UI
   - Display earned and locked badges
   - Progress tracking
   - Category filtering

4. **`app/(dashboard)/leaderboard/page.tsx`** - Leaderboard UI
   - Top 3 podium display
   - Ranked user list
   - Real-time rankings

5. **`components/AchievementNotification.tsx`** - Toast notifications
   - Badge unlock alerts
   - Level-up celebrations
   - Points earned feedback

6. **`components/UserStatsWidget.tsx`** - Dashboard stats widget
   - Level progress bar
   - Badge count
   - Streak tracking
   - Quick links to achievements/leaderboard

## Badge System

### Categories & Badges

#### 🔥 Streak Badges (4)
- **First Week** - Maintain a 7-day streak (50 pts)
- **Streak Master** - Maintain a 30-day streak (250 pts)
- **Century Club** - Maintain a 100-day streak (1000 pts)
- **Legendary Streak** - Maintain a 365-day streak (10000 pts)

#### 💪 Activity Badges (6)
- **10K Steps** - Walk 10,000 steps in one day (100 pts)
- **Marathon Runner** - Complete 100km total running (500 pts)
- **Active Lifestyle** - Log 50 different activities (400 pts)
- **Step Master** - Walk 1,000,000 steps total (2000 pts)
- **Meditation Guru** - Complete 100 meditation sessions (800 pts)
- **Early Bird** - Log activity before 7 AM 10 times (300 pts)

#### 🏆 Challenge Badges (4)
- **Challenge Accepted** - Complete your first challenge (50 pts)
- **Challenge Champion** - Complete 10 challenges (400 pts)
- **Challenge Master** - Complete 50 challenges (1500 pts)
- **Challenge Legend** - Complete 100 challenges (5000 pts)

#### 👥 Social Badges (3)
- **Social Butterfly** - Get 10 social interactions (100 pts)
- **Community Leader** - Get 100 social interactions (600 pts)
- **Friend Referrer** - Refer 5 friends (800 pts)

#### ⭐ Milestone Badges (4)
- **Getting Started** - Reach level 5 (100 pts)
- **Rising Star** - Reach level 15 (500 pts)
- **Power User** - Reach level 30 (1200 pts)
- **Point Master** - Earn 10,000 total points (2000 pts)

#### ⏰ Time-based Badges (2)
- **Night Owl** - Log activity after 10 PM 10 times (300 pts)
- **Weekend Warrior** - Be active every weekend for 4 weeks (400 pts)

### Badge Rarity Levels

- **Common** (50-250 pts) - Green styling, easy to achieve
- **Rare** (400-1000 pts) - Blue styling, moderate difficulty
- **Epic** (1200-2000 pts) - Purple styling, challenging
- **Legendary** (5000-10000 pts) - Gold styling, extremely difficult

## Points System

### Point Rewards by Action

```typescript
POINT_REWARDS = {
    complete_activity: 10,      // Log any activity
    complete_challenge: 50,     // Complete a challenge
    maintain_streak: 5,         // Daily login streak
    social_interaction: 3,      // Like, comment, share
    achieve_goal: 25,           // Hit daily/weekly goal
    refer_friend: 100,          // Successful referral
    complete_profile: 20,       // Fill out profile
    share_achievement: 15,      // Share on social media
    help_community: 30,         // Help another user
    perfect_week: 100,          // 7 days of goal completion
    level_up: 50               // Bonus for leveling up
}
```

### Integration Example

```typescript
// Award points after completing an activity
const response = await fetch('/api/gamification', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        action: 'complete_activity',
        metadata: {
            activityType: 'Running',
            duration: 30,
            caloriesBurned: 300
        }
    })
});

const result = await response.json();
// result.pointsEarned - Points awarded
// result.newBadges - Any new badges unlocked
// result.leveledUp - Whether user leveled up
```

## Level System

### Level Progression

The system uses exponential XP requirements:

| Level | Points Required | Cumulative Total |
|-------|----------------|------------------|
| 1     | 0              | 0                |
| 2     | 100            | 100              |
| 5     | 800            | 2500             |
| 10    | 2400           | 13000            |
| 15    | 4800           | 32000            |
| 20    | 8000           | 62000            |
| 25    | 12000          | 102000           |
| 30    | 16800          | 152000           |

### Helper Functions

```typescript
// Calculate user's current level from total points
const level = calculateLevel(totalPoints);

// Get detailed progress information
const progress = getLevelProgress(totalPoints);
// Returns: {
//   currentLevel: 5,
//   nextLevel: 6,
//   currentLevelPoints: 800,
//   nextLevelPoints: 1200,
//   pointsToNext: 400,
//   progress: 50 // percentage
// }
```

## Leaderboard System

### API Endpoint

```typescript
GET /api/leaderboard?limit=50

// Returns:
{
    leaderboard: [
        {
            rank: 1,
            name: "John Doe",
            email: "john@example.com",
            points: 15000,
            streak: 45,
            level: 18,
            badges: ["streak_30", "challenge_master", ...]
        },
        // ... more users
    ]
}
```

### Features

- **Top 3 Podium**: Special visual treatment for top 3 users
- **Live Rankings**: Real-time position updates
- **User Stats**: Points, level, streak, badge count
- **Filtering**: All-time, monthly, weekly leaderboards

## UI Components

### Achievement Notifications

Automatic toast notifications for:
- **New Badges**: Show badge name, icon, rarity, points
- **Level Ups**: Celebrate new level achievement
- **Points Earned**: Quick feedback for point gains

### User Stats Widget

Dashboard widget showing:
- Level progress bar with percentage
- Total badges earned
- Current streak
- Completed challenges
- Quick links to achievements and leaderboard

### Achievements Page

Full achievements catalog with:
- Earned badges (color, animated)
- Locked badges (grayscale with progress)
- Category filters
- Progress percentages
- Completion stats

## Database Schema

### User Model Extensions

```typescript
stats: {
    totalPoints: Number,        // Cumulative points
    level: Number,              // Current level
    badges: [String],           // Array of badge IDs
    currentStreak: Number,      // Consecutive days
    completedChallenges: Number // Total challenges
}
```

## Implementation Checklist

- ✅ Badge definitions and constants
- ✅ Level progression system
- ✅ Point reward mappings
- ✅ Badge eligibility checking
- ✅ Award points API endpoint
- ✅ Fetch badges API endpoint
- ✅ Achievements page UI
- ✅ Leaderboard page UI
- ✅ Achievement notifications component
- ✅ User stats widget
- ✅ Integration with activity logging
- ✅ Navigation links in dashboard
- ✅ Real-time progress tracking

## Future Enhancements

### Potential Features
- [ ] Badge collections and sets (earn bonus for complete sets)
- [ ] Seasonal badges (limited-time achievements)
- [ ] Team challenges and group leaderboards
- [ ] Daily/weekly quests for bonus points
- [ ] Achievement sharing to social media
- [ ] Badge trading or gifting
- [ ] Personalized achievement recommendations
- [ ] Push notifications for achievements
- [ ] Achievement milestones with rewards
- [ ] Prestige system (reset level for special badge)

### Analytics Integration
- [ ] Track badge unlock rates
- [ ] Monitor level progression velocity
- [ ] Analyze engagement impact of gamification
- [ ] A/B test point values and thresholds
- [ ] Identify badge bottlenecks
- [ ] User retention correlation with gamification

## Testing

### Manual Testing Checklist

1. **Points Awarding**
   - [ ] Log activity → verify points awarded
   - [ ] Check console logs for confirmation
   - [ ] Verify points reflected in profile

2. **Badge Unlocking**
   - [ ] Complete badge criteria → badge awarded
   - [ ] Notification appears
   - [ ] Badge appears in achievements page
   - [ ] Badge points added to total

3. **Level Progression**
   - [ ] Earn points → level increases
   - [ ] Level-up notification appears
   - [ ] Progress bar updates correctly
   - [ ] Next level threshold accurate

4. **Leaderboard**
   - [ ] Rankings update after point changes
   - [ ] Top 3 podium displays correctly
   - [ ] User stats accurate
   - [ ] Sorting works properly

### Test User Journey

1. New user signs up
2. Completes profile (20 points)
3. Logs first activity (10 points)
4. Maintains 7-day streak (50 points + First Week badge)
5. Reaches level 2 (100 points total)
6. Sees level-up notification
7. Views achievements page
8. Checks leaderboard position
9. Continues engaging to unlock more badges

## API Reference

### Award Points

```typescript
POST /api/gamification
Content-Type: application/json

{
    "action": "complete_activity",
    "metadata": {
        // Optional additional data
    }
}

Response:
{
    "success": true,
    "pointsEarned": 10,
    "newTotalPoints": 110,
    "leveledUp": true,
    "newLevel": 2,
    "oldLevel": 1,
    "newBadges": [
        {
            "id": "first_week",
            "name": "First Week",
            "description": "Maintain a 7-day streak",
            "icon": "🔥",
            "rarity": "common",
            "points": 50
        }
    ]
}
```

### Get User Badges

```typescript
GET /api/gamification

Response:
{
    "success": true,
    "earned": [/* array of badge objects */],
    "available": [
        {
            "badge": {/* badge object */},
            "progress": 50,  // percentage
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

## Troubleshooting

### Points Not Awarding
- Check API route is being called in activity logging
- Verify session is authenticated
- Check console logs for errors
- Ensure MongoDB connection is active

### Badges Not Unlocking
- Verify badge criteria matches user stats
- Check `checkBadgeEligibility()` logic
- Ensure badge IDs are unique
- Check metadata is being passed correctly

### Notifications Not Appearing
- Verify component is imported
- Check notification state management
- Ensure gamification response includes data
- Check z-index and positioning

### Leaderboard Not Updating
- Verify stats are being updated in database
- Check sorting logic in API
- Ensure cache is cleared
- Verify user points are incrementing

## Performance Considerations

- Badge checking happens on point award (not every request)
- Leaderboard queries limited to top 50 users
- Notifications auto-dismiss after 5 seconds
- Stats widget data cached client-side
- Database indexes on `stats.totalPoints` for leaderboard sorting

## Security Notes

- All gamification endpoints require authentication
- Badge awarding is server-side only (no client manipulation)
- Point values are constants (not client-configurable)
- Metadata is sanitized before processing
- Rate limiting recommended for point award endpoint
