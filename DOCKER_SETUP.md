# Health Motivation Platform - Docker Setup

## 🚀 Quick Start with Docker

### Prerequisites
- Docker Desktop installed
- Docker Compose installed

### Start All Services
```bash
# Start both ML service and frontend
docker-compose up

# Or run in detached mode
docker-compose up -d
```

### Access Services
- **Frontend**: http://localhost:3000
- **ML API**: http://localhost:8000
- **ML API Docs**: http://localhost:8000/docs

### Stop Services
```bash
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

### Development Mode
```bash
# Rebuild containers after code changes
docker-compose up --build

# View logs
docker-compose logs -f ml-service
docker-compose logs -f frontend
```

### Test ML Service
```bash
# Health check
curl http://localhost:8000/health

# Test dropout prediction
curl -X POST http://localhost:8000/api/predict-dropout \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test123",
    "days_active": 5,
    "avg_steps_last_7_days": 3000,
    "meditation_streak": 2,
    "challenge_completion_rate": 0.4,
    "social_engagement_score": 0.3,
    "preferred_activity_times": ["morning"],
    "response_rate_to_notifications": 0.5
  }'
```

## 📝 Notes
- ML models are automatically loaded from `ml-service/models/saved/`
- Frontend connects to ML service via `NEXT_PUBLIC_ML_API_URL`
- Volumes are mounted for hot reload during development
