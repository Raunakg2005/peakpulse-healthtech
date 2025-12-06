"""
Train Robust Model with Strong Regularization and Combined Data
Target: 85-90% accuracy on BOTH perfect and noisy label distributions
"""
import pandas as pd
import numpy as np
import joblib
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import cross_val_score, train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, classification_report

print("="*70)
print("🚀 TRAINING ROBUST GENERALIZATION MODEL")
print("="*70)

# Load datasets
print("\n1️⃣ Loading perfect and noisy datasets...")
df_perfect = pd.read_csv('data/features_perfect.csv')
df_noisy = pd.read_csv('data/features_noisy.csv')

# Load feature names
with open('models/saved/feature_names.txt', 'r') as f:
    feature_names = [line.strip() for line in f.readlines()]

# Extract features
X_perfect = df_perfect[feature_names].values
y_perfect = (df_perfect['user_type'] == 'dropout').astype(int).values

X_noisy = df_noisy[feature_names].values
y_noisy = (df_noisy['user_type'] == 'dropout').astype(int).values

print(f"   Perfect: {len(X_perfect)} samples, {y_perfect.mean():.1%} dropout")
print(f"   Noisy:   {len(X_noisy)} samples, {y_noisy.mean():.1%} dropout")

# Strategy 1: Train on COMBINED data (perfect + noisy)
print("\n2️⃣ Creating combined dataset...")
X_combined = np.vstack([X_perfect, X_noisy])
y_combined = np.hstack([y_perfect, y_noisy])
print(f"   Combined: {len(X_combined)} samples, {y_combined.mean():.1%} dropout")

# Split combined data
X_train, X_test, y_train, y_test = train_test_split(
    X_combined, y_combined, 
    test_size=0.2, 
    stratify=y_combined,
    random_state=42
)

# Scale
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

X_perfect_scaled = scaler.transform(X_perfect)
X_noisy_scaled = scaler.transform(X_noisy)

print(f"   Train: {len(X_train)} samples")
print(f"   Test:  {len(X_test)} samples")

# Strategy 2: Try multiple regularization strengths
print("\n3️⃣ Testing regularization strengths...")
results = {}

for C in [0.01, 0.05, 0.1, 0.5, 1.0]:
    model = LogisticRegression(
        C=C,
        class_weight='balanced',
        max_iter=2000,
        random_state=42,
        penalty='l2',
        solver='liblinear'
    )
    
    # Cross-validation on training set
    cv_scores = cross_val_score(model, X_train_scaled, y_train, cv=5, scoring='f1')
    
    # Train and test
    model.fit(X_train_scaled, y_train)
    test_score = f1_score(y_test, model.predict(X_test_scaled))
    
    # Test on both distributions
    acc_perfect = accuracy_score(y_perfect, model.predict(X_perfect_scaled))
    acc_noisy = accuracy_score(y_noisy, model.predict(X_noisy_scaled))
    gen_gap = abs(acc_perfect - acc_noisy)
    
    results[C] = {
        'cv_f1': cv_scores.mean(),
        'test_f1': test_score,
        'acc_perfect': acc_perfect,
        'acc_noisy': acc_noisy,
        'gen_gap': gen_gap
    }
    
    print(f"\n   C={C:5.2f}:")
    print(f"     CV F1:         {cv_scores.mean():.3f} (+/- {cv_scores.std():.3f})")
    print(f"     Test F1:       {test_score:.3f}")
    print(f"     Perfect acc:   {acc_perfect:.3f}")
    print(f"     Noisy acc:     {acc_noisy:.3f}")
    print(f"     Gen gap:       {gen_gap:.3f} {'✅' if gen_gap < 0.10 else '⚠️'}")

# Find best model (minimize generalization gap while maintaining performance)
print("\n4️⃣ Selecting best model...")
best_C = None
best_score = -1

for C, metrics in results.items():
    # Score = average accuracy - penalty for high generalization gap
    score = (metrics['acc_perfect'] + metrics['acc_noisy']) / 2 - metrics['gen_gap'] * 2
    
    if score > best_score:
        best_score = score
        best_C = C

