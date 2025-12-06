"""
Test Trained Models on Perfect vs Noisy Data
Explicitly verify model performance on both datasets
"""
import pandas as pd
import numpy as np
import joblib  # Use joblib instead of pickle
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, classification_report
from sklearn.preprocessing import StandardScaler

print("="*70)
print("🧪 TESTING TRAINED MODELS ON PERFECT VS NOISY DATA")
print("="*70)

# Load the trained model
print("\n1️⃣ Loading trained dropout predictor model...")
model = joblib.load('models/saved/dropout_predictor.pkl')
print(f"   ✓ Model loaded: {type(model).__name__}")

# Load scaler
scaler = joblib.load('models/saved/scaler.pkl')
print(f"   ✓ Scaler loaded")

# Load feature names
with open('models/saved/feature_names.txt', 'r') as f:
    feature_names = [line.strip() for line in f.readlines()]
print(f"   ✓ Feature names loaded: {len(feature_names)} features")

# Load PERFECT dataset
print("\n2️⃣ Loading PERFECT test data...")
df_perfect = pd.read_csv('data/features_perfect.csv')
X_perfect = df_perfect[feature_names]
y_perfect = (df_perfect['user_type'] == 'dropout').astype(int)
print(f"   Perfect data: {len(df_perfect)} users")
print(f"   Dropout rate: {y_perfect.mean():.2%}")

# Load NOISY dataset  
print("\n3️⃣ Loading NOISY test data...")
df_noisy = pd.read_csv('data/features_noisy.csv')
X_noisy = df_noisy[feature_names]
y_noisy = (df_noisy['user_type'] == 'dropout').astype(int)
print(f"   Noisy data: {len(df_noisy)} users")
print(f"   Dropout rate: {y_noisy.mean():.2%}")

# Compare labels
label_changes = (df_perfect['user_type'] != df_noisy['user_type']).sum()
dropout_label_changes = (y_perfect != y_noisy).sum()
print(f"\n   Label differences:")
print(f"   - Total user_type changes: {label_changes}")
print(f"   - Dropout label changes: {dropout_label_changes}")

# Test on PERFECT data
print("\n" + "="*70)
print("📊 TESTING MODEL ON PERFECT DATA")
print("="*70)

X_perfect_scaled = scaler.transform(X_perfect)
y_pred_perfect = model.predict(X_perfect_scaled)
y_proba_perfect = model.predict_proba(X_perfect_scaled)[:, 1]

acc_perfect = accuracy_score(y_perfect, y_pred_perfect)
prec_perfect = precision_score(y_perfect, y_pred_perfect)
rec_perfect = recall_score(y_perfect, y_pred_perfect)
f1_perfect = f1_score(y_perfect, y_pred_perfect)

print(f"\nAccuracy:  {acc_perfect:.4f} ({acc_perfect*100:.2f}%)")
print(f"Precision: {prec_perfect:.4f} ({prec_perfect*100:.2f}%)")
print(f"Recall:    {rec_perfect:.4f} ({rec_perfect*100:.2f}%)")
print(f"F1 Score:  {f1_perfect:.4f} ({f1_perfect*100:.2f}%)")

print("\nClassification Report:")
print(classification_report(y_perfect, y_pred_perfect, 
                          target_names=['Retained', 'Dropout']))

# Test on NOISY data
print("\n" + "="*70)
print("📊 TESTING MODEL ON NOISY DATA (WITH 26% LABEL CHANGES)")
print("="*70)

X_noisy_scaled = scaler.transform(X_noisy)
y_pred_noisy = model.predict(X_noisy_scaled)
y_proba_noisy = model.predict_proba(X_noisy_scaled)[:, 1]

acc_noisy = accuracy_score(y_noisy, y_pred_noisy)
prec_noisy = precision_score(y_noisy, y_pred_noisy)
rec_noisy = recall_score(y_noisy, y_pred_noisy)
f1_noisy = f1_score(y_noisy, y_pred_noisy)

print(f"\nAccuracy:  {acc_noisy:.4f} ({acc_noisy*100:.2f}%)")
print(f"Precision: {prec_noisy:.4f} ({prec_noisy*100:.2f}%)")
print(f"Recall:    {rec_noisy:.4f} ({rec_noisy*100:.2f}%)")
print(f"F1 Score:  {f1_noisy:.4f} ({f1_noisy*100:.2f}%)")

print("\nClassification Report:")
print(classification_report(y_noisy, y_pred_noisy, 
                          target_names=['Retained', 'Dropout']))

# Compare predictions between perfect and noisy
print("\n" + "="*70)
print("🔬 PREDICTION COMPARISON")
print("="*70)

pred_differences = (y_pred_perfect != y_pred_noisy).sum()
print(f"\nPredictions that changed: {pred_differences} out of {len(y_pred_perfect)} ({pred_differences/len(y_pred_perfect)*100:.1f}%)")

# Where labels changed, how did model respond?
label_changed_mask = (y_perfect != y_noisy)
print(f"\nFor the {label_changed_mask.sum()} users whose LABELS changed:")
pred_changed_when_label_changed = (y_pred_perfect[label_changed_mask] != y_pred_noisy[label_changed_mask]).sum()
print(f"  Model prediction changed: {pred_changed_when_label_changed} times ({pred_changed_when_label_changed/label_changed_mask.sum()*100:.1f}%)")
print(f"  Model prediction STAYED same: {label_changed_mask.sum() - pred_changed_when_label_changed} times")

# Summary
print("\n" + "="*70)
print("📋 SUMMARY")
print("="*70)

print(f"\n Performance Metrics:")
print(f"                    Perfect Data    Noisy Data    Difference")
print(f"   Accuracy:        {acc_perfect*100:6.2f}%        {acc_noisy*100:6.2f}%      {(acc_perfect-acc_noisy)*100:+6.2f}%")
print(f"   Precision:       {prec_perfect*100:6.2f}%        {prec_noisy*100:6.2f}%      {(prec_perfect-prec_noisy)*100:+6.2f}%")
print(f"   Recall:          {rec_perfect*100:6.2f}%        {rec_noisy*100:6.2f}%      {(rec_perfect-rec_noisy)*100:+6.2f}%")
print(f"   F1 Score:        {f1_perfect*100:6.2f}%        {f1_noisy*100:6.2f}%      {(f1_perfect-f1_noisy)*100:+6.2f}%")

print(f"\n Data Characteristics:")
print(f"   Total users with label noise: {label_changes} ({label_changes/len(df_perfect)*100:.1f}%)")
print(f"   Dropout label changes: {dropout_label_changes}")
print(f"   Model predictions changed: {pred_differences} ({pred_differences/len(y_pred_perfect)*100:.1f}%)")

if abs(acc_perfect - acc_noisy) < 0.05:
    print("\n✅ CONCLUSION: Model performance is ROBUST to noise!")
    print("   The temporal features capture underlying patterns that")
    print("   transcend label noise. This is EXCELLENT for production!")
else:
    print(f"\n⚠️  CONCLUSION: Performance degraded by {abs(acc_perfect-acc_noisy)*100:.1f}%")
    print("   This indicates the model is sensitive to label quality.")

print("="*70)
