"""
Train Motivation Tone Selector Model
Predicts best message tone based on user state
Classes: encouraging, celebratory, challenging, supportive
"""
import pandas as pd
import numpy as np
import joblib
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import accuracy_score, f1_score, classification_report
import os

print("="*70)
print("💬 TRAINING MOTIVATION TONE SELECTOR")
print("="*70)

# Load data
print("\n1️⃣ Loading user data...")
features_df = pd.read_csv('data/features_enriched.csv')

print(f"   Users: {len(features_df)}")

# Create tone labels based on user state
print("\n2️⃣ Creating tone labels...")

def assign_tone(row):
    """Assign appropriate tone based on user characteristics"""
    completion_rate = row.get('challenge_completion_rate', 0)
    streak = row.get('behavioral_consistency', 0.5)
    social = row.get('social_engagement_score', 0)
    recent_trend = row.get('completion_trend', 0)
    momentum = row.get('engagement_momentum', 0)
    
    # Celebratory: high performers with positive momentum (top 20%)
    if completion_rate > 0.7 and (streak > 0.6 or momentum > 0.1):
        return 'celebratory'
    
    # Challenging: engaged users who respond to push (middle-high 30%)
    elif social > 0.5 and completion_rate > 0.5 and completion_rate <= 0.7:
        return 'challenging'
    
    # Supportive: struggling users or negative trends (bottom 25%)
    elif completion_rate < 0.5 or recent_trend < 0 or momentum < -0.05:
        return 'supportive'
    
    # Encouraging: moderate users (remaining ~25%)
    else:
        return 'encouraging'

features_df['tone'] = features_df.apply(assign_tone, axis=1)

print(f"   Tone distribution:")
print(features_df['tone'].value_counts())

# Features for tone selection
feature_cols = [
    'challenge_completion_rate',
    'behavioral_consistency',
    'social_engagement_score',
    'completion_trend',
    'steps_trend',
    'engagement_momentum',
    'days_active',
    'avg_steps_last_7_days',
    'social_interactions_count',
    'response_rate_to_notifications'
]

X = features_df[feature_cols].values
y = features_df['tone'].values

# Encode
label_encoder = LabelEncoder()
y_encoded = label_encoder.fit_transform(y)

print(f"\n3️⃣ Preparing features: {X.shape}")
print(f"   Classes: {label_encoder.classes_}")

# Split first
X_train, X_test, y_train, y_test = train_test_split(
    X, y_encoded, test_size=0.2, stratify=y_encoded, random_state=42
)

scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# SMOTE to balance celebratory class
print("\n4️⃣ Applying SMOTE to balance celebratory class...")
from imblearn.over_sampling import SMOTE

# Calculate target samples (balance all classes to mean)
unique, counts = np.unique(y_train, return_counts=True)
target_samples = int(np.mean(counts))

sampling_strategy = {cls: max(count, target_samples) for cls, count in zip(unique, counts)}

print(f"   Before SMOTE: {dict(zip(unique, counts))}")
smote = SMOTE(sampling_strategy=sampling_strategy, random_state=42, k_neighbors=2)
X_train_smote, y_train_smote = smote.fit_resample(X_train_scaled, y_train)
unique_after, counts_after = np.unique(y_train_smote, return_counts=True)
print(f"   After SMOTE:  {dict(zip(unique_after, counts_after))}")

print(f"   Train: {len(X_train_smote)}, Test: {len(X_test)}")

# Train models
print("\n5️⃣ Training models...")

best_model = None
best_score = 0
best_name = ""

# Random Forest
print("\n   Random Forest:")
rf_configs = [
    {'n_estimators': 150, 'max_depth': 10, 'min_samples_leaf': 3},
    {'n_estimators': 200, 'max_depth': 12, 'min_samples_leaf': 2},
]

for i, config in enumerate(rf_configs, 1):
    model = RandomForestClassifier(
        class_weight='balanced',
        random_state=42,
        n_jobs=-1,
        **config
    )
    model.fit(X_train_smote, y_train_smote)
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
    model.fit(X_train_smote, y_train_smote)
    score =accuracy_score(y_test, model.predict(X_test_scaled))
    print(f"     Config {i}: {score:.2%}")
    
    if score > best_score:
        best_score = score
        best_model = model
        best_name = f"GradientBoosting-{i}"

print(f"\n   ✓ Best model: {best_name} with {best_score:.2%}")

# Evaluate
print("\n5️⃣ Evaluation...")
y_pred = best_model.predict(X_test_scaled)

print(f"\n   Accuracy:    {accuracy_score(y_test, y_pred):.2%}")
print(f"   Macro F1:    {f1_score(y_test, y_pred, average='macro'):.2%}")

print("\n   Per-class:")
report = classification_report(y_test, y_pred, target_names=label_encoder.classes_, output_dict=True)
for class_name in label_encoder.classes_:
    metrics = report[class_name]
    print(f"     {class_name:15s}: F1={metrics['f1-score']:.2%}")

# Cross-validation
cv_scores = cross_val_score(best_model, X_train_smote, y_train_smote, cv=5, scoring='f1_macro')
print(f"\n   CV F1 (macro): {cv_scores.mean():.2%} (+/- {cv_scores.std():.2%})")

# Feature importance
print("\n6️⃣ Top features:")
importances = sorted(zip(feature_cols, best_model.feature_importances_), 
                     key=lambda x: x[1], reverse=True)
for feat, imp in importances[:5]:
    print(f"   {feat:35s}: {imp:.3f}")

# Save
print("\n7️⃣ Saving model...")
os.makedirs('models/saved', exist_ok=True)
joblib.dump(best_model, 'models/saved/tone_selector.pkl')
joblib.dump(scaler, 'models/saved/tone_scaler.pkl')
joblib.dump(label_encoder, 'models/saved/tone_label_encoder.pkl')

with open('models/saved/tone_features.txt', 'w') as f:
    f.write('\n'.join(feature_cols))

print("   ✓ Saved models/saved/tone_selector.pkl")

# Summary
print("\n" + "="*70)
print("✅ TONE SELECTOR COMPLETE")
print("="*70)
print(f"\n📊 Final: {best_score:.2%} accuracy, {f1_score(y_test, y_pred, average='macro'):.2%} macro-F1")

if best_score > 0.75:
    print("✅ Excellent tone prediction!")
elif best_score > 0.65:
    print("✅ Good performance")
else:
    print("⚠️  Acceptable for 4-class")

print("="*70)