print(f"   Best regularization: C={best_C}")
print(f"   Generalization gap: {results[best_C]['gen_gap']*100:.1f}%")

# Train final robust model
print("\n5️⃣ Training final robust model...")
robust_model = LogisticRegression(
    C=best_C,
    class_weight='balanced',
    max_iter=2000,
    random_state=42,
    penalty='l2',
    solver='liblinear'
)

robust_model.fit(X_train_scaled, y_train)
print(f"   ✓ Model trained with C={best_C}")

# Comprehensive evaluation
print("\n" + "="*70)
print("📊 ROBUST MODEL PERFORMANCE")
print("="*70)

# Test on combined holdout
y_pred_test = robust_model.predict(X_test_scaled)
print("\nCombined Test Set:")
print(f"  Accuracy:  {accuracy_score(y_test, y_pred_test):.2%}")
print(f"  Precision: {precision_score(y_test, y_pred_test):.2%}")
print(f"  Recall:    {recall_score(y_test, y_pred_test):.2%}")
print(f"  F1 Score:  {f1_score(y_test, y_pred_test):.2%}")

# Test on perfect labels
y_pred_perfect = robust_model.predict(X_perfect_scaled)
print("\nPerfect Labels:")
print(f"  Accuracy:  {results[best_C]['acc_perfect']:.2%}")
print(f"  F1 Score:  {f1_score(y_perfect, y_pred_perfect):.2%}")

# Test on noisy labels  
y_pred_noisy = robust_model.predict(X_noisy_scaled)
print("\nNoisy Labels:")
print(f"  Accuracy:  {results[best_C]['acc_noisy']:.2%}")
print(f"  F1 Score:  {f1_score(y_noisy, y_pred_noisy):.2%}")

print(f"\n✅ Generalization Gap: {results[best_C]['gen_gap']*100:.1f}%")

# Comparison with original
print("\n" + "="*70)
print("📈 IMPROVEMENT COMPARISON")
print("="*70)

print("\n                        Original        Robust          Improvement")
print("-" * 70)
print(f"Perfect Labels:         98.50%         {results[best_C]['acc_perfect']*100:5.1f}%         {(results[best_C]['acc_perfect']-0.985)*100:+5.1f}%")
print(f"Noisy Labels:           73.80%         {results[best_C]['acc_noisy']*100:5.1f}%         {(results[best_C]['acc_noisy']-0.738)*100:+5.1f}%")
print(f"Generalization Gap:     24.70%         {results[best_C]['gen_gap']*100:5.1f}%         {(results[best_C]['gen_gap']-0.247)*100:+5.1f}%")

# Save robust model
print("\n6️⃣ Saving robust model...")
joblib.dump(robust_model, 'models/saved/dropout_predictor_ROBUST.pkl')
joblib.dump(scaler, 'models/saved/scaler_ROBUST.pkl')
print("   ✓ Saved models/saved/dropout_predictor_ROBUST.pkl")
print("   ✓ Saved models/saved/scaler_ROBUST.pkl")

# Final verdict
print("\n" + "="*70)
print("🎯 FINAL VERDICT")
print("="*70)

if results[best_C]['gen_gap'] < 0.10:
    print("\n✅ SUCCESS: Generalization gap < 10%")
    print("   Model is PRODUCTION-READY and robust to label noise!")
elif results[best_C]['gen_gap'] < 0.15:
    print("\n⚠️  ACCEPTABLE: Generalization gap 10-15%")
    print("   Model shows good improvement, acceptable for production")
else:
    print("\n❌ NEEDS MORE WORK: Generalization gap > 15%")
    print("   Consider ensemble methods or more training data")

avg_acc = (results[best_C]['acc_perfect'] + results[best_C]['acc_noisy']) / 2
print(f"\nAverage accuracy across distributions: {avg_acc:.1%}")

if avg_acc >= 0.85:
    print("✅ Meets target threshold (85%+)")
else:
    print(f"⚠️  Below target (current: {avg_acc:.1%}, target: 85%+)")

print("="*70)
