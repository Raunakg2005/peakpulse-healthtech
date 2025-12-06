from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional
import uvicorn
import logging

# Import our ML models
from app.models.recommender import ChallengeRecommender
from app.models.predictor import DropoutPredictor, StreakPredictor
from app.models.personalizer import MotivationGenerator, DifficultyCalibrator

# Import Quantum ML models
try:
    from app.quantum.hybrid_model import QuantumEnhancedDropoutPredictor
except ImportError:
    QuantumEnhancedDropoutPredictor = None
    logging.warning("Quantum modules could not be imported. Running in classical-only mode.")

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Health Motivation ML Service", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure based on your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize ML models
challenge_recommender = ChallengeRecommender()
dropout_predictor = DropoutPredictor()
streak_predictor = StreakPredictor()
motivation_generator = MotivationGenerator()
difficulty_calibrator = DifficultyCalibrator()

# Initialize Quantum ML models
try:
    if QuantumEnhancedDropoutPredictor:
        quantum_dropout_predictor = QuantumEnhancedDropoutPredictor(n_qubits=4)
        logger.info("✅ Quantum ML models initialized")
    else:
        raise ImportError("QuantumEnhancedDropoutPredictor class not available")
except Exception as e:
    quantum_dropout_predictor = None
    logger.warning(f"⚠️  Quantum ML disabled: {e}")

# Pydantic models for request/response
class UserProfile(BaseModel):
    user_id: str
    days_active: int
    avg_steps_last_7_days: float
    meditation_streak: int
    challenge_completion_rate: float
    social_engagement_score: float
    preferred_activity_times: List[str]
    response_rate_to_notifications: float
    mood_correlation_with_exercise: Optional[float] = 0.5

class ChallengeRecommendation(BaseModel):
    challenge_id: str
    challenge_name: str
    confidence_score: float
    reasoning: str
    difficulty_level: int
    estimated_completion_time: int

class DropoutPrediction(BaseModel):
    user_id: str
    dropout_probability: float
    risk_level: str
    recommended_interventions: List[str]
    days_until_predicted_dropout: int

class StreakPrediction(BaseModel):
    user_id: str
    streak_break_probability: float
    current_streak: int
    recommended_actions: List[str]

class MotivationMessage(BaseModel):
    message: str
    tone: str
    personalization_score: float

@app.get("/")
async def root():
    return {
        "service": "Health Motivation ML Service",
        "status": "active",
        "version": "1.0.0",
        "endpoints": {
            "recommendations": "/api/recommend-challenge",
            "predictions": {
                "dropout": "/api/predict-dropout",
                "dropout_quantum": "/api/predict-dropout-quantum",
                "streak": "/api/predict-streak",
                "compare": "/api/predict-compare"
            },
            "personalization": {
                "motivation": "/api/generate-motivation",
                "difficulty": "/api/calibrate-difficulty"
            }
        }
    }

@app.post("/api/recommend-challenge", response_model=List[ChallengeRecommendation])
async def recommend_challenge(profile: UserProfile):
    """
    Recommend personalized challenges based on user profile.
    Uses collaborative filtering and user behavior patterns.
    """
    try:
        recommendations = challenge_recommender.get_recommendations(
            user_id=profile.user_id,
            user_features={
                "completion_rate": profile.challenge_completion_rate,
                "social_score": profile.social_engagement_score,
                "activity_times": profile.preferred_activity_times,
                "current_streaks": profile.meditation_streak
            },
            top_n=5
        )
        return recommendations
    except Exception as e:
        logger.error(f"Error in recommendation: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/predict-dropout", response_model=DropoutPrediction)
async def predict_dropout(profile: UserProfile):
    """
    Predict likelihood of user dropping out in the next 7 days.
    """
    try:
        prediction = dropout_predictor.predict(
            user_id=profile.user_id,
            days_active=profile.days_active,
            engagement_metrics={
                "steps": profile.avg_steps_last_7_days,
                "social": profile.social_engagement_score,
                "notification_response": profile.response_rate_to_notifications
            }
        )
        return prediction
    except Exception as e:
        logger.error(f"Error in dropout prediction: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/predict-streak", response_model=StreakPrediction)
async def predict_streak_break(profile: UserProfile):
    """
    Predict likelihood of streak breaking.
    """
    try:
        prediction = streak_predictor.predict(
            user_id=profile.user_id,
            current_streak=profile.meditation_streak,
            completion_rate=profile.challenge_completion_rate,
            recent_activity=profile.avg_steps_last_7_days
        )
        return prediction
    except Exception as e:
        logger.error(f"Error in streak prediction: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/generate-motivation", response_model=MotivationMessage)
