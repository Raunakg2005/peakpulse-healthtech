# 🏗️ PeakPulse Architecture Documentation

## System Overview

PeakPulse is built using a modern microservices architecture with a clear separation between frontend, backend, and ML services.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │        Next.js 16 Frontend (TypeScript)              │   │
│  │  • Server Components    • API Routes                 │   │
│  │  • Client Components    • App Router                 │   │
│  │  • NextAuth.js          • Tailwind CSS              │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  APPLICATION LAYER                           │
│  ┌────────────────────┐        ┌─────────────────────────┐  │
│  │   Next.js API      │        │    FastAPI ML Service   │  │
│  │   • Auth           │        │    • Predictions        │  │
│  │   • User           │   →    │    • Training           │  │
│  │   • Activities     │        │    • Quantum Models     │  │
│  │   • Gamification   │        │    • Classical ML       │  │
│  └────────────────────┘        └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   DATA LAYER                                 │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              MongoDB Database                         │   │
│  │  • Users Collection      • Activities Collection      │   │
│  │  • Challenges Collection • Social Posts Collection    │   │
│  │  • User Challenges       • Leaderboard Cache         │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Component Architecture

### Frontend Architecture (Next.js)

```
app/
├── (auth)/                    # Authentication routes (public)
│   ├── signin/                # Login page
│   ├── signup/                # Registration page
│   └── onboarding/            # User onboarding flow
│
├── (dashboard)/               # Protected routes
│   ├── layout.tsx             # Dashboard shell with sidebar
│   ├── dashboard/             # Main dashboard
│   ├── achievements/          # Badge collection
│   ├── leaderboard/           # Global rankings
│   └── profile/               # User profile
│
├── api/                       # Backend API routes
│   ├── auth/[...nextauth]/    # NextAuth endpoints
│   ├── user/profile/          # User CRUD
│   ├── calories/              # Activity tracking
│   ├── gamification/          # Points & badges
│   └── leaderboard/           # Rankings
│
└── page.tsx                   # Landing page

components/
├── landing/                   # Marketing components
├── ml/                        # ML visualization
├── AchievementNotification.tsx
├── CalorieTracker.tsx
└── UserStatsWidget.tsx

lib/
├── api.ts                     # API client
├── gamification.ts            # Game constants
├── mongodb.ts                 # DB connection
└── ml-client.ts               # ML service client

models/
├── User.ts                    # User schema
├── Activity.ts                # Activity schema
├── Challenge.ts               # Challenge schema
└── SocialPost.ts              # Social schema
```

### ML Service Architecture (FastAPI)

```
ml-service/
├── app/
│   ├── main.py                # FastAPI application
│   ├── models/
│   │   ├── dropout_predictor.py
│   │   ├── engagement_classifier.py
│   │   ├── difficulty_predictor.py
│   │   ├── tone_selector.py
│   │   ├── streak_predictor.py
│   │   ├── recommender.py
│   │   └── activity_analyzer.py
│   └── quantum/
│       ├── hybrid_model.py    # Quantum+Classical
│       └── quantum_circuit.py # Qiskit circuits
│
├── training/
│   ├── train_models.py        # Main training script
│   ├── data_preprocessing.py  # Feature engineering
│   └── train_*.py             # Individual model training
│
├── data/
│   ├── users.csv
│   ├── activities.csv
│   ├── challenges.csv
│   └── processed/
│
└── models/
    └── saved/                 # Trained model files
        ├── dropout_model.pkl
        ├── quantum_params.pkl
        └── ...
```

## Data Flow Diagrams

### User Activity Logging Flow

```
1. User logs activity
   ↓
2. Frontend: CalorieTracker component
   ↓
3. POST /api/calories/activity
   ↓
4. Calculate calories (MET formula)
   ↓
5. Save to MongoDB (Activity collection)
   ↓
6. POST /api/gamification (award points)
   ↓
7. Check badge eligibility
   ↓
8. Update user stats (points, level, badges)
   ↓
9. Return achievements
   ↓
10. Display notifications
```

### ML Prediction Flow

```
1. Dashboard loads
   ↓
2. Fetch user data from MongoDB
   ↓
3. GET /api/ml/predict-dropout
   ↓
4. ML Service processes request
   ↓
5. Extract features
   ↓
6. Quantum circuit encoding
   ↓
7. Classical ML prediction
   ↓
8. Hybrid ensemble (weighted average)
   ↓
9. Return prediction + confidence
   ↓
10. Display quantum insights card
```

### Gamification Flow

```
User Action → Award Points → Check Badges
                ↓               ↓
         Update Level    Check Eligibility
                ↓               ↓
         Calculate XP    Award New Badges
                ↓               ↓
         Level Up?       Update Badge List
                ↓               ↓
         Notify User     Notify User
```

## Database Schema

### Users Collection

