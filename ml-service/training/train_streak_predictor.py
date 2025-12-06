"""
Train Streak Predictor Model
Predicts likelihood of user's streak breaking in next 3 days
"""
import pandas as pd
import numpy as np
import joblib
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
import os

print("="*70)
print("🔥 TRAINING STREAK PREDICTOR MODEL")
print("="*70)

# Load data
print("\n1️⃣ Loading user activity data...")
features_df = pd.read_csv('data/features.csv')
activities_df = pd.read_csv('data/activities.csv')

print(f"   Users: {len(features_df)}")
print(f"   Activity records: {len(activities_df)}")

# Create streak-breaking labels
print("\n2️⃣ Creating streak-breaking labels...")

training_data = []

for _, user in features_df.iterrows():
    user_id = user['user_id']
    user_activities = activities_df[activities_df['user_id'] == user_id].sort_values('date')
    
    if len(user_activities) < 7:
        continue
    
    # Get streak information
    current_streak = user_activities['current_streak'].max()
    recent_completions = user_activities.tail(7)['completed_daily_goal'].values
    
    # Determine if streak will break (label)
    # Look at last 3 days - if any failures, streak broke
    last_3_days = user_activities.tail(3)['completed_daily_goal'].values
    streak_will_break = 1 if 0 in last_3_days else 0
    
    # Features
    completion_rate = user_activities['completed_daily_goal'].mean()
    recent_completion_rate = recent_completions.mean()
    avg_streak = user_activities['current_streak'].mean()
    
    training_data.append({
        'user_id': user_id,
        'current_streak': current_streak,
        'avg_streak': avg_streak,
        'completion_rate': completion_rate,
        'recent_completion_rate': recent_completion_rate,
        'days_active': user.get('days_active', 0),
        'avg_steps': user.get('avg_steps_last_7_days', 0),
        'meditation_minutes': user.get('avg_meditation_minutes', 0) if 'avg_meditation_minutes' in user else user.get('meditation_streak', 0),
        'social_score': user.get('social_engagement_score', 0),
        'challenge_completion': user.get('challenge_completion_rate', 0),
        # Target
        'streak_will_break': streak_will_break
    })

training_df = pd.DataFrame(training_data)
print(f"   Created {len(training_df)} training samples")
print(f"   Streak breaks: {training_df['streak_will_break'].sum()} ({training_df['streak_will_break'].mean():.1%})")

# Feature engineering
print("\n3️⃣ Feature engineering...")

training_df['streak_completion_interaction'] = (
    training_df['current_streak'] * training_df['completion_rate']
)
training_df['recent_trend'] = (
    training_df['recent_completion_rate'] - training_df['completion_rate']
)
training_df['steps_normalized'] = training_df['avg_steps'] / 10000

feature_cols = [
    'current_streak',
    'avg_streak',
    'completion_rate',
    'recent_completion_rate',
    'days_active',
    'avg_steps',
    'meditation_minutes',
    'social_score',
    'challenge_completion',
    'streak_completion_interaction',
    'recent_trend',
    'steps_normalized'
]

X = training_df[feature_cols].values
y = training_df['streak_will_break'].values

print(f"   Feature matrix: {X.shape}")
print(f"   Class distribution: {np.bincount(y)}")

# Split and scale
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, stratify=y, random_state=42
)

scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

print(f"   Train: {len(X_train)}, Test: {len(X_test)}")

# Train models
print("\n4️⃣ Training models...")

best_model = None
best_score = 0
best_name = ""

# Random Forest
print("\n   Random Forest:")
rf_configs = [
    {'n_estimators': 150, 'max_depth': 10, 'min_samples_leaf': 5},
    {'n_estimators': 200, 'max_depth': 12, 'min_samples_leaf': 4},
]

for i, config in enumerate(rf_configs, 1):
    model = RandomForestClassifier(
        class_weight='balanced',
        random_state=42,
        n_jobs=-1,
        **config
    )
    model.fit(X_train_scaled, y_train)
    score = accuracy_score(y_test, model.predict(X_test_scaled))
    print(f"     Config {i}: {score:.2%}")
    
    if score > best_score:
        best_score = score
        best_model = model
        best_name = f"RandomForest-{i}"

# Gradient Boosting
print("\n   Gradient Boosting:")
gb_configs = [
    {'n_estimators': 150, 'learning_rate': 0.1, 'max_depth': 5},
    {'n_estimators': 200, 'learning_rate': 0.08, 'max_depth': 6},
]

for i, config in enumerate(gb_configs, 1):
    model = GradientBoostingClassifier(random_state=42, **config)
    model.fit(X_train_scaled, y_train)
    score = accuracy_score(y_test, model.predict(X_test_scaled))
    print(f"     Config {i}: {score:.2%}")
    
    if score > best_score:
        best_score = score
        best_model = model
        best_name = f"GradientBoosting-{i}"

model = best_model
print(f"\n   ✓ Best model: {best_name} with {best_score:.2%} accuracy")

# Evaluate
print("\n5️⃣ Evaluation metrics...")
y_pred = model.predict(X_test_scaled)

print(f"   Test Accuracy:  {accuracy_score(y_test, y_pred):.2%}")
print(f"   Precision:      {precision_score(y_test, y_pred):.2%}")
print(f"   Recall:         {recall_score(y_test, y_pred):.2%}")
print(f"   F1 Score:       {f1_score(y_test, y_pred):.2%}")

# Cross-validation
cv_scores = cross_val_score(model, X_train_scaled, y_train, cv=5, scoring='f1')
print(f"   CV F1:          {cv_scores.mean():.2%} (+/- {cv_scores.std():.2%})")

# Feature importance
print("\n6️⃣ Top features:")
importances = sorted(zip(feature_cols, model.feature_importances_), 
                     key=lambda x: x[1], reverse=True)
for feat, imp in importances[:5]:
    print(f"   {feat:30s}: {imp:.3f}")

# Save
print("\n7️⃣ Saving model...")
os.makedirs('models/saved', exist_ok=True)
joblib.dump(model, 'models/saved/streak_predictor.pkl')
joblib.dump(scaler, 'models/saved/streak_scaler.pkl')

with open('models/saved/streak_features.txt', 'w') as f:
    f.write('\n'.join(feature_cols))

print("   ✓ Saved models/saved/streak_predictor.pkl")
print("   ✓ Saved models/saved/streak_scaler.pkl")

# Summary
print("\n" + "="*70)
print("✅ STREAK PREDICTOR COMPLETE")
print("="*70)
print(f"\n📊 Final: {best_score:.2%} accuracy, {f1_score(y_test, y_pred):.2%} F1")

if best_score > 0.75:
    print("✅ Excellent performance!")
elif best_score > 0.70:
    print("✅ Good performance")
else:
    print("⚠️  Acceptable performance")

print("="*70)
