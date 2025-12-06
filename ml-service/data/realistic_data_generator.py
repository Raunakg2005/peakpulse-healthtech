"""
Realistic Data Generator - Fixed for Production
Removes data leakage and creates overlapping, noisy, real-world data
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random
import json
from typing import List, Dict

class RealisticHealthDataGenerator:
    def __init__(self, n_users: int = 1000, n_days: int = 90):
        """
        Initialize realistic data generator.
        
        Key differences from previous version:
        - No deterministic user_type encoding
        - Overlapping class distributions
        - Realistic noise and outliers
        - Missing data patterns
        - Contradictory examples
        """
        self.n_users = n_users
        self.n_days = n_days
        random.seed(42)  # Reproducibility
        np.random.seed(42)
        
    def generate_complete_dataset(self) -> Dict[str, pd.DataFrame]:
        """Generate realistic datasets with NO data leakage."""
        print(f"Generating REALISTIC dataset for {self.n_users} users over {self.n_days} days...")
        print("⚠️  Adding noise, overlaps, and real-world complexity...")
        
        # Generate user profiles WITHOUT predetermined types
        users_df = self._generate_realistic_user_profiles()
        
        # Generate activities with noise
        activities_df = self._generate_noisy_activity_logs(users_df)
        
        # Generate challenges
        challenges_df = self._generate_realistic_challenges(users_df, activities_df)
        
        # Generate social with variance
        social_df = self._generate_social_interactions(users_df)
        
        # Calculate features from observed behavior (NO LEAKAGE!)
        features_df = self._calculate_features_from_behavior(
            users_df, activities_df, challenges_df, social_df
        )
        
        # Assign user_type AFTER features (based on observed behavior)
        features_df = self._assign_user_type_post_hoc(features_df)
        
        print(f"✓ Generated {len(users_df)} user profiles")
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
    
    def _generate_realistic_user_profiles(self) -> pd.DataFrame:
        """Generate user profiles WITHOUT encoding their future behavior."""
        profiles = []
        
        for i in range(self.n_users):
            profile = {
                "user_id": f"user_{i:04d}",
                "join_date": (datetime.now() - timedelta(days=random.randint(1, 365))).strftime("%Y-%m-%d"),
                "age": int(np.random.normal(35, 12)),  # Normal distribution
                "fitness_level": random.choice(["beginner", "intermediate", "advanced"]),
                "primary_goal": random.choice(["weight_loss", "muscle_gain", "wellness", "stress_reduction"]),
                "preferred_activity_time": random.choice(["morning", "afternoon", "evening", "night"])
            }
            profiles.append(profile)
        
        return pd.DataFrame(profiles)
    
    def _generate_noisy_activity_logs(self, users_df: pd.DataFrame) -> pd.DataFrame:
        """Generate activities with realistic noise and variance."""
        activities = []
        
        for _, user in users_df.iterrows():
            user_id = user["user_id"]
            
            # Each user has a BASE tendency (not deterministic!)
            # Use continuous distribution, not discrete categories
            base_engagement = np.random.beta(2, 2)  # U-shaped distribution 0-1
            base_consistency = np.random.beta(2, 5)  # Skewed towards lower values
            
            current_streak = 0
            
            for day in range(self.n_days):
                date = datetime.now() - timedelta(days=self.n_days - day)
                
                # Activity completion influenced by multiple factors
                day_of_week_factor = 1.2 if date.weekday() < 5 else 0.8  # Weekday vs weekend
                random_factor = np.random.uniform(0.5, 1.5)  # Daily variance
                trend_factor = 1 + (day / self.n_days) * random.uniform(-0.3, 0.3)  # Temporal drift
                
                # Probability is NOT deterministic
                completion_prob = base_engagement * base_consistency * day_of_week_factor * random_factor * trend_factor
                completion_prob = np.clip(completion_prob, 0, 1)
                
                # Bernoulli trial
                completed = random.random() < completion_prob
                
                if completed:
                    current_streak += 1
                    # Vary steps based on multiple factors
                    steps = int(np.random.gamma(shape=3, scale=2000))  # Right-skewed
                    steps = np.clip(steps, 500, 20000)
                    
                    meditation_minutes = int(np.random.exponential(scale=10))  # Most do little, few do a lot
                    meditation_minutes = np.clip(meditation_minutes, 0, 60)
                    
                    water_glasses = int(np.random.poisson(lam=6))  # Poisson distribution
                    water_glasses = np.clip(water_glasses, 0, 12)
                    
                    sleep_hours = np.random.normal(7, 1.2)  # Normal with variance
                    sleep_hours = np.clip(sleep_hours, 4, 10)
                    
                    exercise_minutes = int(np.random.gamma(shape=2, scale=15))
                    exercise_minutes = np.clip(exercise_minutes, 0, 120)
                else:
                    current_streak = 0
                    # Even non-completed days have SOME activity (realistic!)
                    steps = int(np.random.gamma(shape=1.5, scale=1000))
                    steps = np.clip(steps, 0, 5000)
                    
                    meditation_minutes = 0 if random.random() < 0.8 else random.randint(0, 10)
                    water_glasses = random.randint(0, 5)
                    sleep_hours = np.random.normal(6.5, 1.5)
                    sleep_hours = np.clip(sleep_hours, 3, 9)
                    exercise_minutes = 0 if random.random() < 0.7 else random.randint(0, 30)
                
                # Add 5% missing data (real apps have this!)
                if random.random() < 0.05:
                    steps = np.nan
                
                activities.append({
                    "user_id": user_id,
                    "date": date.strftime("%Y-%m-%d"),
                    "steps": steps,
                    "meditation_minutes": meditation_minutes,
                    "water_glasses": water_glasses,
                    "sleep_hours": round(sleep_hours, 1),
                    "meals_logged": random.randint(0, 3),
                    "exercise_minutes": exercise_minutes,
                    "current_streak": current_streak,
                    "completed_daily_goal": completed
                })
        
        return pd.DataFrame(activities)
    
    def _generate_realistic_challenges(self, users_df: pd.DataFrame, activities_df: pd.DataFrame) -> pd.DataFrame:
        """Generate challenge participation with realistic patterns."""
        challenges = []
        
        challenge_types = [
            ("10K Steps Challenge", "exercise", 3),
            ("Morning Meditation", "meditation", 2),
            ("Hydration Hero", "water", 1),
            ("Sleep Sanctuary", "sleep", 3),
            ("7-Day Streak", "exercise", 5),
            ("Mindful Eating", "meals", 4),
        ]
        
        for _, user in users_df.iterrows():
            user_id = user["user_id"]
            
            # Get user's actual activity level
            user_activities = activities_df[activities_df["user_id"] == user_id]
            actual_completion_rate = user_activities["completed_daily_goal"].mean()
            
            # Number of challenges attempted (influenced by but not determined by completion rate)
            n_challenges = int(np.random.poisson(lam=5 + actual_completion_rate * 10))
            n_challenges = np.clip(n_challenges, 1, 25)
            
            for _ in range(n_challenges):
                challenge_name, category, difficulty = random.choice(challenge_types)
                
                # Completion influenced by actual performance AND luck
                base_success_prob = actual_completion_rate
                difficulty_penalty = (6 - difficulty) / 10  # Harder challenges less likely
                luck = np.random.uniform(0.7, 1.3)
                
                success_prob = base_success_prob * difficulty_penalty * luck
                success_prob = np.clip(success_prob, 0, 1)
                
                completed = random.random() < success_prob
                
                start_date = datetime.now() - timedelta(days=random.randint(1, self.n_days))
                
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
        """Generate social interactions."""
        interactions = []
        
        for _, user in users_df.iterrows():
            user_id = user["user_id"]
            
            # Social engagement varies independently
            social_tendency = np.random.beta(2, 3)  # Skewed to lower
            n_interactions = int(np.random.poisson(lam=social_tendency * 100))
            
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
    
    def _calculate_features_from_behavior(
        self, 
        users_df: pd.DataFrame, 
        activities_df: pd.DataFrame,
        challenges_df: pd.DataFrame,
        social_df: pd.DataFrame
    ) -> pd.DataFrame:
        """Calculate features from OBSERVED behavior only - NO LEAKAGE."""
        features = []
        
        for _, user in users_df.iterrows():
            user_id = user["user_id"]
            
            # Get user's data
            user_activities = activities_df[activities_df["user_id"] == user_id].copy()
            user_challenges = challenges_df[challenges_df["user_id"] == user_id]
            user_social = social_df[social_df["user_id"] == user_id]
            
            # Calculate from OBSERVED behavior
            if len(user_activities) > 0:
                # Handle missing values
                days_active = user_activities["completed_daily_goal"].sum()
                
                # Last 7 days steps (handle NaN)
                recent_steps = user_activities.tail(7)["steps"].dropna()
                avg_steps_last_7 = recent_steps.mean() if len(recent_steps) > 0 else 0
                
                max_streak = user_activities["current_streak"].max()
                avg_meditation = user_activities["meditation_minutes"].mean()
                avg_sleep = user_activities["sleep_hours"].mean()
                
                # Challenge metrics
                if len(user_challenges) > 0:
                    challenge_completion_rate = user_challenges["completed"].mean()
                    total_points = user_challenges["points_earned"].sum()
                else:
                    challenge_completion_rate = 0.0
                    total_points = 0
                
                # Social
                social_engagement_score = min(1.0, len(user_social) / 100.0)
                
                # Add noise to ALL features (measurement error!)
                noise_factor = 1 + np.random.normal(0, 0.05)  # ±5% noise
                
                features.append({
                    "user_id": user_id,
                    "days_active": int(days_active * noise_factor),
                    "total_days": len(user_activities),
                    "avg_steps_last_7_days": avg_steps_last_7 * noise_factor,
                    "meditation_streak": int(max_streak * noise_factor),
                    "avg_meditation_minutes": avg_meditation * noise_factor,
                    "avg_sleep_hours": avg_sleep * noise_factor,
                    "challenge_completion_rate": np.clip(challenge_completion_rate * noise_factor, 0, 1),
                    "total_points_earned": int(total_points * noise_factor),
                    "social_engagement_score": np.clip(social_engagement_score * noise_factor, 0, 1),
                    "social_interactions_count": len(user_social),
                    "response_rate_to_notifications": random.uniform(0.2, 0.9),  # External factor
                    "mood_correlation_with_exercise": random.uniform(0.3, 0.9),  # External factor
                    "fitness_level": user["fitness_level"],
                    "primary_goal": user["primary_goal"]
                })
        
        return pd.DataFrame(features)
    
    def _assign_user_type_post_hoc(self, features_df: pd.DataFrame) -> pd.DataFrame:
        """
        Assign user_type AFTER features are calculated, based on percentiles.
        This creates weak correlation, not perfect prediction.
        """
        # Create composite score from multiple features
        features_df['engagement_score'] = (
            features_df['challenge_completion_rate'] * 0.3 +
            (features_df['days_active'] / features_df['total_days']) * 0.3 +
            features_df['social_engagement_score'] * 0.2 +
            (features_df['avg_steps_last_7_days'] / 10000) * 0.2
        )
        
        # Add random noise to break perfect separation
        features_df['engagement_score'] += np.random.normal(0, 0.15, len(features_df))
        features_df['engagement_score'] = features_df['engagement_score'].clip(0, 2)
        
        # Assign based on percentiles (creates overlap!)
        percentiles = features_df['engagement_score'].quantile([0.25, 0.50, 0.75])
        
        def assign_type(score):
            # Add randomness so classification isn't perfect
            if random.random() < 0.1:  # 10% label noise!
                return random.choice(['dropout', 'struggling', 'moderate', 'highly_engaged'])
            
            if score < percentiles[0.25]:
                return 'dropout'
            elif score < percentiles[0.50]:
                return 'struggling'
            elif score < percentiles[0.75]:
                return 'moderate'
            else:
                return 'highly_engaged'
        
        features_df['user_type'] = features_df['engagement_score'].apply(assign_type)
        
        # Drop the intermediate score
        features_df = features_df.drop('engagement_score', axis=1)
        
        return features_df
    
    def save_datasets(self, datasets: Dict[str, pd.DataFrame], output_dir: str = "./data"):
        """Save all datasets."""
        import os
        
        # Create backup of old data
        for name in ["users", "activities", "challenges", "social", "features"]:
            old_path = os.path.join(output_dir, f"{name}.csv")
            if os.path.exists(old_path):
                backup_path = os.path.join(output_dir, f"{name}_old.csv")
                import shutil
                shutil.move(old_path, backup_path)
                print(f"✓ Backed up old {name}.csv")
        
        # Save new data
        for name, df in datasets.items():
            filepath = os.path.join(output_dir, f"{name}.csv")
            df.to_csv(filepath, index=False)
            print(f"✓ Saved {filepath}")
        
        # Save summary
        summary = {
            "generated_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "n_users": self.n_users,
            "n_days": self.n_days,
            "data_version": "v2_realistic_no_leakage",
            "datasets": {
                name: {"rows": len(df), "columns": len(df.columns)}
                for name, df in datasets.items()
            }
        }
        
        with open(os.path.join(output_dir, "dataset_summary.json"), "w") as f:
            json.dump(summary, f, indent=2)
        
        print(f"✓ Saved dataset summary")


if __name__ == "__main__":
    print("="*60)
    print("🔧 GENERATING REALISTIC DATASET (NO DATA LEAKAGE)")
    print("="*60)
    
    generator = RealisticHealthDataGenerator(n_users=1000, n_days=90)
    datasets = generator.generate_complete_dataset()
    generator.save_datasets(datasets, output_dir="./ml-service/data")
    
    print("\n✅ Realistic dataset generation complete!")
    print(f"Total users: {len(datasets['users'])}")
    print(f"Total activity records: {len(datasets['activities'])}")
    print(f"Total challenge records: {len(datasets['challenges'])}")
    print(f"Total social interactions: {len(datasets['social'])}")
    
    # Quick validation
    features = datasets['features']
    print("\n📊 User Type Distribution:")
    print(features['user_type'].value_counts())
    print(f"\nDropout rate: {(features['user_type'] == 'dropout').mean():.2%}")
