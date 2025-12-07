# Friend System Implementation

## Overview
A comprehensive friend system has been implemented that allows users to:
- Search for other users
- Send friend requests
- Accept/reject friend requests
- View friends with their stats (streak, points, level)
- Remove friends

## Components Created

### 1. Database Model
**File:** `models/Friend.ts`
- Stores friend relationships between users
- Tracks friendship status: `pending`, `accepted`, `rejected`, `blocked`
- Includes who requested the friendship
- Has compound indexes for efficient queries

### 2. API Routes

#### `/api/friends` (GET, POST)
- **GET**: Fetch friends and pending requests
  - Query params: `type=friends|pending|sent|all`
  - Returns formatted friendships with populated user data
- **POST**: Send friend request
  - Body: `{ friendId: string }`
  - Validates: no self-friending, no duplicate requests

#### `/api/friends/[id]` (PATCH, DELETE)
- **PATCH**: Accept or reject friend request
  - Body: `{ action: 'accept' | 'reject' }`
  - Only recipient can accept/reject
- **DELETE**: Remove friend or cancel request
  - Both parties can remove friendship

#### `/api/users/search` (GET)
- Search users by name or email
- Query params: `q=search_term&limit=20`
- Returns users with their friendship status relative to current user

### 3. Friends Page
**File:** `app/(dashboard)/dashboard/friends/page.tsx`

Features three tabs:
1. **My Friends**: Shows accepted friends with stats
2. **Requests**: Shows received and sent pending requests
3. **Find Friends**: Search interface to find and add users

#### Key Features:
- Real-time search with debouncing (500ms)
- Beautiful gradient UI matching app design
- Shows friend stats: streak 🔥, points 🏆, level 📈
- Loading states and error handling
- Responsive design

### 4. Navigation
Updated `app/(dashboard)/layout.tsx` to include Friends link in sidebar with UserPlus icon

## User Flow

### Adding a Friend
1. User navigates to Friends page
2. Clicks "Find Friends" tab
3. Searches for user by name or email
4. Clicks "Add Friend" button
5. Request is sent and button shows "Pending"

### Receiving a Friend Request
1. User sees notification badge on "Requests" tab
2. Clicks "Requests" tab
3. Views pending request with user info
4. Clicks ✓ to accept or ✗ to reject
5. Accepted friends appear in "My Friends" tab

### Viewing Friends
1. User navigates to "My Friends" tab
2. Sees all accepted friends
3. Views each friend's:
   - Avatar
   - Name and email
   - Current streak (days)
   - Total points
   - Level
4. Can remove friend with trash icon

## Database Schema

```typescript
interface IFriend {
    _id: ObjectId;
    userId: ObjectId;        // One user in the relationship
    friendId: ObjectId;      // Other user in the relationship
    status: 'pending' | 'accepted' | 'rejected' | 'blocked';
    requestedBy: ObjectId;   // Who initiated the request
    createdAt: Date;
    updatedAt: Date;
}
```

## API Response Formats

### GET /api/friends
```json
{
    "success": true,
    "friendships": [
        {
            "_id": "...",
            "friend": {
                "_id": "...",
                "name": "John Doe",
                "email": "john@example.com",
                "avatar": "boy_1",
                "stats": {
                    "totalPoints": 1250,
                    "currentStreak": 7,
                    "level": 5
                }
            },
            "status": "accepted",
            "requestedBy": {...},
            "isSender": true,
            "createdAt": "2024-01-01T00:00:00.000Z"
        }
    ]
}
```

### GET /api/users/search
```json
{
    "success": true,
    "users": [
        {
            "_id": "...",
            "name": "Jane Smith",
            "email": "jane@example.com",
            "avatar": "girl_1",
            "stats": {
                "totalPoints": 890,
                "currentStreak": 3,
                "level": 4
            },
            "friendshipStatus": {
                "status": "pending",
                "friendshipId": "...",
                "isSender": true
            }
        }
    ]
}
```

## Security Considerations

1. **Authentication**: All routes require valid session
2. **Authorization**: Users can only:
   - Accept/reject requests sent to them
   - Remove their own friendships
   - View their own friend data
3. **Validation**:
   - Cannot add yourself as friend
   - Cannot send duplicate requests
   - Proper error messages for all edge cases

## UI/UX Features

- **Gradient Headers**: Purple-pink-rose gradient matching app theme
- **Hover Effects**: Cards scale and show glow effects
- **Loading States**: Spinners for all async operations
- **Empty States**: Helpful messages when no data
- **Badge Notifications**: Shows count of pending requests
- **Responsive Design**: Works on mobile and desktop
- **Search Debouncing**: Reduces API calls during typing
- **Optimistic Updates**: UI updates immediately on actions

## Future Enhancements

Potential additions:
1. Friend activity feed
2. Private messaging between friends
3. Friend challenges
4. Friend leaderboards
5. Mutual friend suggestions
6. Friend groups/circles
7. Block/unblock functionality
8. Friend request notifications