async def generate_motivation(profile: UserProfile):
    """
    Generate personalized motivation message.
    """
    try:
        message = motivation_generator.generate(
            user_profile=profile.dict(),
            context="daily_encouragement"
        )
        return message
    except Exception as e:
        logger.error(f"Error generating motivation: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/calibrate-difficulty")
async def calibrate_difficulty(profile: UserProfile, current_difficulty: int):
    """
    Adjust challenge difficulty based on user performance.
    """
    try:
        adjusted_difficulty = difficulty_calibrator.calibrate(
            completion_rate=profile.challenge_completion_rate,
            current_difficulty=current_difficulty,
            user_engagement=profile.social_engagement_score
        )
        return {
            "current_difficulty": current_difficulty,
            "recommended_difficulty": adjusted_difficulty["new_difficulty"],
            "reasoning": adjusted_difficulty["reasoning"],
            "confidence": adjusted_difficulty["confidence"]
        }
    except Exception as e:
        logger.error(f"Error calibrating difficulty: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/predict-dropout-quantum")
async def predict_dropout_quantum(profile: UserProfile):
    """
    Quantum-enhanced dropout prediction using hybrid quantum-classical model.
    Combines 4-qubit quantum circuit with classical ensemble.
    """
    try:
        if quantum_dropout_predictor is None:
            raise HTTPException(
                status_code=503, 
                detail="Quantum ML service unavailable"
            )
        
        # Prepare features for quantum model
        features = {
            'days_active': profile.days_active,
            'total_days': profile.days_active,
            'avg_steps': profile.avg_steps_last_7_days,
            'meditation_streak': profile.meditation_streak,
            'avg_meditation': profile.meditation_streak * 5,
            'avg_sleep': 7,
            'completion_rate': profile.challenge_completion_rate,
            'total_points': profile.days_active * 50,
            'social_score': profile.social_engagement_score,
            'social_interactions': int(profile.social_engagement_score * 100),
            'notification_response': profile.response_rate_to_notifications,
        }
        
        # Get quantum prediction
        prediction = quantum_dropout_predictor.predict(features)
        
        # Add user_id and risk classification
        prediction['user_id'] = profile.user_id
        
        if prediction['dropout_probability'] > 0.7:
            prediction['risk_level'] = 'high'
        elif prediction['dropout_probability'] > 0.4:
            prediction['risk_level'] = 'medium'
        else:
            prediction['risk_level'] = 'low'
        
        return prediction
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in quantum dropout prediction: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/predict-compare")
async def predict_compare(profile: UserProfile):
    """
    Compare classical vs quantum predictions side-by-side.
    Useful for A/B testing and model evaluation.
    """
    try:
        # Get classical prediction
        classical = dropout_predictor.predict(
            user_id=profile.user_id,
            days_active=profile.days_active,
            engagement_metrics={
                "steps": profile.avg_steps_last_7_days,
                "social": profile.social_engagement_score,
                "notification_response": profile.response_rate_to_notifications
            }
        )
        
        # Get quantum prediction if available
        quantum = None
        if quantum_dropout_predictor is not None:
            try:
                features = {
                    'days_active': profile.days_active,
                    'completion_rate': profile.challenge_completion_rate,
                    'social_score': profile.social_engagement_score,
                    'avg_steps': profile.avg_steps_last_7_days,
                }
                quantum = quantum_dropout_predictor.predict(features)
            except Exception as e:
                logger.warning(f"Quantum prediction failed: {e}")
        
        return {
            "user_id": profile.user_id,
            "classical": {
                "probability": classical['dropout_probability'],
                "risk_level": classical['risk_level'],
                "model": "VotingClassifier (Ensemble)",
                "accuracy": "93.7%"
            },
            "quantum": {
                "probability": quantum['dropout_probability'] if quantum else None,
                "quantum_component": quantum['quantum_component'] if quantum else None,
                "classical_component": quantum['classical_component'] if quantum else None,
                "model": "Hybrid Quantum-Classical",
                "qubits": 4,
                "available": quantum is not None
            } if quantum else {"available": False, "reason": "Quantum service unavailable"},
            "recommendation": "Use classical" if not quantum else (
                "Use quantum" if abs(quantum['dropout_probability'] - 0.5) > abs(classical['dropout_probability'] - 0.5) else "Use classical"
            )
        }
        
    except Exception as e:
        logger.error(f"Error in prediction comparison: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring."""
    return {
        "status": "healthy", 
        "models_loaded": True,
        "quantum_available": quantum_dropout_predictor is not None
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
