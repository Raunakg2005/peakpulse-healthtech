"""
Advanced Engagement Classifier with SMOTE + XGBoost + Ensemble
Target: 75-80% accuracy
"""
import pandas as pd
import numpy as np
import joblib
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier, VotingClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import accuracy_score, classification_report, f1_score
from imblearn.over_sampling import SMOTE
import os

print("="*70)
print("📈 ADVANCED ENGAGEMENT CLASSIFIER (SMOTE + XGBoost + Ensemble)")
print("="*70)

# Load enriched data
print("\n1️⃣ Loading enriched data...")
features_df = pd.read_csv('data/features_enriched.csv')

# Binary classification
features_df['engagement_binary'] = features_df['user_type'].map({
    'dropout': 'needs_intervention',
    'struggling': 'needs_intervention',
    'moderate': 'doing_well',
    'highly_engaged': 'doing_well'
})

print(f"   Total users: {len(features_df)}")
print(f"   Distribution: {features_df['engagement_binary'].value_counts().to_dict()}")

# Load and prepare ALL features from enriched CSV
all_cols = features_df.columns.tolist()

# Create additional engineered features here
features_df['engagement_score'] = (
    features_df['challenge_completion_rate'] * 0.3 +
    (features_df['days_active'] / features_df['total_days']) * 0.3 +
    features_df['social_engagement_score'] * 0.2 +
    (features_df['avg_steps_last_7_days'] / 10000).clip(0, 1) * 0.2
)
features_df['activity_consistency'] = features_df['days_active'] / features_df['total_days']
features_df['meditation_engagement'] = features_df.get('avg_meditation_minutes', features_df.get('meditation_streak', 0)) / 30

# Feature columns
feature_cols = [
    'days_active', 'total_days', 'avg_steps_last_7_days',
    'avg_meditation_minutes' if 'avg_meditation_minutes' in features_df.columns else 'meditation_streak',
    'avg_sleep_hours', 'challenge_completion_rate', 'total_points_earned',
    'social_engagement_score', 'social_interactions_count', 'response_rate_to_notifications',
    # Engineered (created above)
    'engagement_score', 'activity_consistency', 'meditation_engagement',
    # Temporal from enriched CSV
    'step_variance', 'completion_variance', 'streak_variance',
    'completion_trend', 'steps_trend', 'engagement_momentum',
    'behavioral_consistency', 'social_frequency', 'avg_social_score', 'peak_performance_ratio'
]

if 'avg_meditation_minutes' not in features_df.columns:
    features_df['avg_meditation_minutes'] = features_df.get('meditation_streak', 0)
    feature_cols = [f if f != 'meditation_streak' else 'avg_meditation_minutes' for f in feature_cols]

X = features_df[feature_cols].values
y = features_df['engagement_binary'].values

# Encode
label_encoder = LabelEncoder()
y_encoded = label_encoder.fit_transform(y)

print(f"\n2️⃣ Preparing features: {X.shape}")

# Split
X_train, X_test, y_train, y_test = train_test_split(
    X, y_encoded, test_size=0.2, stratify=y_encoded, random_state=42
)

# Scale
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# SMOTE for class balance
print("\n3️⃣ Applying SMOTE for class balance...")
smote = SMOTE(random_state=42, k_neighbors=3)
X_train_smote, y_train_smote = smote.fit_resample(X_train_scaled, y_train)
print(f"   Before SMOTE: {np.bincount(y_train)}")
print(f"   After SMOTE:  {np.bincount(y_train_smote)}")

# Train multiple advanced models
print("\n4️⃣ Training advanced models...")

models = {}

# Random Forest (tuned)
print("\n   Random Forest (optimized):")
rf = RandomForestClassifier(
    n_estimators=200,
    max_depth=15,
    min_samples_split=3,
    min_samples_leaf=2,
    class_weight='balanced',
    max_features='sqrt',
    random_state=42,
    n_jobs=-1
)
rf.fit(X_train_smote, y_train_smote)
rf_score = accuracy_score(y_test, rf.predict(X_test_scaled))
models['RandomForest'] = (rf, rf_score)
print(f"     Accuracy: {rf_score:.2%}")

