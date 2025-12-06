"""
Train Difficulty Predictor Model
Predicts optimal challenge difficulty level (1-5) based on user performance
"""
import pandas as pd
import numpy as np
import joblib
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import os

print("="*70)
print("🎯 TRAINING DIFFICULTY PREDICTOR")
print("="*70)

# Load data
print("\n1️⃣ Loading user data...")
features_df = pd.read_csv('data/features_enriched.csv')

print(f"   Users: {len(features_df)}")

# Create optimal difficulty target
print("\n2️⃣ Creating optimal difficulty labels...")

def optimal_difficulty(row):
    """Calculate optimal difficulty based on performance"""
    completion_rate = row.get('challenge_completion_rate', 0.5)
    consistency = row.get('behavioral_consistency', 0.5)
    momentum = row.get('engagement_momentum', 0)
    social = row.get('social_engagement_score', 0.5)
    
    # Base difficulty on completion rate
    if completion_rate > 0.85:
        base = 5  # Very Hard
    elif completion_rate > 0.7:
        base = 4  # Hard
    elif completion_rate > 0.5:
        base = 3  # Medium
    elif completion_rate > 0.3:
        base = 2  # Easy
    else:
        base = 1  # Very Easy
    
    # Adjust for consistency and momentum
    if consistency > 0.7 and momentum > 0:
        base = min(5, base + 0.5)  # Increase slightly
    elif consistency < 0.4 or momentum < -0.1:
        base = max(1, base - 0.5)  # Decrease slightly
    
    # Clip to 1-5 range
    return np.clip(base, 1, 5)

features_df['optimal_difficulty'] = features_df.apply(optimal_difficulty, axis=1)

print(f"   Difficulty distribution:")
print(features_df['optimal_difficulty'].value_counts().sort_index())

# Features for difficulty prediction
feature_cols = [
    'challenge_completion_rate',
    'behavioral_consistency',
    'engagement_momentum',
    'completion_trend',
    'steps_trend',
    'social_engagement_score',
    'days_active',
    'avg_steps_last_7_days',
    'social_interactions_count',
    'response_rate_to_notifications'
]

X = features_df[feature_cols].values
y = features_df['optimal_difficulty'].values

print(f"\n3️⃣ Preparing features: {X.shape}")

# Split and scale
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

print(f"   Train: {len(X_train)}, Test: {len(X_test)}")

# Train regression models
print("\n4️⃣ Training regression models...")

best_model = None
best_score = float('inf')  # MAE (lower is better)
best_name = ""

# Random Forest Regressor
print("\n   Random Forest Regressor:")
rf_configs = [
    {'n_estimators': 150, 'max_depth': 10, 'min_samples_leaf': 3},
    {'n_estimators': 200, 'max_depth': 12, 'min_samples_leaf': 2},
]

for i, config in enumerate(rf_configs, 1):
    model = RandomForestRegressor(
        random_state=42,
        n_jobs=-1,
        **config
    )
    model.fit(X_train_scaled, y_train)
    y_pred = model.predict(X_test_scaled)
    mae = mean_absolute_error(y_test, y_pred)
    print(f"     Config {i}: MAE={mae:.3f}")
    
    if mae < best_score:
        best_score = mae
        best_model = model
        best_name = f"RandomForest-{i}"

# Gradient Boosting Regressor
print("\n   Gradient Boosting Regressor:")
gb_configs = [
    {'n_estimators': 150, 'learning_rate': 0.1, 'max_depth': 5},
    {'n_estimators': 200, 'learning_rate': 0.08, 'max_depth': 6},
]

for i, config in enumerate(gb_configs, 1):
    model = GradientBoostingRegressor(random_state=42, **config)
    model.fit(X_train_scaled, y_train)
    y_pred = model.predict(X_test_scaled)
    mae = mean_absolute_error(y_test, y_pred)
    print(f"     Config {i}: MAE={mae:.3f}")
    
    if mae < best_score:
        best_score = mae
        best_model = model
        best_name = f"GradientBoosting-{i}"

print(f"\n   ✓ Best model: {best_name} with MAE={best_score:.3f}")

# Evaluate
print("\n5️⃣ Evaluation...")
y_pred = best_model.predict(X_test_scaled)

# Clip predictions to 1-5 range
y_pred_clipped = np.clip(y_pred, 1, 5)

mae = mean_absolute_error(y_test, y_pred_clipped)
rmse = np.sqrt(mean_squared_error(y_test, y_pred_clipped))
r2 = r2_score(y_test, y_pred_clipped)

print(f"\n   MAE (Mean Absolute Error): {mae:.3f}")
print(f"   RMSE (Root Mean Squared):  {rmse:.3f}")
print(f"   R² Score:                  {r2:.3f}")

# Check accuracy within 1 difficulty level
within_1 = np.mean(np.abs(y_test - y_pred_clipped) <= 1.0)
print(f"   Accuracy within ±1 level:  {within_1:.1%}")

# Cross-validation
cv_scores = -cross_val_score(best_model, X_train_scaled, y_train, cv=5, scoring='neg_mean_absolute_error')
print(f"\n   CV MAE: {cv_scores.mean():.3f} (+/- {cv_scores.std():.3f})")

# Feature importance
print("\n6️⃣ Top features:")
importances = sorted(zip(feature_cols, best_model.feature_importances_), 
                     key=lambda x: x[1], reverse=True)
for feat, imp in importances[:5]:
    print(f"   {feat:35s}: {imp:.3f}")

# Save
print("\n7️⃣ Saving model...")
os.makedirs('models/saved', exist_ok=True)
joblib.dump(best_model, 'models/saved/difficulty_predictor.pkl')
joblib.dump(scaler, 'models/saved/difficulty_scaler.pkl')

with open('models/saved/difficulty_features.txt', 'w') as f:
    f.write('\n'.join(feature_cols))

print("   ✓ Saved models/saved/difficulty_predictor.pkl")

# Summary
print("\n" + "="*70)
print("✅ DIFFICULTY PREDICTOR COMPLETE")
print("="*70)
print(f"\n📊 Final MAE: {mae:.3f} (avg error in difficulty levels)")
print(f"   Within ±1 level: {within_1:.1%}")

if mae < 0.3 and within_1 > 0.95:
    print("\n✅ Excellent difficulty prediction!")
elif mae < 0.5 and within_1 > 0.90:
    print("\n✅ Very good performance")
elif mae < 0.8:
    print("\n✅ Good performance")
else:
    print("\n⚠️  Acceptable")

print("="*70)
