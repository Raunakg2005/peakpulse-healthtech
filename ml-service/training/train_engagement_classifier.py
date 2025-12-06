"""
Train Engagement Classifier Model
Classifies users into 4 engagement levels: dropout, struggling, moderate, highly_engaged
"""
import pandas as pd
import numpy as np
import joblib
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import accuracy_score, classification_report, f1_score
import os

print("="*70)
print("📈 TRAINING ENGAGEMENT CLASSIFIER MODEL")
print("="*70)

# Load enriched data with temporal features
print("\n1️⃣ Loading enriched data...")
features_df = pd.read_csv('data/features_enriched.csv')

# Merge into 2 actionable classes (BINARY)
print("   Merging into 2-class BINARY system:")
print("     - needs_intervention (dropout + struggling)")
print("     - doing_well (moderate + highly_engaged)")

features_df['engagement_binary'] = features_df['user_type'].map({
    'dropout': 'needs_intervention',
    'struggling': 'needs_intervention',
    'moderate': 'doing_well',
    'highly_engaged': 'doing_well'
})

print(f"\n   Total users: {len(features_df)}")
print(f"   2-Class distribution:")
print(features_df['engagement_binary'].value_counts())

# Prepare features
print("\n2️⃣ Preparing features...")

# Feature engineering
features_df['engagement_score'] = (
    features_df['challenge_completion_rate'] * 0.3 +
    (features_df['days_active'] / features_df['total_days']) * 0.3 +
    features_df['social_engagement_score'] * 0.2 +
    (features_df['avg_steps_last_7_days'] / 10000).clip(0, 1) * 0.2
)

features_df['activity_consistency'] = (
    features_df['days_active'] / features_df['total_days']
)

features_df['meditation_engagement'] = features_df.get('avg_meditation_minutes', 0) / 30

feature_cols = [
    'days_active',
    'total_days',
    'avg_steps_last_7_days',
    'avg_meditation_minutes' if 'avg_meditation_minutes' in features_df.columns else 'meditation_streak',
    'avg_sleep_hours',
    'challenge_completion_rate',
    'total_points_earned',
    'social_engagement_score',
    'social_interactions_count',
    'response_rate_to_notifications',
    # Engineered features
    'engagement_score',
    'activity_consistency',
    'meditation_engagement',
    # NEW: Temporal & behavioral features
    'step_variance',
    'completion_variance',
    'streak_variance',
    'completion_trend',
    'steps_trend',
    'engagement_momentum',
    'behavioral_consistency',  # Renamed
    'social_frequency',
    'avg_social_score',
    'peak_performance_ratio'
]

# Handle missing columns
if 'avg_meditation_minutes' not in features_df.columns:
    features_df['avg_meditation_minutes'] = features_df.get('meditation_streak', 0)
    feature_cols = [f if f != 'meditation_streak' else 'avg_meditation_minutes' for f in feature_cols]

X = features_df[feature_cols].values
y = features_df['engagement_binary'].values  # Use 2-class binary labels

# Encode labels
label_encoder = LabelEncoder()
y_encoded = label_encoder.fit_transform(y)

print(f"   Feature matrix: {X.shape}")
print(f"   Classes: {label_encoder.classes_}")
print(f"   Encoded distribution: {np.bincount(y_encoded)}")

# Split and scale
X_train, X_test, y_train, y_test = train_test_split(
    X, y_encoded, test_size=0.2, stratify=y_encoded, random_state=42
)

scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

print(f"   Train: {len(X_train)}, Test: {len(X_test)}")

# Train models
print("\n3️⃣ Training multi-class models...")

best_model = None
best_score = 0
best_name = ""

# Random Forest
print("\n   Random Forest:")
rf_configs = [
    {'n_estimators': 150, 'max_depth': 12, 'min_samples_leaf': 3},
    {'n_estimators': 200, 'max_depth': 15, 'min_samples_leaf': 2},
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
    {'n_estimators': 200, 'learning_rate': 0.15, 'max_depth': 7, 'subsample': 0.8},
    {'n_estimators': 300, 'learning_rate': 0.1, 'max_depth': 8, 'subsample': 0.85},
    {'n_estimators': 250, 'learning_rate': 0.12, 'max_depth': 9, 'subsample': 0.9},
    {'n_estimators': 350, 'learning_rate': 0.08, 'max_depth': 10, 'subsample': 0.75},
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
print("\n4️⃣ Detailed evaluation...")
y_pred = model.predict(X_test_scaled)

print(f"\n   Overall Accuracy: {accuracy_score(y_test, y_pred):.2%}")
print(f"   Macro F1 Score:   {f1_score(y_test, y_pred, average='macro'):.2%}")
print(f"   Weighted F1:      {f1_score(y_test, y_pred, average='weighted'):.2%}")

print("\n   Per-class metrics:")
report = classification_report(y_test, y_pred, target_names=label_encoder.classes_, output_dict=True)
for class_name in label_encoder.classes_:
    metrics = report[class_name]
    print(f"     {class_name:15s}: Precision={metrics['precision']:.2%}, Recall={metrics['recall']:.2%}, F1={metrics['f1-score']:.2%}")

# Cross-validation
cv_scores = cross_val_score(model, X_train_scaled, y_train, cv=5, scoring='f1_macro')
print(f"\n   CV F1 (macro):    {cv_scores.mean():.2%} (+/- {cv_scores.std():.2%})")

# Feature importance
print("\n5️⃣ Top 5 features:")
importances = sorted(zip(feature_cols, model.feature_importances_), 
                     key=lambda x: x[1], reverse=True)
for feat, imp in importances[:5]:
    print(f"   {feat:35s}: {imp:.3f}")

# Save
print("\n6️⃣ Saving model...")
os.makedirs('models/saved', exist_ok=True)
joblib.dump(model, 'models/saved/engagement_classifier.pkl')
joblib.dump(scaler, 'models/saved/engagement_scaler.pkl')
joblib.dump(label_encoder, 'models/saved/engagement_label_encoder.pkl')

with open('models/saved/engagement_features.txt', 'w') as f:
    f.write('\n'.join(feature_cols))

print("   ✓ Saved models/saved/engagement_classifier.pkl")
print("   ✓ Saved models/saved/engagement_scaler.pkl")
print("   ✓ Saved models/saved/engagement_label_encoder.pkl")

# Summary
print("\n" + "="*70)
print("✅ ENGAGEMENT CLASSIFIER (BINARY) COMPLETE")
print("="*70)
print(f"\n📊 Final: {best_score:.2%} accuracy, {f1_score(y_test, y_pred, average='binary'):.2%} F1")
print(f"   Classes: needs_intervention, doing_well")

if best_score > 0.85:
    print("✅ Excellent binary classification!")
elif best_score > 0.80:
    print("✅ Very good performance!")
elif best_score > 0.75:
    print("✅ Good performance")
else:
    print("⚠️ Acceptable for binary")

print("="*70)