```typescript
{
  _id: ObjectId,
  name: string,
  email: string,
  image: string,
  profile: {
    age: number,
    gender: 'male' | 'female' | 'other',
    height: number,
    heightUnit: 'cm' | 'ft',
    weight: number,
    weightUnit: 'kg' | 'lbs',
    activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active',
    primaryGoal: 'weight_loss' | 'maintenance' | 'weight_gain' | 'fitness'
  },
  stats: {
    totalPoints: number,
    level: number,
    currentStreak: number,
    longestStreak: number,
    completedChallenges: number,
    badges: string[]  // Array of badge IDs
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Activities Collection

```typescript
{
  _id: ObjectId,
  userId: string,
  type: string,  // 'Running', 'Cycling', etc.
  duration: number,  // minutes
  intensity: 'light' | 'moderate' | 'vigorous',
  caloriesBurned: number,
  met: number,  // Metabolic equivalent
  timestamp: Date,
  completed: boolean
}
```

### Challenges Collection

```typescript
{
  _id: ObjectId,
  title: string,
  description: string,
  type: string,
  difficulty: 'easy' | 'medium' | 'hard',
  points: number,
  duration: number,  // days
  goal: {
    type: string,
    target: number
  },
  createdAt: Date
}
```

## API Endpoints

### Authentication
- `GET /api/auth/signin` - Sign in page
- `POST /api/auth/callback/google` - Google OAuth callback
- `GET /api/auth/signout` - Sign out

### User Management
- `GET /api/user/profile` - Get user profile
- `PATCH /api/user/profile` - Update profile
- `POST /api/user/onboarding` - Complete onboarding

### Activity Tracking
- `GET /api/calories` - Get calorie data
- `POST /api/calories/activity` - Log activity
- `GET /api/activities` - List activities

### Gamification
- `POST /api/gamification` - Award points
- `GET /api/gamification` - Get badges & progress
- `GET /api/leaderboard` - Get rankings

### ML Predictions
- `POST /api/ml/predict-dropout` - Dropout risk
- `POST /api/ml/predict-engagement` - Engagement level
- `POST /api/ml/recommend` - Activity recommendations

## Security Architecture

### Authentication
- **NextAuth.js** for session management
- **Google OAuth 2.0** for social login
- **JWT tokens** for API authentication
- **HTTP-only cookies** for session storage

### Authorization
- Server-side session validation
- Protected API routes with `getServerSession()`
- Role-based access control (future)

### Data Protection
- MongoDB connection with TLS
- Environment variables for secrets
- Input validation and sanitization
- XSS protection via React
- CSRF protection via NextAuth

## Scalability Considerations

### Current Architecture
- Single Next.js instance
- Single FastAPI instance
- Single MongoDB instance

### Scaling Strategy

**Horizontal Scaling:**
- Load balancer for Next.js instances
- ML service replicas behind load balancer
- MongoDB replica set for read scaling

**Caching:**
- Redis for leaderboard caching
- API response caching
- Static asset CDN

**Database Optimization:**
- Indexes on frequently queried fields
- Aggregation pipeline optimization
- Connection pooling

## Deployment Architecture

### Development
```
Local Machine
├── Next.js (localhost:3000)
├── FastAPI (localhost:8000)
└── MongoDB (localhost:27017)
```

### Production (Recommended)
```
Vercel (Next.js) → MongoDB Atlas
       ↓
AWS/GCP (FastAPI ML Service)
```

## Technology Decisions

### Why Next.js?
- Server-side rendering for SEO
- API routes for backend logic
- File-based routing
- Built-in optimization

### Why FastAPI?
- High performance (async/await)
- Automatic API documentation
- Type validation with Pydantic
- Python ML ecosystem

### Why MongoDB?
- Flexible schema for evolving features
- JSON-like documents
- Horizontal scalability
- Rich query language

### Why Qiskit?
- Industry-standard quantum framework
- IBM Quantum access
- Extensive documentation
- Active community

## Performance Metrics

### Target Performance
- Page load: < 2s
- API response: < 200ms
- ML prediction: < 500ms
- Database query: < 100ms

### Optimization Techniques
- Code splitting
- Image optimization
- API response caching
- Database indexing
- Lazy loading components

## Monitoring & Logging

### Frontend
- Console logs for debugging
- Error boundary components
- Performance monitoring (Web Vitals)

### Backend
- FastAPI request logging
- ML model performance tracking
- Database query logging

### Production (Future)
- Error tracking (Sentry)
- Performance monitoring (New Relic)
- Log aggregation (ELK stack)
- Uptime monitoring

## Future Architecture Enhancements

1. **Microservices Split**
   - Separate auth service
   - Separate notification service
   - Message queue (RabbitMQ)

2. **Real-time Features**
   - WebSocket for live updates
   - Redis pub/sub
   - Server-sent events

3. **Advanced ML**
   - Model versioning (MLflow)
   - A/B testing framework
   - Real quantum hardware

4. **Mobile Support**
   - React Native app
   - Shared API layer
   - Push notifications
