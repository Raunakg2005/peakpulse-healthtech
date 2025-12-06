"""
Create Advanced Features for Engagement Classification
Adds temporal variance, trends, and behavioral patterns
"""
import pandas as pd
import numpy as np

print("Creating advanced engagement features...")

# Load base data
features_df = pd.read_csv('data/features.csv')
activities_df = pd.read_csv('data/activities.csv')
social_df = pd.read_csv('data/social.csv')

print(f"Processing {len(features_df)} users...")

advanced_features = []

for _, user in features_df.iterrows():
    user_id = user['user_id']
    
    # Get user's temporal data
    user_activities = activities_df[activities_df['user_id'] == user_id].sort_values('date')
    user_social = social_df[social_df['user_id'] == user_id]
    
    if len(user_activities) == 0:
        continue
    
    # Temporal variance features
    step_variance = user_activities['steps'].std() / (user_activities['steps'].mean() + 1)
    completion_variance = user_activities['completed_daily_goal'].std()
    streak_variance = user_activities['current_streak'].std()
    
    # Trend features (last 7 days vs first 7 days)
    if len(user_activities) >= 14:
        early_completion = user_activities.head(7)['completed_daily_goal'].mean()
        recent_completion = user_activities.tail(7)['completed_daily_goal'].mean()
        completion_trend = recent_completion - early_completion
        
        early_steps = user_activities.head(7)['steps'].mean()
        recent_steps = user_activities.tail(7)['steps'].mean()
        steps_trend = (recent_steps - early_steps) / (early_steps + 1)
    else:
        completion_trend = 0
        steps_trend = 0
    
    # Engagement momentum (acceleration)
    if len(user_activities) >= 21:
        week1 = user_activities.iloc[:7]['completed_daily_goal'].mean()
        week2 = user_activities.iloc[7:14]['completed_daily_goal'].mean()
        week3 = user_activities.iloc[14:21]['completed_daily_goal'].mean()
        momentum = (week3 - week2) - (week2 - week1)
    else:
        momentum = 0
    
    # Consistency score (how regular is the user)
    activity_days = user_activities['completed_daily_goal'].sum()
    expected_days = len(user_activities)
    consistency = activity_days / max(expected_days, 1)
    
    # Social engagement patterns
    if len(user_social) > 0:
        social_frequency = len(user_social) / max(user['total_days'], 1)
        # Use available social column (likes, comments, shares)
        avg_social_score = (user_social.get('likes', pd.Series([0])).mean() + 
                            user_social.get('comments', pd.Series([0])).mean()) / 2
    else:
        social_frequency = 0
        avg_social_score = 0
    
    # Peak performance metric
    max_streak = user_activities['current_streak'].max()
    avg_streak = user_activities['current_streak'].mean()
    peak_ratio = max_streak / (avg_streak + 1)
    
    advanced_features.append({
        'user_id': user_id,
        'step_variance': step_variance,
        'completion_variance': completion_variance,
        'streak_variance': streak_variance,
         'completion_trend': completion_trend,
        'steps_trend': steps_trend,
        'engagement_momentum': momentum,
        'behavioral_consistency': consistency,  # Renamed to avoid collision
        'social_frequency': social_frequency,
        'avg_social_score': avg_social_score,
        'peak_performance_ratio': peak_ratio
    })

advanced_df = pd.DataFrame(advanced_features)

# Merge with original features
features_enriched = features_df.merge(advanced_df, on='user_id', how='left')
features_enriched.fillna(0, inplace=True)

# Save
features_enriched.to_csv('data/features_enriched.csv', index=False)

print(f"✅ Created enriched features for {len(features_enriched)} users")
print(f"   Added 10 temporal/behavioral features")
print(f"   Saved to data/features_enriched.csv")
