"""
Mock Dataset Generator
Creates realistic synthetic user behavior data for ML training and demo
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random
import json
from typing import List, Dict

class HealthDataGenerator:
    def __init__(self, n_users: int = 1000, n_days: int = 90):
        """
        Initialize data generator.
        
        Args:
            n_users: Number of users to generate
            n_days: Number of days of history per user
        """
        self.n_users = n_users
        self.n_days = n_days
        self.user_profiles = []
        self.activity_logs = []
        
    def generate_complete_dataset(self) -> Dict[str, pd.DataFrame]:
        """Generate all datasets."""
        print(f"Generating dataset for {self.n_users} users over {self.n_days} days...")
        
        # Generate user profiles
        users_df = self._generate_user_profiles()
        
        # Generate activity logs
        activities_df = self._generate_activity_logs(users_df)
        
        # Generate challenge participation
        challenges_df = self._generate_challenge_participation(users_df)
        
        # Generate social interactions
        social_df = self._generate_social_interactions(users_df)
        
        # Generate feature matrix
        features_df = self._generate_feature_matrix(users_df, activities_df, challenges_df, social_df)
        
        print(f"✓ Generated {len(users_df)} user profiles")
        print(f"✓ Generated {len(activities_df)} activity records")
        print(f"✓ Generated {len(challenges_df)} challenge records")
        print(f"✓ Generated {len(social_df)} social interactions")
        print(f"✓ Generated feature matrix with {len(features_df)} rows")
        
        return {
            "users": users_df,
            "activities": activities_df,
            "challenges": challenges_df,
            "social": social_df,
            "features": features_df
        }
    
    def _generate_user_profiles(self) -> pd.DataFrame:
        """Generate user profile data."""
        profiles = []
        
        for i in range(self.n_users):
            # Define user type (affects behavior patterns)
            user_type = random.choice(["highly_engaged", "moderate", "struggling", "dropout"])
            
            profile = {
                "user_id": f"user_{i:04d}",
                "user_type": user_type,
                "join_date": (datetime.now() - timedelta(days=random.randint(1, 365))).strftime("%Y-%m-%d"),
                "age": random.randint(18, 65),
                "fitness_level": random.choice(["beginner", "intermediate", "advanced"]),
                "primary_goal": random.choice(["weight_loss", "muscle_gain", "wellness", "stress_reduction"]),
                "preferred_activity_time": random.choice(["morning", "afternoon", "evening", "night"])
            }
            
            profiles.append(profile)
        
        return pd.DataFrame(profiles)
    
    def _generate_activity_logs(self, users_df: pd.DataFrame) -> pd.DataFrame:
        """Generate daily activity logs (steps, meditation, etc.)."""
        activities = []
        
        for _, user in users_df.iterrows():
            user_id = user["user_id"]
            user_type = user["user_type"]
            
            # Set behavior patterns based on user type
            if user_type == "highly_engaged":
                base_completion_rate = 0.85
                step_range = (8000, 15000)
                meditation_prob = 0.9
            elif user_type == "moderate":
                base_completion_rate = 0.65
                step_range = (5000, 10000)
                meditation_prob = 0.6
            elif user_type == "struggling":
                base_completion_rate = 0.4
                step_range = (2000, 7000)
                meditation_prob = 0.3
            else:  # dropout
                base_completion_rate = 0.2
                step_range = (500, 3000)
                meditation_prob = 0.1
            
            # Generate daily activities
            current_streak = 0
            for day in range(self.n_days):
                date = datetime.now() - timedelta(days=self.n_days - day)
                
                # Add some randomness
                completed = random.random() < base_completion_rate
                
                if completed:
                    current_streak += 1
                    steps = random.randint(*step_range)
                    meditation_minutes = random.randint(5, 30) if random.random() < meditation_prob else 0
                    water_glasses = random.randint(6, 10)
                    sleep_hours = round(random.uniform(6, 9), 1)
                    # Healthy vital signs
                    heart_rate = random.randint(60, 100)  # Normal resting HR
                    resting_heart_rate = random.randint(50, 70)  # Good resting HR
                    blood_oxygen = random.randint(96, 100)  # Healthy SpO2
                    bp_systolic = random.randint(110, 130)  # Normal BP
                    bp_diastolic = random.randint(70, 85)  # Normal BP
                    hrv = random.randint(50, 100)  # Good HRV
                else:
                    current_streak = 0
                    steps = random.randint(500, 3000)
                    meditation_minutes = 0
                    water_glasses = random.randint(0, 5)
                    sleep_hours = round(random.uniform(4, 7), 1)
                    # Less optimal vital signs for inactive users
                    heart_rate = random.randint(70, 110)  # Higher resting HR
                    resting_heart_rate = random.randint(65, 85)  # Higher resting HR
                    blood_oxygen = random.randint(92, 98)  # Lower SpO2
                    bp_systolic = random.randint(120, 145)  # Elevated BP
                    bp_diastolic = random.randint(80, 95)  # Elevated BP
                    hrv = random.randint(20, 60)  # Lower HRV
                
                activities.append({
                    "user_id": user_id,
                    "date": date.strftime("%Y-%m-%d"),
                    "steps": steps,
                    "meditation_minutes": meditation_minutes,
                    "water_glasses": water_glasses,
                    "sleep_hours": sleep_hours,
                    "meals_logged": random.randint(0, 3),
                    "exercise_minutes": random.randint(0, 60) if completed else 0,
                    "current_streak": current_streak,
                    "completed_daily_goal": completed,
                    # Vital Health Metrics
                    "heart_rate": heart_rate,
                    "resting_heart_rate": resting_heart_rate,
                    "blood_oxygen": blood_oxygen,
                    "blood_pressure_systolic": bp_systolic,
                    "blood_pressure_diastolic": bp_diastolic,
                    "heart_rate_variability": hrv
                })
        
        return pd.DataFrame(activities)
    
    def _generate_challenge_participation(self, users_df: pd.DataFrame) -> pd.DataFrame:
        """Generate challenge participation data."""
        challenges = []
        
        challenge_types = [
            ("10K Steps Challenge", "exercise", 3),
            ("Morning Meditation", "meditation", 2),
            ("Hydration Hero", "water", 1),
            ("Sleep Sanctuary", "sleep", 3),
            ("7-Day Streak", "exercise", 5),
            ("Mindful Eating", "meals", 4),
            ("Evening Yoga", "exercise", 2),
            ("Breathwork Beginner", "meditation", 1)
        ]
        
        for _, user in users_df.iterrows():
            user_id = user["user_id"]
            user_type = user["user_type"]
            
            # Number of challenges attempted
            if user_type == "highly_engaged":
                n_challenges = random.randint(10, 20)
                completion_rate = 0.8
            elif user_type == "moderate":
                n_challenges = random.randint(5, 12)
                completion_rate = 0.6
            elif user_type == "struggling":
                n_challenges = random.randint(2, 6)
                completion_rate = 0.35
            else:
                n_challenges = random.randint(1, 3)
                completion_rate = 0.15
            
            for _ in range(n_challenges):
                challenge_name, category, difficulty = random.choice(challenge_types)
                
                start_date = datetime.now() - timedelta(days=random.randint(1, self.n_days))
                completed = random.random() < completion_rate
                
                if completed:
                    completion_date = start_date + timedelta(days=random.randint(1, 7))
                    points_earned = difficulty * 50
                else:
                    completion_date = None
                    points_earned = 0
                
                challenges.append({
                    "user_id": user_id,
                    "challenge_name": challenge_name,
                    "category": category,
                    "difficulty": difficulty,
                    "start_date": start_date.strftime("%Y-%m-%d"),
                    "completion_date": completion_date.strftime("%Y-%m-%d") if completion_date else None,
                    "completed": completed,
                    "points_earned": points_earned,
                    "attempts": random.randint(1, 3)
                })
        
        return pd.DataFrame(challenges)
    
    def _generate_social_interactions(self, users_df: pd.DataFrame) -> pd.DataFrame:
        """Generate social interaction data."""
        interactions = []
        
        for _, user in users_df.iterrows():
            user_id = user["user_id"]
            user_type = user["user_type"]
            
            # Social engagement based on user type
            if user_type == "highly_engaged":
                n_interactions = random.randint(50, 150)
            elif user_type == "moderate":
                n_interactions = random.randint(20, 60)
            elif user_type == "struggling":
                n_interactions = random.randint(5, 25)
            else:
                n_interactions = random.randint(0, 10)
            
            for _ in range(n_interactions):
                interaction_type = random.choice(["like", "comment", "share", "follow"])
                date = datetime.now() - timedelta(days=random.randint(1, self.n_days))
                
                interactions.append({
                    "user_id": user_id,
                    "interaction_type": interaction_type,
                    "date": date.strftime("%Y-%m-%d"),
                    "timestamp": date.strftime("%Y-%m-%d %H:%M:%S")
                })
        
        return pd.DataFrame(interactions)
    
    def _generate_feature_matrix(
        self, 
        users_df: pd.DataFrame, 
        activities_df: pd.DataFrame,
        challenges_df: pd.DataFrame,
        social_df: pd.DataFrame
    ) -> pd.DataFrame:
        """Generate ML-ready feature matrix."""
        features = []
        
        for _, user in users_df.iterrows():
            user_id = user["user_id"]
            
            # Get user's activities
            user_activities = activities_df[activities_df["user_id"] == user_id]
            user_challenges = challenges_df[challenges_df["user_id"] == user_id]
            user_social = social_df[social_df["user_id"] == user_id]
            
            # Calculate features
            if len(user_activities) > 0:
                # Activity features
                days_active = len(user_activities[user_activities["completed_daily_goal"]])
                avg_steps_last_7 = user_activities.tail(7)["steps"].mean()
                max_streak = user_activities["current_streak"].max()
                avg_meditation = user_activities["meditation_minutes"].mean()
                avg_sleep = user_activities["sleep_hours"].mean()
                
                # Vital Health Metrics (last 7 days average)
                avg_heart_rate = user_activities.tail(7)["heart_rate"].mean()
                avg_resting_hr = user_activities.tail(7)["resting_heart_rate"].mean()
                avg_blood_oxygen = user_activities.tail(7)["blood_oxygen"].mean()
                avg_bp_systolic = user_activities.tail(7)["blood_pressure_systolic"].mean()
                avg_bp_diastolic = user_activities.tail(7)["blood_pressure_diastolic"].mean()
                avg_hrv = user_activities.tail(7)["heart_rate_variability"].mean()
                
                # Challenge features
                challenge_completion_rate = (
                    len(user_challenges[user_challenges["completed"]]) / max(len(user_challenges), 1)
                )
                total_points = user_challenges["points_earned"].sum()
                
                # Social features
                social_engagement_score = min(1.0, len(user_social) / 100.0)
                
                # Notification response (simulated)
                notification_response_rate = random.uniform(0.3, 0.9) if days_active > 7 else random.uniform(0.1, 0.4)
                
                # Mood correlation (simulated)
                mood_exercise_correlation = random.uniform(0.4, 0.9) if avg_steps_last_7 > 7000 else random.uniform(0.2, 0.6)
                
                features.append({
                    "user_id": user_id,
                    "days_active": days_active,
                    "total_days": len(user_activities),
                    "avg_steps_last_7_days": round(avg_steps_last_7, 2),
                    "meditation_streak": max_streak,
                    "avg_meditation_minutes": round(avg_meditation, 2),
                    "avg_sleep_hours": round(avg_sleep, 2),
                    "challenge_completion_rate": round(challenge_completion_rate, 3),
                    "total_points_earned": int(total_points),
                    "social_engagement_score": round(social_engagement_score, 3),
                    "social_interactions_count": len(user_social),
                    "preferred_activity_time": user["preferred_activity_time"],
                    "response_rate_to_notifications": round(notification_response_rate, 3),
                    "mood_correlation_with_exercise": round(mood_exercise_correlation, 3),
                    # Vital Health Metrics
                    "avg_heart_rate_7d": round(avg_heart_rate, 1),
                    "avg_resting_heart_rate_7d": round(avg_resting_hr, 1),
                    "avg_blood_oxygen_7d": round(avg_blood_oxygen, 1),
                    "avg_bp_systolic_7d": round(avg_bp_systolic, 1),
                    "avg_bp_diastolic_7d": round(avg_bp_diastolic, 1),
                    "avg_hrv_7d": round(avg_hrv, 1),
                    "user_type": user["user_type"],
                    "fitness_level": user["fitness_level"],
                    "primary_goal": user["primary_goal"]
                })
        
        return pd.DataFrame(features)
    
    def save_datasets(self, datasets: Dict[str, pd.DataFrame], output_dir: str = "./data"):
        """Save all datasets to CSV files."""
        import os
        os.makedirs(output_dir, exist_ok=True)
        
        for name, df in datasets.items():
            filepath = os.path.join(output_dir, f"{name}.csv")
            df.to_csv(filepath, index=False)
            print(f"✓ Saved {filepath}")
        
        # Also save a summary
        summary = {
            "generated_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "n_users": self.n_users,
            "n_days": self.n_days,
            "datasets": {
                name: {"rows": len(df), "columns": len(df.columns)}
                for name, df in datasets.items()
            }
        }
        
        with open(os.path.join(output_dir, "dataset_summary.json"), "w") as f:
            json.dump(summary, f, indent=2)
        
        print(f"✓ Saved dataset summary")


if __name__ == "__main__":
    # Generate datasets
    generator = HealthDataGenerator(n_users=1000, n_days=90)
    datasets = generator.generate_complete_dataset()
    generator.save_datasets(datasets, output_dir="./ml-service/data")
    
    print("\n✅ Dataset generation complete!")
    print(f"Total users: {len(datasets['users'])}")
    print(f"Total activity records: {len(datasets['activities'])}")
    print(f"Total challenge records: {len(datasets['challenges'])}")
    print(f"Total social interactions: {len(datasets['social'])}")
