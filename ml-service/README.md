# ML Service - Health Motivation Platform

Python-based machine learning microservice for personalized health recommendations and predictions.

## Features

- **Challenge Recommender**: Personalized challenge suggestions using collaborative filtering
- **Dropout Prediction**: Identify users at risk of disengagement
- **Streak Prediction**: Predict and prevent streak breaks
- **Motivation Generator**: AI-powered personalized encouragement messages
- **Difficulty Calibrator**: Dynamic challenge difficulty adjustment
- **Quantum ML**: Optional quantum computing-enhanced recommendations

## Setup

### Install Dependencies

```bash
cd ml-service
pip install -r requirements.txt
```

### Generate Mock Dataset

```bash
python data/data_generator.py
```

### Run ML Service

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## API Endpoints

### Recommendations
- `POST /api/recommend-challenge` - Get personalized challenge recommendations
- `GET /api/quantum/info` - Check quantum ML availability

### Predictions
- `POST /api/predict-dropout` - Predict user dropout risk
- `POST /api/predict-streak` - Predict streak break probability

### Personalization
- `POST /api/generate-motivation` - Generate personalized motivation message
- `POST /api/calibrate-difficulty` - Adjust challenge difficulty

### Health Check
- `GET /` - Service information
- `GET /health` - Health check

## Example Usage

```python
import requests

# Recommend challenges
response = requests.post("http://localhost:8000/api/recommend-challenge", json={
    "user_id": "user_0001",
    "days_active": 30,
    "avg_steps_last_7_days": 8500,
    "meditation_streak": 10,
    "challenge_completion_rate": 0.75,
    "social_engagement_score": 0.6,
    "preferred_activity_times": ["morning", "evening"],
    "response_rate_to_notifications": 0.8,
    "mood_correlation_with_exercise": 0.7
})

recommendations = response.json()
```

## Dataset Structure

Generated datasets include:
- `users.csv` - User profiles
- `activities.csv` - Daily activity logs
- `challenges.csv` - Challenge participation
- `social.csv` - Social interactions
- `features.csv` - ML-ready feature matrix

## Quantum ML

Requires PennyLane:
```bash
pip install pennylane pennylane-qiskit
```

Uses quantum circuits for:
- Enhanced recommendation scoring
- Pattern recognition in user behavior
- High-dimensional feature mapping
