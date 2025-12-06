"""
Test Perfect Model on Noisy Data - Complete the Cross-Evaluation Matrix
"""
import pandas as pd
import numpy as np
import joblib
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, classification_report

print("="*70)
print("🔬 COMPLETE CROSS-EVALUATION MATRIX")
print("="*70)

# Load both models
print("\n1️⃣ Loading models...")
try:
    model_trained_on_perfect = joblib.load('models/saved/dropout_predictor_PERFECT.pkl')
    print("   ✓ Perfect model loaded")
except:
    print("   ⚠️  Perfect model not found, using current (noisy-trained) model")
    model_trained_on_perfect = None

model_trained_on_noisy = joblib.load('models/saved/dropout_predictor.pkl')
print("   ✓ Noisy model loaded")

# Load scaler (from noisy training - we'll need this)
scaler = joblib.load('models/saved/scaler.pkl')
print("   ✓ Scaler loaded")

# Load feature names
with open('models/saved/feature_names.txt', 'r') as f:
    feature_names = [line.strip() for line in f.readlines()]

# Load datasets
print("\n2️⃣ Loading datasets...")
df_perfect = pd.read_csv('data/features_perfect.csv')
df_noisy = pd.read_csv('data/features_noisy.csv')

X_perfect = df_perfect[feature_names]
y_perfect = (df_perfect['user_type'] == 'dropout').astype(int)

X_noisy = df_noisy[feature_names]
y_noisy = (df_noisy['user_type'] == 'dropout').astype(int)

# Scale
X_perfect_scaled = scaler.transform(X_perfect)
X_noisy_scaled = scaler.transform(X_noisy)

print(f"   Perfect: {len(df_perfect)} users, {y_perfect.mean():.1%} dropout")
print(f"   Noisy:   {len(df_noisy)} users, {y_noisy.mean():.1%} dropout")

# Create cross-evaluation matrix
print("\n" + "="*70)
print("📊 CROSS-EVALUATION RESULTS")
print("="*70)

results = {}

# 1. Noisy model on Perfect data (already know this: 73.8%)
print("\n1️⃣ Noisy-Trained Model → Perfect Labels:")
y_pred = model_trained_on_noisy.predict(X_perfect_scaled)
acc = accuracy_score(y_perfect, y_pred)
prec = precision_score(y_perfect, y_pred)
rec = recall_score(y_perfect, y_pred)
f1 = f1_score(y_perfect, y_pred)
print(f"   Accuracy:  {acc:.2%}")
print(f"   Precision: {prec:.2%}")
print(f"   Recall:    {rec:.2%}")
print(f"   F1 Score:  {f1:.2%}")
results['noisy_model_perfect_data'] = {'acc': acc, 'prec': prec, 'rec': rec, 'f1': f1}

# 2. Noisy model on Noisy data (already know this: 98.5%)
print("\n2️⃣ Noisy-Trained Model → Noisy Labels:")
y_pred = model_trained_on_noisy.predict(X_noisy_scaled)
acc = accuracy_score(y_noisy, y_pred)
prec = precision_score(y_noisy, y_pred)
rec = recall_score(y_noisy, y_pred)
f1 = f1_score(y_noisy, y_pred)
print(f"   Accuracy:  {acc:.2%}")
print(f"   Precision: {prec:.2%}")
print(f"   Recall:    {rec:.2%}")
print(f"   F1 Score:  {f1:.2%}")
results['noisy_model_noisy_data'] = {'acc': acc, 'prec': prec, 'rec': rec, 'f1': f1}

# 3. Perfect model on Perfect data (if available)
if model_trained_on_perfect:
    print("\n3️⃣ Perfect-Trained Model → Perfect Labels:")
    y_pred = model_trained_on_perfect.predict(X_perfect_scaled)
    acc = accuracy_score(y_perfect, y_pred)
    prec = precision_score(y_perfect, y_pred)
    rec = recall_score(y_perfect, y_pred)
    f1 = f1_score(y_perfect, y_pred)
    print(f"   Accuracy:  {acc:.2%}")
    print(f"   Precision: {prec:.2%}")
    print(f"   Recall:    {rec:.2%}")
    print(f"   F1 Score:  {f1:.2%}")
    results['perfect_model_perfect_data'] = {'acc': acc, 'prec': prec, 'rec': rec, 'f1': f1}
    
    # 4. Perfect model on Noisy data (THE CRITICAL TEST!)
    print("\n4️⃣ Perfect-Trained Model → Noisy Labels:")
    y_pred = model_trained_on_perfect.predict(X_noisy_scaled)
    acc = accuracy_score(y_noisy, y_pred)
    prec = precision_score(y_noisy, y_pred)
    rec = recall_score(y_noisy, y_pred)
    f1 = f1_score(y_noisy, y_pred)
    print(f"   Accuracy:  {acc:.2%}")
    print(f"   Precision: {prec:.2%}")
    print(f"   Recall:    {rec:.2%}")
    print(f"   F1 Score:  {f1:.2%}")
    results['perfect_model_noisy_data'] = {'acc': acc, 'prec': prec, 'rec': rec, 'f1': f1}

# Summary Matrix
print("\n" + "="*70)
print("📋 CROSS-EVALUATION MATRIX SUMMARY")
print("="*70)
print("\n                          Perfect Labels    Noisy Labels")
print("-" * 70)

if model_trained_on_perfect:
    print(f"Perfect-Trained Model:    {results['perfect_model_perfect_data']['acc']*100:6.2f}%          {results['perfect_model_noisy_data']['acc']*100:6.2f}%")
    gen_gap_perfect = abs(results['perfect_model_perfect_data']['acc'] - results['perfect_model_noisy_data']['acc'])
    print(f"  → Generalization gap:   {gen_gap_perfect*100:6.2f}%")

print(f"\nNoisy-Trained Model:      {results['noisy_model_perfect_data']['acc']*100:6.2f}%          {results['noisy_model_noisy_data']['acc']*100:6.2f}%")
gen_gap_noisy = abs(results['noisy_model_perfect_data']['acc'] - results['noisy_model_noisy_data']['acc'])
print(f"  → Generalization gap:   {gen_gap_noisy*100:6.2f}%")

# Analysis
print("\n" + "="*70)
print("💡 ANALYSIS")
print("="*70)

if gen_gap_noisy > 0.15:
    print(f"\n❌ PROBLEM: Noisy model has {gen_gap_noisy*100:.1f}% generalization gap")
    print("   → Model overfits to the specific labels it was trained on")
    print("   → Need stronger regularization and more diverse training data")
else:
    print(f"\n✅ GOOD: Noisy model has only {gen_gap_noisy*100:.1f}% generalization gap")
    print("   → Model generalizes reasonably well across label distributions")

if model_trained_on_perfect and gen_gap_perfect > 0.15:
    print(f"\n❌ PROBLEM: Perfect model has {gen_gap_perfect*100:.1f}% generalization gap")
else:
    if model_trained_on_perfect:
        print(f"\n✅ GOOD: Perfect model has only {gen_gap_perfect*100:.1f}% generalization gap")

print("\n🎯 RECOMMENDATION:")
if gen_gap_noisy > 0.20 or (model_trained_on_perfect and gen_gap_perfect > 0.20):
    print("   1. Add stronger regularization (C=0.1 or C=0.01)")
    print("   2. Train on COMBINED dataset (perfect + noisy)")
    print("   3. Use ensemble methods (averaging multiple models)")
    print("   4. Target: 85-90% accuracy on BOTH label distributions")
else:
    print("   Models show acceptable generalization!")
    print("   Consider them production-ready with current performance.")

print("="*70)
