"""
Challenge Recommendation System
Uses collaborative filtering and content-based filtering to recommend personalized challenges.
"""

import numpy as np
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
from typing import List, Dict
import logging
import joblib
import os

logger = logging.getLogger(__name__)

class ChallengeRecommender:
    def __init__(self):
        """Initialize the recommender with trained ML model."""
        # Load trained model
        model_path = "./models/saved/challenge_recommender.pkl"
        features_path = "./models/saved/recommender_features.txt"
        metadata_path = "./models/saved/challenge_metadata.csv"
        
        if os.path.exists(model_path):
            self.model = joblib.load(model_path)
            logger.info(f"✓ Loaded trained recommender from {model_path}")
            
            # Load feature names
            with open(features_path, 'r') as f:
                self.feature_names = [line.strip() for line in f.readlines()]
            
            # Load challenge metadata
            self.challenges = pd.read_csv(metadata_path)
            logger.info(f"✓ Loaded {len(self.challenges)} challenge templates")
        else:
            logger.warning(f"⚠️  Trained model not found, using fallback")
            self.model = None
            self.challenges = self._load_challenges()  # Use mock data
            self.feature_names = []
        
        # Keep this for fallback
        self.user_challenge_matrix = self._create_user_challenge_matrix()
        
    def _load_challenges(self) -> pd.DataFrame:
        """Load or create challenge database."""
        challenges_data = [
            {
                "challenge_id": "C001",
                "name": "Morning Meditation Master",
                "category": "meditation",
                "difficulty": 2,
                "duration_minutes": 10,
                "points": 50,
                "best_time": "morning",
                "social_component": False
            },
            {
                "challenge_id": "C002",
                "name": "10K Steps Challenge",
                "category": "exercise",
                "difficulty": 3,
                "duration_minutes": 60,
                "points": 100,
                "best_time": "any",
                "social_component": True
            },
            {
                "challenge_id": "C003",
                "name": "Hydration Hero",
                "category": "water",
                "difficulty": 1,
                "duration_minutes": 1440,  # All day
                "points": 30,
                "best_time": "any",
                "social_component": False
            },
            {
                "challenge_id": "C004",
                "name": "Evening Yoga Flow",
                "category": "exercise",
                "difficulty": 2,
                "duration_minutes": 20,
                "points": 60,
                "best_time": "evening",
                "social_component": True
            },
            {
                "challenge_id": "C005",
                "name": "Mindful Eating Week",
                "category": "meals",
                "difficulty": 4,
                "duration_minutes": 10080,  # 7 days
                "points": 200,
                "best_time": "any",
                "social_component": True
            },
            {
                "challenge_id": "C006",
                "name": "Sleep Sanctuary",
                "category": "sleep",
                "difficulty": 3,
                "duration_minutes": 480,  # 8 hours
                "points": 80,
                "best_time": "evening",
                "social_component": False
            },
            {
                "challenge_id": "C007",
                "name": "7-Day Exercise Streak",
                "category": "exercise",
                "difficulty": 5,
                "duration_minutes": 300,
                "points": 300,
                "best_time": "any",
                "social_component": True
            },
            {
                "challenge_id": "C008",
                "name": "Breathwork Beginner",
                "category": "meditation",
                "difficulty": 1,
                "duration_minutes": 5,
                "points": 25,
                "best_time": "morning",
                "social_component": False
            },
        ]
        
        return pd.DataFrame(challenges_data)
    
    def _create_user_challenge_matrix(self) -> np.ndarray:
        """Create a mock user-challenge interaction matrix for collaborative filtering."""
        # Simulated user-challenge completion matrix (10 users x 8 challenges)
        # 1 = completed, 0 = not attempted, 0.5 = attempted but not completed
        matrix = np.array([
            [1, 1, 1, 0.5, 0, 1, 0, 1],
            [1, 0.5, 1, 1, 0, 0, 0, 1],
            [0, 1, 1, 1, 0.5, 0, 1, 0],
            [1, 1, 0.5, 0, 1, 1, 0, 1],
            [0.5, 0, 1, 1, 1, 0.5, 0, 0],
            [1, 1, 1, 1, 0.5, 1, 1, 1],
            [0, 1, 1, 0, 0, 0, 0, 1],
            [1, 0.5, 1, 1, 1, 0, 0.5, 1],
            [0, 1, 0.5, 1, 0, 1, 1, 0],
            [1, 1, 1, 0.5, 1, 1, 0, 1],
        ])
        return matrix
    
    def get_recommendations(
        self, 
        user_id: str, 
        user_features: Dict, 
        top_n: int = 5
    ) -> List[Dict]:
        """
        Get personalized challenge recommendations using trained ML model.
        
        Args:
            user_id: User identifier
            user_features: Dictionary with user characteristics
            top_n: Number of recommendations to return
            
        Returns:
            List of recommended challenges with confidence scores
        """
        try:
            if self.model is None:
                # Fallback to rule-based
                return self._get_fallback_recommendations(user_features, top_n)
            
            # Calculate ML scores for each challenge
            scores = []
            
            for _, challenge in self.challenges.iterrows():
                # Prepare feature vector
                feature_vector = self._create_feature_vector(user_features, challenge)
                
                # Get ML prediction probability
                confidence = self.model.predict_proba([feature_vector])[0][1]
                
                scores.append({
                    "challenge_id": challenge["id"],
                    "challenge_name": challenge["name"],
                    "confidence_score": round(float(confidence), 3),
                    "reasoning": self._get_reasoning(challenge, user_features, confidence),
                    "difficulty_level": int(challenge["difficulty"]),
                    "estimated_completion_time": self._estimate_time(challenge)
                })
            
            # Sort by ML confidence and return top N
            scores.sort(key=lambda x: x["confidence_score"], reverse=True)
            return scores[:top_n]
            
        except Exception as e:
            logger.error(f"Error in get_recommendations: {str(e)}")
            return self._get_fallback_recommendations(user_features, top_n)
    
    def _create_feature_vector(self, user_features: Dict, challenge: pd.Series) -> List[float]:
        """Create feature vector for ML model prediction."""
        return [
            challenge["difficulty"],
            user_features.get("days_active", user_features.get("completion_rate", 0.5) * 30),
            user_features.get("avg_steps", user_features.get("completion_rate", 0.5) * 8000),
            user_features.get("meditation_streak", user_features.get("current_streaks", 0)),
            user_features.get("avg_sleep", 7.0),
            user_features.get("completion_rate", 0.5),
            user_features.get("social_score", 0.5)
        ]
    
    def _estimate_time(self, challenge: pd.Series) -> int:
        """Estimate completion time based on challenge category."""
        time_map = {
            "meditation": 10,
            "exercise": 60,
            "water": 1440,
            "sleep": 480,
            "meals": 30
        }
        return time_map.get(challenge["category"], 30)
    
    def _calculate_challenge_score(self, challenge: pd.Series, user_features: Dict) -> float:
        """
        Calculate recommendation score for a challenge.
        Combines multiple factors:
        - Completion rate compatibility
        - Social engagement match
        - Time preference alignment
        - Difficulty calibration
        """
        score = 0.0
        
        # Factor 1: Completion rate match (0-0.3)
        completion_rate = user_features.get("completion_rate", 0.5)
        if completion_rate > 0.7:
            # High performers get harder challenges
            difficulty_score = (challenge["difficulty"] / 5) * 0.3
        else:
            # Struggling users get easier challenges
            difficulty_score = ((6 - challenge["difficulty"]) / 5) * 0.3
        score += difficulty_score
        
        # Factor 2: Social component match (0-0.25)
        social_score = user_features.get("social_score", 0.5)
        if social_score > 0.6 and challenge["social_component"]:
            score += 0.25
        elif social_score < 0.4 and not challenge["social_component"]:
            score += 0.25
        else:
            score += 0.1
        
        # Factor 3: Time preference (0-0.2)
        preferred_times = user_features.get("activity_times", ["any"])
        if challenge["best_time"] in preferred_times or challenge["best_time"] == "any":
            score += 0.2
        else:
            score += 0.05
        
        # Factor 4: Streak synergy (0-0.15)
        current_streaks = user_features.get("current_streaks", 0)
        if current_streaks > 5 and challenge["category"] == "meditation":
            score += 0.15  # Reinforce existing habits
        else:
            score += 0.08
        
        # Factor 5: Collaborative filtering (0-0.1)
        # Simplified version - in production, use actual user similarity
        score += np.random.uniform(0.05, 0.1)
        
        # Normalize to 0-1 range
        return min(1.0, max(0.0, score))
    
    def _get_reasoning(self, challenge: pd.Series, user_features: Dict, score: float) -> str:
        """Generate human-readable reasoning for the recommendation."""
        reasons = []
        
        completion_rate = user_features.get("completion_rate", 0.5)
        if completion_rate > 0.7 and challenge["difficulty"] >= 4:
            reasons.append("matches your high performance level")
        elif completion_rate < 0.5 and challenge["difficulty"] <= 2:
            reasons.append("gentle difficulty for building confidence")
        
        if user_features.get("social_score", 0.5) > 0.6 and challenge["social_component"]:
            reasons.append("social component aligns with your engagement style")
        
        preferred_times = user_features.get("activity_times", ["any"])
        if challenge["best_time"] in preferred_times:
            reasons.append(f"fits your {challenge['best_time']} activity preference")
        
        if not reasons:
            reasons.append("good fit for your current goals")
        
        return "; ".join(reasons).capitalize()
    
    def _get_fallback_recommendations(self, user_features: Dict, top_n: int) -> List[Dict]:
        """Provide simple fallback recommendations if ML fails."""
        fallback_challenges = self._load_challenges()
        return [
            {
                "challenge_id": row["challenge_id"],
                "challenge_name": row["name"],
                "confidence_score": 0.5,
                "reasoning": "Popular challenge for beginners",
                "difficulty_level": int(row["difficulty"]),
                "estimated_completion_time": int(row["duration_minutes"])
            }
            for _, row in fallback_challenges.head(top_n).iterrows()
        ]
