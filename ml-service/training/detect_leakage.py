"""
Data Leakage Detection and Analysis
Identify why models achieved perfect scores
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from scipy.stats import pearsonr

# Load the generated data
features = pd.read_csv("./data/features.csv")

print("="*60)
print("🔍 DATA LEAKAGE INVESTIGATION")
print("="*60)

# Create the same labels we used in training
features['dropout_label'] = (features['user_type'] == 'dropout').astype(int)
features['engagement_label'] = features['user_type'].map({
    'highly_engaged': 3,
    'moderate': 2,
    'struggling': 1,
    'dropout': 0
})

print("\n📊 Target Distribution:")
print(features['user_type'].value_counts())
print(f"\nDropout rate: {features['dropout_label'].mean():.2%}")

# Check correlations with target
print("\n🔴 CHECKING FOR DATA LEAKAGE:")
print("="*60)

feature_cols = [
    'days_active',
    'total_days',
    'avg_steps_last_7_days',
    'meditation_streak',
    'avg_meditation_minutes',
    'avg_sleep_hours',
    'challenge_completion_rate',
    'total_points_earned',
    'social_engagement_score',
    'social_interactions_count',
    'response_rate_to_notifications',
    'mood_correlation_with_exercise'
]

print("\nCorrelation with Dropout Label:")
print("-"*60)
leakage_features = []
for col in feature_cols:
    corr, p_value = pearsonr(features[col], features['dropout_label'])
    abs_corr = abs(corr)
    
    # Flag suspicious correlations
    if abs_corr > 0.9:
        flag = "🚨 CRITICAL LEAKAGE"
        leakage_features.append((col, abs_corr))
    elif abs_corr > 0.7:
        flag = "⚠️  HIGH CORRELATION"
        leakage_features.append((col, abs_corr))
    elif abs_corr > 0.5:
        flag = "⚡ MODERATE"
    else:
        flag = "✅ OK"
    
    print(f"{col:40s} {abs_corr:.4f} {flag}")

# Check if user_type is leaking into features
print("\n" + "="*60)
print("🔬 ANALYZING FEATURE DISTRIBUTIONS BY USER TYPE")
print("="*60)

for user_type in features['user_type'].unique():
    print(f"\n{user_type.upper()}:")
    subset = features[features['user_type'] == user_type]
    print(f"  Avg days_active: {subset['days_active'].mean():.2f}")
    print(f"  Avg completion_rate: {subset['challenge_completion_rate'].mean():.4f}")
    print(f"  Avg social_score: {subset['social_engagement_score'].mean():.4f}")
    print(f"  Avg steps: {subset['avg_steps_last_7_days'].mean():.0f}")

# Check for perfect separation
print("\n" + "="*60)
print("🎯 CHECKING FOR PERFECT CLASS SEPARATION")
print("="*60)

# Group by engagement label and check variance
for label in sorted(features['engagement_label'].unique()):
    subset = features[features['engagement_label'] == label]
    user_type = subset['user_type'].iloc[0]
    
    print(f"\nEngagement Level {label} ({user_type}):")
    print(f"  Days active range: {subset['days_active'].min():.0f} - {subset['days_active'].max():.0f}")
    print(f"  Completion rate range: {subset['challenge_completion_rate'].min():.3f} - {subset['challenge_completion_rate'].max():.3f}")
    print(f"  Overlap with other classes: ", end="")
    
    # Check if ranges overlap with other classes
    overlaps = False
    for other_label in features['engagement_label'].unique():
        if other_label != label:
            other_subset = features[features['engagement_label'] == other_label]
            # Check if ranges overlap
            if (subset['challenge_completion_rate'].min() <= other_subset['challenge_completion_rate'].max() and
                subset['challenge_completion_rate'].max() >= other_subset['challenge_completion_rate'].min()):
                overlaps = True
                break
    
    print("YES ✅" if overlaps else "NO 🚨 PROBLEM!")

# Summary
print("\n" + "="*60)
print("📋 DIAGNOSIS SUMMARY")
print("="*60)

if leakage_features:
    print(f"\n🚨 FOUND {len(leakage_features)} FEATURES WITH SUSPICIOUS CORRELATIONS:")
    for feat, corr in leakage_features:
        print(f"   • {feat}: {corr:.4f}")
    print("\n⚠️  ROOT CAUSE: Data generator directly encoded user_type into features!")
    print("   The model didn't learn patterns - it just memorized the encoding.")
else:
    print("\n✅ No obvious data leakage detected")

print("\n" + "="*60)
print("🔧 RECOMMENDED FIXES")
print("="*60)
print("""
1. Remove deterministic mapping from user_type to features
2. Add realistic noise (±10-20% variance within each class)
3. Create overlapping distributions between classes
4. Add temporal variations and outliers
5. Introduce missing values (5-10%)
6. Add contradictory examples (users who don't fit the pattern)
""")
