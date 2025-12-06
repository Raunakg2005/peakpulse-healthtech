"""
Ensemble Model - Combine Multiple Models for Competition Edge
Voting classifier combining Logistic Regression + Random Forest + Gradient Boosting
"""
import pandas as pd
import numpy as np
import joblib
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier, VotingClassifier
from sklearn.model_selection import cross_val_score
from sklearn.metrics import accuracy_score, classification_report, f1_score
from sklearn.preprocessing import StandardScaler

print("="*70)
print("🚀 TRAINING ENSEMBLE MODEL - COMPETITION EDGE")
print("="*70)

# Load data
print("\n1️⃣ Loading combined dataset...")
df_perfect = pd.read_csv('data/features_perfect.csv')
df_noisy = pd.read_csv('data/features_noisy.csv')

with open('models/saved/feature_names.txt', 'r') as f:
    feature_names = [line.strip() for line in f.readlines()]

X_perfect = df_perfect[feature_names].values
y_perfect = (df_perfect['user_type'] == 'dropout').astype(int).values

X_noisy = df_noisy[feature_names].values
y_noisy = (df_noisy['user_type'] == 'dropout').astype(int).values

# Combined dataset
X_combined = np.vstack([X_perfect, X_noisy])
y_combined = np.hstack([y_perfect, y_noisy])

# Train/test split
from sklearn.model_selection import train_test_split
X_train, X_test, y_train, y_test = train_test_split(
    X_combined, y_combined, test_size=0.2, stratify=y_combined, random_state=42
)

# Scale
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)
X_perfect_scaled = scaler.transform(X_perfect)
X_noisy_scaled = scaler.transform(X_noisy)

print(f"   Combined: {len(X_combined)} samples")
print(f"   Train: {len(X_train)}, Test: {len(X_test)}")

# Create individual models
print("\n2️⃣ Building ensemble components...")

# Model 1: Logistic Regression (best generalizer)
logistic = LogisticRegression(
    C=0.1, 
    class_weight='balanced',
    max_iter=2000,
    random_state=42,
    solver='liblinear'
)

# Model 2: Random Forest (captures complex patterns)
rf = RandomForestClassifier(
    n_estimators=100,
    max_depth=10,
    min_samples_leaf=5,
    class_weight='balanced',
    random_state=42,
    max_features='sqrt'
)

# Model 3: Gradient Boosting (adaptive learning)
gb = GradientBoostingClassifier(
    n_estimators=100,
    learning_rate=0.1,
    max_depth=5,
    random_state=42
)

print("   ✓ Logistic Regression (C=0.1)")
print("   ✓ Random Forest (n=100, max_depth=10)")
print("   ✓ Gradient Boosting (n=100, lr=0.1)")

# Create ensemble
print("\n3️⃣ Creating voting ensemble...")
ensemble = VotingClassifier(
    estimators=[
        ('logistic', logistic),
        ('random_forest', rf),
        ('gradient_boosting', gb)
    ],
    voting='soft',  # Use probability voting
    weights=[2, 1, 1]  # Weight logistic regression more (best generalizer)
)

print("   ✓ Soft voting with weights [2, 1, 1]")

# Train ensemble
print("\n4️⃣ Training ensemble...")
ensemble.fit(X_train_scaled, y_train)
print("   ✓ Ensemble trained")

# Evaluate
print("\n" + "="*70)
print("📊 ENSEMBLE PERFORMANCE")
print("="*70)

# Test set
y_pred_test = ensemble.predict(X_test_scaled)
test_acc = accuracy_score(y_test, y_pred_test)
test_f1 = f1_score(y_test, y_pred_test)

print(f"\nCombined Test Set:")
print(f"  Accuracy:  {test_acc:.2%}")
print(f"  F1 Score:  {test_f1:.2%}")

# Perfect labels
y_pred_perfect = ensemble.predict(X_perfect_scaled)
acc_perfect = accuracy_score(y_perfect, y_pred_perfect)
f1_perfect = f1_score(y_perfect, y_pred_perfect)

print(f"\nPerfect Labels:")
print(f"  Accuracy:  {acc_perfect:.2%}")
print(f"  F1 Score:  {f1_perfect:.2%}")

# Noisy labels
y_pred_noisy = ensemble.predict(X_noisy_scaled)
acc_noisy = accuracy_score(y_noisy, y_pred_noisy)
f1_noisy = f1_score(y_noisy, y_pred_noisy)

print(f"\nNoisy Labels:")
print(f"  Accuracy:  {acc_noisy:.2%}")
print(f"  F1 Score:  {f1_noisy:.2%}")

gen_gap = abs(acc_perfect - acc_noisy)
avg_acc = (acc_perfect + acc_noisy) / 2

print(f"\n✅ Generalization Gap: {gen_gap*100:.1f}%")
print(f"✅ Average Accuracy:   {avg_acc*100:.1f}%")

# Compare with single robust model
print("\n" + "="*70)
print("📈 ENSEMBLE VS SINGLE MODEL")
print("="*70)

# Load robust model for comparison
robust_model = joblib.load('models/saved/dropout_predictor_ROBUST.pkl')

robust_acc_perfect = accuracy_score(y_perfect, robust_model.predict(X_perfect_scaled))
robust_acc_noisy = accuracy_score(y_noisy, robust_model.predict(X_noisy_scaled))
robust_gap = abs(robust_acc_perfect - robust_acc_noisy)
robust_avg = (robust_acc_perfect + robust_acc_noisy) / 2

print(f"\n                    Robust Model    Ensemble        Improvement")
print("-" * 70)
print(f"Perfect Labels:     {robust_acc_perfect*100:6.1f}%         {acc_perfect*100:6.1f}%         {(acc_perfect-robust_acc_perfect)*100:+5.1f}%")
print(f"Noisy Labels:       {robust_acc_noisy*100:6.1f}%         {acc_noisy*100:6.1f}%         {(acc_noisy-robust_acc_noisy)*100:+5.1f}%")
print(f"Gen Gap:            {robust_gap*100:6.1f}%         {gen_gap*100:6.1f}%         {(gen_gap-robust_gap)*100:+5.1f}%")
print(f"Average:            {robust_avg*100:6.1f}%         {avg_acc*100:6.1f}%         {(avg_acc-robust_avg)*100:+5.1f}%")

# Save ensemble
print("\n5️⃣ Saving ensemble model...")
joblib.dump(ensemble, 'models/saved/dropout_predictor_ENSEMBLE.pkl')
joblib.dump(scaler, 'models/saved/scaler_ENSEMBLE.pkl')
print("   ✓ Saved models/saved/dropout_predictor_ENSEMBLE.pkl")

# Final verdict
print("\n" + "="*70)
print("🎯 FINAL VERDICT")
print("="*70)

if avg_acc > robust_avg:
    improvement = (avg_acc - robust_avg) * 100
    print(f"\n✅ ENSEMBLE WINS: +{improvement:.1f}% average improvement!")
    print("   Use ensemble for competition demo")
else:
    print("\n⚠️  Single model performs similarly")
    print("   Ensemble adds complexity without significant gain")

if gen_gap < 0.10:
    print(f"\n✅ Excellent generalization: {gen_gap*100:.1f}% gap")
elif gen_gap < 0.15:
    print(f"\n✅ Good generalization: {gen_gap*100:.1f}% gap")
else:
    print(f"\n⚠️  Needs improvement: {gen_gap*100:.1f}% gap")

print("="*70)