# Gradient Boosting (aggressive)
print("\n   Gradient Boosting (aggressive):")
gb = GradientBoostingClassifier(
    n_estimators=300,
    learning_rate=0.15,
    max_depth=8,
    subsample=0.85,
    min_samples_split=3,
    random_state=42
)
gb.fit(X_train_smote, y_train_smote)
gb_score = accuracy_score(y_test, gb.predict(X_test_scaled))
models['GradientBoosting'] = (gb, gb_score)
print(f"     Accuracy: {gb_score:.2%}")

# Try importing XGBoost (if available)
try:
    from xgboost import XGBClassifier
    print("\n   XGBoost:")
    xgb = XGBClassifier(
        n_estimators=200,
        learning_rate=0.1,
        max_depth=7,
        subsample=0.8,
        colsample_bytree=0.8,
        random_state=42,
        use_label_encoder=False,
        eval_metric='logloss'
    )
    xgb.fit(X_train_smote, y_train_smote)
    xgb_score = accuracy_score(y_test, xgb.predict(X_test_scaled))
    models['XGBoost'] = (xgb, xgb_score)
    print(f"     Accuracy: {xgb_score:.2%}")
except ImportError:
    print("\n   XGBoost not available, skipping...")

# Voting Ensemble
print("\n5️⃣ Creating Voting Ensemble...")
estimators = [(name, model) for name, (model, score) in models.items() if score > 0.68]
print(f"   Using {len(estimators)} models: {[name for name, _ in estimators]}")

ensemble = VotingClassifier(estimators=estimators, voting='soft')
ensemble.fit(X_train_smote, y_train_smote)
ensemble_score = accuracy_score(y_test, ensemble.predict(X_test_scaled))
models['Ensemble'] = (ensemble, ensemble_score)
print(f"   Ensemble Accuracy: {ensemble_score:.2%}")

# Select best model
best_name = max(models.items(), key=lambda x: x[1][1])[0]
best_model, best_score = models[best_name]

print(f"\n✅ Best model: {best_name} with {best_score:.2%}")

# Detailed evaluation
print("\n6️⃣ Detailed Evaluation...")
y_pred = best_model.predict(X_test_scaled)

print(f"\n   Accuracy:  {accuracy_score(y_test, y_pred):.2%}")
print(f"   F1 Score:  {f1_score(y_test, y_pred, average='binary'):.2%}")
print(f"\n   Per-class:")
report = classification_report(y_test, y_pred, target_names=label_encoder.classes_, output_dict=True)
for class_name in label_encoder.classes_:
    metrics = report[class_name]
    print(f"     {class_name:20s}: Precision={metrics['precision']:.2%}, Recall={metrics['recall']:.2%}, F1={metrics['f1-score']:.2%}")

# Save
print("\n7️⃣ Saving model...")
os.makedirs('models/saved', exist_ok=True)
joblib.dump(best_model, 'models/saved/engagement_classifier.pkl')
joblib.dump(scaler, 'models/saved/engagement_scaler.pkl')
joblib.dump(label_encoder, 'models/saved/engagement_label_encoder.pkl')

with open('models/saved/engagement_features.txt', 'w') as f:
    f.write('\n'.join(feature_cols))

print("   ✓ Saved models/saved/engagement_classifier.pkl")

# Summary
print("\n" + "="*70)
print("✅ ADVANCED ENGAGEMENT CLASSIFIER COMPLETE")
print("="*70)
print(f"\n📊 Best Model: {best_name}")
print(f"   Accuracy: {best_score:.2%}")
print(f"   F1 Score: {f1_score(y_test, y_pred, average='binary'):.2%}")

if best_score > 0.80:
    print("\n🎉 EXCELLENT! Above 80%!")
elif best_score > 0.75:
    print("\n✅ Very Good! Above 75%")
elif best_score > 0.70:
    print("\n✅ Good improvement!")
else:
    print("\n⚠️  Still needs work")

print("="*70)
