"""
Updated Predictor models - now using trained .pkl files
"""

import numpy as np
import joblib
import os
import logging
from typing import Dict, List

logger = logging.getLogger(__name__)

# Load trained models
MODEL_DIR = "./models/saved"

class DropoutPredictor:
    def __init__(self):
        """Load the trained dropout prediction ENSEMBLE model."""
        # Try ensemble model first for best accuracy (93.7%)
        model_path = os.path.join(MODEL_DIR, "dropout_predictor_ENSEMBLE.pkl")
        scaler_path = os.path.join(MODEL_DIR, "scaler_ENSEMBLE.pkl")
        
        if os.path.exists(model_path):
            self.model = joblib.load(model_path)
            self.scaler = joblib.load(scaler_path)
            logger.info(f"✓ Loaded ENSEMBLE dropout predictor (93.7% accuracy)")
            logger.info(f"  Model: {type(self.model).__name__}")
        else:
            # Fallback to basic model
            logger.warning(f"⚠️ Ensemble not found, using basic model")
            model_path = os.path.join(MODEL_DIR, "dropout_predictor.pkl")
            scaler_path = os.path.join(MODEL_DIR, "scaler.pkl")
            if os.path.exists(model_path):
                self.model = joblib.load(model_path)
                self.scaler = joblib.load(scaler_path)
                logger.info(f"✓ Loaded basic dropout predictor")
            else:
                logger.error(f"⚠️ No dropout model found")
                self.model = None
                self.scaler = None
        
        # Load feature names
        feature_names_path = os.path.join(MODEL_DIR, "feature_names.txt")
        if os.path.exists(feature_names_path):
            with open(feature_names_path, 'r') as f:
                self.feature_names = [line.strip() for line in f.readlines()]
        else:
            self.feature_names = [
                'days_active', 'total_days', 'avg_steps_last_7_days',
                'meditation_streak', 'avg_meditation_minutes', 'avg_sleep_hours',
                'challenge_completion_rate', 'total_points_earned',
                'social_engagement_score', 'social_interactions_count',
                'response_rate_to_notifications', 'mood_correlation_with_exercise'
            ]
        
        self.risk_thresholds = {
            "low": 0.3,
            "medium": 0.6,
            "high": 0.8
        }
    
    def predict(
        self, 
        user_id: str, 
        days_active: int, 
        engagement_metrics: Dict
    ) -> Dict:
        """
        Predict dropout probability using trained model.
        """
        try:
            if self.model is None:
                return self._get_fallback_prediction(user_id)
            
            # Prepare features in the correct order
            features = self._create_feature_vector(days_active, engagement_metrics)
            
            # Scale features
            if self.scaler is not None:
                features_scaled = self.scaler.transform([features])
            else:
                features_scaled = [features]
            
            # Get probability from trained model
            dropout_prob = self.model.predict_proba(features_scaled)[0][1]
            
            # Determine risk level
            risk_level = self._get_risk_level(dropout_prob)
            
            # Get interventions
            interventions = self._get_interventions(risk_level, engagement_metrics)
            
            # Estimate days until dropout
            days_until_dropout = self._estimate_days_until_dropout(dropout_prob, days_active)
            
            return {
                "user_id": user_id,
                "dropout_probability": round(float(dropout_prob), 3),
                "risk_level": risk_level,
                "recommended_interventions": interventions,
                "days_until_predicted_dropout": days_until_dropout
            }
            
        except Exception as e:
            logger.error(f"Error in dropout prediction: {str(e)}")
            return self._get_fallback_prediction(user_id)
    
    def _create_feature_vector(self, days_active: int, engagement_metrics: Dict) -> List[float]:
        """Create feature vector in the same order as training."""
        # Calculate derived features
        steps = engagement_metrics.get("steps", 5000)
        social = engagement_metrics.get("social", 0.5)
        notification_response = engagement_metrics.get("notification_response", 0.5)
        
        # Estimate other features (in production, these would come from user profile)
        total_days = max(days_active, 1)
        meditation_streak = int(days_active * 0.3)  # Rough estimate
        avg_meditation = min(10, days_active * 0.5)
        avg_sleep = 7.0
        completion_rate = max(0.3, min(0.9, social))
        total_points = int(days_active * 50)
        social_interactions = int(social * 100)
        
        features = [
            days_active,
            total_days,
            steps,
            meditation_streak,
            avg_meditation,
            avg_sleep,
            completion_rate,
            total_points,
            social,
            social_interactions,
            notification_response,
            0.5  # mood correlation
        ]
        
        return features
    
    def _get_risk_level(self, probability: float) -> str:
        """Classify risk level based on probability."""
        if probability >= self.risk_thresholds["high"]:
            return "high"
        elif probability >= self.risk_thresholds["medium"]:
            return "medium"
        else:
            return "low"
    
    def _get_interventions(self, risk_level: str, metrics: Dict) -> List[str]:
        """Recommend interventions based on risk level."""
        interventions = []
        
        if risk_level == "high":
            interventions.extend([
                "Send personalized encouragement message immediately",
                "Offer easier challenges to rebuild confidence",
                "Enable social support features",
                "Schedule check-in notification"
            ])
        elif risk_level == "medium":
            interventions.extend([
                "Adjust challenge difficulty",
                "Send motivational content",
                "Highlight recent achievements"
            ])
        else:
            interventions.append("Continue regular engagement pattern")
        
        # Add specific interventions based on metrics
        if metrics.get("steps", 5000) < 3000:
            interventions.append("Suggest shorter, more achievable exercise goals")
        
        if metrics.get("social", 0.5) < 0.3:
            interventions.append("Introduce to community features")
        
        if metrics.get("notification_response", 0.5) < 0.3:
            interventions.append("Optimize notification timing and content")
        
        return interventions
    
    def _estimate_days_until_dropout(self, probability: float, days_active: int) -> int:
        """Estimate days until user might drop out."""
        if probability > 0.8:
            return min(3, days_active // 2)
        elif probability > 0.6:
            return min(7, days_active)
        else:
            return 14
    
    def _get_fallback_prediction(self, user_id: str) -> Dict:
        """Fallback prediction if trained model fails."""
        return {
            "user_id": user_id,
            "dropout_probability": 0.5,
            "risk_level": "medium",
            "recommended_interventions": ["Monitor engagement closely"],
            "days_until_predicted_dropout": 7
        }


class StreakPredictor:
    def __init__(self):
        """Load the trained streak prediction model."""
        model_path = os.path.join(MODEL_DIR, "streak_predictor.pkl")
        scaler_path = os.path.join(MODEL_DIR, "scaler.pkl")
        
        if os.path.exists(model_path):
            self.model = joblib.load(model_path)
            self.scaler = joblib.load(scaler_path)
            logger.info(f"✓ Loaded trained streak predictor from {model_path}")
        else:
            logger.warning(f"⚠️ Trained model not found, using fallback")
            self.model = None
            self.scaler = None
    
    def predict(
        self, 
        user_id: str, 
        current_streak: int, 
        completion_rate: float, 
        recent_activity: float
    ) -> Dict:
        """
        Predict likelihood of streak breaking using trained model.
        """
        try:
            if self.model is None:
                return self._get_fallback_prediction(user_id, current_streak)
            
            # Create feature vector
            features = self._create_feature_vector(current_streak, completion_rate, recent_activity)
            
            # Scale features
            if self.scaler is not None:
                features_scaled = self.scaler.transform([features])
            else:
                features_scaled = [features]
            
            # Get probability of streak breaking
            break_prob = self.model.predict_proba(features_scaled)[0][1]
            
            # Get recommendations
            actions = self._get_streak_actions(break_prob, current_streak)
            
            return {
                "user_id": user_id,
                "streak_break_probability": round(float(break_prob), 3),
                "current_streak": current_streak,
                "recommended_actions": actions
            }
            
        except Exception as e:
            logger.error(f"Error in streak prediction: {str(e)}")
            return self._get_fallback_prediction(user_id, current_streak)
    
    def _create_feature_vector(self, current_streak: int, completion_rate: float, recent_activity: float) -> List[float]:
        """Create feature vector from streak data."""
        # Estimate full feature set
        days_active = max(current_streak, 7)
        total_days = days_active + 5
        meditation_streak = current_streak
        avg_meditation = current_streak * 0.5
        avg_sleep = 7.0
        total_points = int(current_streak * 50)
        social_score = completion_rate
        social_interactions = int(social_score * 100)
        notification_response = completion_rate
        
        features = [
            days_active,
            total_days,
            recent_activity,
            meditation_streak,
            avg_meditation,
            avg_sleep,
            completion_rate,
            total_points,
            social_score,
            social_interactions,
            notification_response,
            0.5
        ]
        
        return features
    
    def _get_streak_actions(self, probability: float, streak: int) -> List[str]:
        """Get recommended actions to maintain streak."""
        actions = []
        
        if probability > 0.6:
            actions.extend([
                "Send streak reminder notification",
                f"Celebrate your {streak}-day streak!",
                "Offer streak insurance reward",
                "Suggest easier activity to maintain momentum"
            ])
        elif probability > 0.3:
            actions.extend([
                "Gentle reminder about your streak",
                "Share tips from similar users who maintained long streaks"
            ])
        else:
            actions.append(f"Keep up the great work on your {streak}-day streak!")
        
        # Special milestones
        if streak in [7, 30, 60, 90, 100]:
            actions.append(f"🎉 Milestone alert: {streak} days! Share your achievement!")
        
        return actions
    
    def _get_fallback_prediction(self, user_id: str, streak: int) -> Dict:
        """Fallback when model unavailable."""
        return {
            "user_id": user_id,
            "streak_break_probability": 0.3,
            "current_streak": streak,
            "recommended_actions": [f"Keep your {streak}-day streak alive!"]
        }
