"""
Signal-Rich Data Generator with Temporal Patterns
Creates data with CLEAR predictive signals for ML models to learn from
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random
from typing import List, Dict, Tuple

class SignalRichDataGenerator:
    """
    Generate synthetic data with STRONG temporal patterns and clear signals.
    
    Key improvements:
    1. Temporal sequences (not just averages)
    2. Clear dropout patterns (3-day decline signal)
    3. Distinct user trajectories
    4. Strong feature-target relationships
    """
    
    def __init__(self, n_users: int = 1000, n_days: int = 30):
        self.n_users = n_users
        self.n_days = n_days  # Reduced to 30 days for clearer temporal patterns
        random.seed(42)
        np.random.seed(42)
        
    def generate_complete_dataset(self) -> Dict[str, pd.DataFrame]:
        """Generate dataset with clear temporal signals."""
        print(f"Generating SIGNAL-RICH dataset with temporal patterns...")
        print(f"  Users: {self.n_users}, Days: {self.n_days}")
        
        # Generate user trajectories with DISTINCT patterns
        user_trajectories = self._generate_user_trajectories()
        
        # Convert to activities dataframe
        activities_df = self._trajectories_to_activities(user_trajectories)
        
        # Generate challenges based on actual performance
        challenges_df = self._generate_challenges_from_trajectories(user_trajectories)
        
        # Generate social interactions
        social_df = self._generate_social_from_trajectories(user_trajectories)
        
        # Calculate TEMPORAL features (this is key!)
        features_df = self._calculate_temporal_features(user_trajectories, activities_df, challenges_df, social_df)
        
        # Assign labels based on trajectory patterns
        features_df = self._assign_labels_from_trajectory(features_df, user_trajectories)
        
        users_df = pd.DataFrame([
            {"user_id": f"user_{i:04d}", "join_date": (datetime.now() - timedelta(days=self.n_days + 10)).strftime("%Y-%m-%d")}
            for i in range(self.n_users)
        ])
        
        print(f"✓ Generated {len(activities_df)} activity records")
        print(f"✓ Generated {len(challenges_df)} challenge records")
        print(f"✓ Generated {len(social_df)} social interactions")
        print(f"✓ Calculated feature matrix with {len(features_df)} rows")
        
        return {
            "users": users_df,
            "activities": activities_df,
            "challenges": challenges_df,
            "social": social_df,
            "features": features_df
        }
    
    def _generate_user_trajectories(self) -> Dict:
        """
        Generate user activity trajectories with CLEAR patterns.
        
        4 types with DISTINCT temporal signatures:
        1. Stable High: Consistent activity (will be highly_engaged)
        2. Gradual Decline: Slow burnout (will be struggling)
        3. Sudden Drop: Life event or loss of interest (will be dropout)
        4. Inconsistent: Up and down (will be moderate)
        """
        trajectories = {}
        
        # Distribute users across patterns
        n_per_type = self.n_users // 4
        
        for i in range(self.n_users):
            user_id = f"user_{i:04d}"
            
            # Assign trajectory type
            if i < n_per_type:
                trajectory_type = "stable_high"
                trajectory = self._generate_stable_high_trajectory()
            elif i < 2 * n_per_type:
                trajectory_type = "gradual_decline"
                trajectory = self._generate_gradual_decline_trajectory()
            elif i < 3 * n_per_type:
                trajectory_type = "sudden_drop"
                trajectory = self._generate_sudden_drop_trajectory()
            else:
                trajectory_type = "inconsistent"
                trajectory = self._generate_inconsistent_trajectory()
            
            trajectories[user_id] = {
                "type": trajectory_type,
                "daily_engagement": trajectory,  # 30-day engagement scores
                "will_dropout": trajectory_type in ["sudden_drop", "gradual_decline"]
            }
        
        return trajectories
    
    def _generate_stable_high_trajectory(self) -> np.ndarray:
        """High performers: Consistent high engagement."""
        base = np.random.uniform(0.75, 0.95)
        noise = np.random.normal(0, 0.05, self.n_days)
        trajectory = np.clip(base + noise, 0.5, 1.0)
        return trajectory
    
    def _generate_gradual_decline_trajectory(self) -> np.ndarray:
        """Burnout pattern: Starts high, gradually declines."""
        start = np.random.uniform(0.7, 0.9)
        end = np.random.uniform(0.1, 0.3)
        
        # Linear decline with noise
        trajectory = np.linspace(start, end, self.n_days)
        noise = np.random.normal(0, 0.08, self.n_days)
        trajectory = np.clip(trajectory + noise, 0, 1)
        
        return trajectory
    
    def _generate_sudden_drop_trajectory(self) -> np.ndarray:
        """Life event: Sudden drop in last 3-7 days."""
        # Normal activity for most days
        normal_days = self.n_days - random.randint(3, 7)
        
        normal_part = np.random.uniform(0.5, 0.8, normal_days)
        
        # Sudden drop
        drop_days = self.n_days - normal_days
        drop_part = np.random.uniform(0, 0.2, drop_days)
        
        trajectory = np.concatenate([normal_part, drop_part])
        return trajectory
    
    def _generate_inconsistent_trajectory(self) -> np.ndarray:
        """Up and down: Inconsistent commitment."""
        # Create sine wave with noise
        x = np.linspace(0, 4 * np.pi, self.n_days)
        trajectory = 0.5 + 0.3 * np.sin(x) + np.random.normal(0, 0.15, self.n_days)
        trajectory = np.clip(trajectory, 0, 1)
        return trajectory
    
    def _trajectories_to_activities(self, trajectories: Dict) -> pd.DataFrame:
        """Convert engagement trajectories to activity logs."""
        activities = []
        
        for user_id, traj_data in trajectories.items():
            engagement = traj_data["daily_engagement"]
            
            for day in range(self.n_days):
                date = datetime.now() - timedelta(days=self.n_days - day)
                eng_score = engagement[day]
                
                # Engagement score drives all metrics
                completed = eng_score > 0.5
                
                # Steps proportional to engagement (with noise)
                steps = int(eng_score * np.random.gamma(3, 2500))
                steps = np.clip(steps, 0, 20000)
                
                # Meditation (higher engagement = more likely)
                meditation_prob = eng_score * 0.7
                meditation_minutes = int(np.random.exponential(15)) if random.random() < meditation_prob else 0
                meditation_minutes = min(meditation_minutes, 60)
                
                # Sleep quality (engagement affects sleep)
                sleep_hours = 7 + (eng_score - 0.5) * 2 + np.random.normal(0, 0.5)
                sleep_hours = np.clip(sleep_hours, 4, 10)
                
                # Social/water/meals all influenced by engagement
                water_glasses = int(eng_score * 8) + random.randint(0, 3)
                meals_logged = int(eng_score * 3)
                exercise_minutes = int(eng_score * 45) if completed else 0
                
                activities.append({
                    "user_id": user_id,
                    "date": date.strftime("%Y-%m-%d"),
                    "day_number": day,  # IMPORTANT: Track day number for temporal features
                    "steps": steps,
                    "meditation_minutes": meditation_minutes,
                    "water_glasses": water_glasses,
                    "sleep_hours": round(sleep_hours, 1),
                    "meals_logged": meals_logged,
                    "exercise_minutes": exercise_minutes,
                    "engagement_score": eng_score,  # Hidden ground truth
                    "completed_daily_goal": completed
                })
        
        return pd.DataFrame(activities)
    
    def _generate_challenges_from_trajectories(self, trajectories: Dict) -> pd.DataFrame:
        """Generate challenges based on actual user performance."""
        challenges = []
        
        challenge_types = [
            ("10K Steps Challenge", "exercise", 3),
            ("Morning Meditation", "meditation", 2),
            ("7-Day Streak", "exercise", 5),
        ]
        
        for user_id, traj_data in trajectories.items():
            avg_engagement = traj_data["daily_engagement"].mean()
            
            # Number of challenges based on engagement
            n_challenges = int(avg_engagement * 15)
            n_challenges = max(1, n_challenges)
            
            for _ in range(n_challenges):
                challenge_name, category, difficulty = random.choice(challenge_types)
                
                # Success based on avg engagement and difficulty
                success_prob = avg_engagement * (6 - difficulty) / 5
                completed = random.random() < success_prob
                
                start_date = datetime.now() - timedelta(days=random.randint(1, self.n_days))
                
                challenges.append({
                    "user_id": user_id,
                    "challenge_name": challenge_name,
                    "category": category,
                    "difficulty": difficulty,
                    "start_date": start_date.strftime("%Y-%m-%d"),
                    "completed": completed,
                    "points_earned": difficulty * 50 if completed else 0
                })
        
        return pd.DataFrame(challenges)
    
    def _generate_social_from_trajectories(self, trajectories: Dict) -> pd.DataFrame:
        """Generate social interactions proportional to engagement."""
        interactions = []
        
        for user_id, traj_data in trajectories.items():
            avg_engagement = traj_data["daily_engagement"].mean()
            
            n_interactions = int(avg_engagement * 100)
            
            for _ in range(n_interactions):
                date = datetime.now() - timedelta(days=random.randint(1, self.n_days))
                
                interactions.append({
                    "user_id": user_id,
                    "interaction_type": random.choice(["like", "comment", "share"]),
                    "date": date.strftime("%Y-%m-%d")
                })
        
        return pd.DataFrame(interactions)
    
    def _calculate_temporal_features(
        self, 
        trajectories: Dict,
        activities_df: pd.DataFrame,
        challenges_df: pd.DataFrame,
        social_df: pd.DataFrame
    ) -> pd.DataFrame:
        """
        Calculate TEMPORAL features that capture trends and patterns.
        THIS IS THE KEY TO GOOD ML PERFORMANCE!
        """
        features = []
        
        for user_id, traj_data in trajectories.items():
            user_activities = activities_df[activities_df["user_id"] == user_id].sort_values("day_number")
            
            if len(user_activities) < self.n_days:
                continue
            
            # === TEMPORAL FEATURES (Strong Predictors!) ===
            
            # 1. ACTIVITY SLOPE (rate of change) - STRONGEST SIGNAL
            last_7_days = user_activities.tail(7)["engagement_score"].values
            first_7_days = user_activities.head(7)["engagement_score"].values
            activity_slope = (last_7_days.mean() - first_7_days.mean()) / 7
            
            # 2. 3-DAY DECLINE (sudden drop detector)
            last_3_days = user_activities.tail(3)["engagement_score"].mean()
            prev_7_days = user_activities.iloc[-10:-3]["engagement_score"].mean()
            three_day_decline = prev_7_days - last_3_days
            
            # 3. CONSISTENCY (volatility)
            consistency_score = 1 / (1 + user_activities["engagement_score"].std())
            
            # 4. MOMENTUM (recent vs overall)
            recent_avg = user_activities.tail(7)["engagement_score"].mean()
            overall_avg = user_activities["engagement_score"].mean()
            momentum = recent_avg - overall_avg
            
            # === STANDARD FEATURES (Weaker but still useful) ===
            days_active = user_activities["completed_daily_goal"].sum()
            avg_steps = user_activities["steps"].mean()
            avg_meditation = user_activities["meditation_minutes"].mean()
            avg_sleep = user_activities["sleep_hours"].mean()
            
            # Challenge metrics
            user_challenges = challenges_df[challenges_df["user_id"] == user_id]
            challenge_completion_rate = user_challenges["completed"].mean() if len(user_challenges) > 0 else 0
            total_points = user_challenges["points_earned"].sum() if len(user_challenges) > 0 else 0
            
            # Social
            user_social = social_df[social_df["user_id"] == user_id]
            social_count = len(user_social)
            social_engagement_score = min(1.0, social_count / 100.0)
            
            features.append({
                "user_id": user_id,
                # TEMPORAL FEATURES (These should dominate!)
                "activity_slope": activity_slope,
                "three_day_decline": three_day_decline,
                "consistency_score": consistency_score,
                "momentum": momentum,
                # STANDARD FEATURES
                "days_active": days_active,
                "total_days": self.n_days,
                "avg_steps_last_7_days": last_7_days.mean() * 10000,  # Convert to actual steps
                "avg_meditation_minutes": avg_meditation,
                "avg_sleep_hours": avg_sleep,
                "challenge_completion_rate": challenge_completion_rate,
                "total_points_earned": int(total_points),
                "social_engagement_score": social_engagement_score,
                "social_interactions_count": social_count,
                # Add some noise to prevent perfect prediction
                "response_rate_to_notifications": random.uniform(0.3, 0.9),
                "mood_correlation_with_exercise": random.uniform(0.4, 0.9)
            })
        
        return pd.DataFrame(features)
    
    def _assign_labels_from_trajectory(self, features_df: pd.DataFrame, trajectories: Dict) -> pd.DataFrame:
        """Assign labels based on trajectory TYPE."""
        labels = []
        
        for _, row in features_df.iterrows():
            user_id = row["user_id"]
            traj_type = trajectories[user_id]["type"]
            
            # Map trajectory types to user types
            type_mapping = {
                "stable_high": "highly_engaged",
                "inconsistent": "moderate",
                "gradual_decline": "struggling",
                "sudden_drop": "dropout"
            }
            
            user_type = type_mapping[traj_type]
            
            # Add 5% label noise (realistic confusion)
            if random.random() < 0.05:
                user_type = random.choice(list(type_mapping.values()))
            
            labels.append(user_type)
        
        features_df["user_type"] = labels
        
        return features_df
    
    def save_datasets(self, datasets: Dict[str, pd.DataFrame], output_dir: str = "./data"):
        """Save all datasets."""
        import os
        
        for name, df in datasets.items():
            filepath = os.path.join(output_dir, f"{name}.csv")
            df.to_csv(filepath, index=False)
            print(f"✓ Saved {filepath}")
        
        print(f"\n✅ Signal-rich dataset saved!")


if __name__ == "__main__":
    print("="*60)
    print("🎯 GENERATING SIGNAL-RICH DATASET WITH TEMPORAL PATTERNS")
    print("="*60)
    
    generator = SignalRichDataGenerator(n_users=1000, n_days=30)
    datasets = generator.generate_complete_dataset()
    generator.save_datasets(datasets, output_dir=".")  # Save to current directory (ml-service/data)
    
    # Validation
    features = datasets['features']
    print("\n📊 User Type Distribution:")
    print(features['user_type'].value_counts())
    print(f"\nDropout rate: {(features['user_type'] == 'dropout').mean():.2%}")
    
    # Show temporal feature statistics
    print("\n🔍 Temporal Feature Statistics:")
    print(f"Activity Slope Range: [{features['activity_slope'].min():.3f}, {features['activity_slope'].max():.3f}]")
    print(f"3-Day Decline Range: [{features['three_day_decline'].min():.3f}, {features['three_day_decline'].max():.3f}]")
    print(f"Consistency Range: [{features['consistency_score'].min():.3f}, {features['consistency_score'].max():.3f}]")
