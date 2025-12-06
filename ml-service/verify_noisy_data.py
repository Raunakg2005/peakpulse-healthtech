"""
Comprehensive Verification of Noisy Data Usage
"""
import pandas as pd
import numpy as np

print("="*70)
print("🔍 COMPREHENSIVE NOISY DATA VERIFICATION")
print("="*70)

# 1. Load all three versions
print("\n1️⃣ Loading all three feature files...")
features_current = pd.read_csv('data/features.csv')
features_perfect = pd.read_csv('data/features_perfect.csv')
features_noisy = pd.read_csv('data/features_noisy.csv')

print(f"   Current features.csv:  {features_current.shape}")
print(f"   Perfect features:      {features_perfect.shape}")
print(f"   Noisy features:        {features_noisy.shape}")

# 2. Check which one features.csv matches
print("\n2️⃣ Checking which dataset features.csv matches...")
if features_current.equals(features_perfect):
    print("   ❌ PROBLEM: features.csv matches PERFECT dataset!")
    print("   The noisy data was NOT used!")
elif features_current.equals(features_noisy):
    print("   ✅ GOOD: features.csv matches NOISY dataset!")
    print("   The noisy data WAS used correctly!")
else:
    print("   ⚠️  WARNING: features.csv doesn't match either!")
    print("   It might be a different version")

# 3. Compare user_type distributions
print("\n3️⃣ User Type Distribution Comparison:")
print("\nPerfect:")
print(features_perfect['user_type'].value_counts().sort_index())
print("\nNoisy:")
print(features_noisy['user_type'].value_counts().sort_index())
print("\nCurrent (features.csv):")
print(features_current['user_type'].value_counts().sort_index())

# 4. Check temporal feature statistics
print("\n4️⃣ Temporal Feature Statistics:")
temporal_features = ['activity_slope', 'three_day_decline', 'consistency_score', 'momentum']

for feat in temporal_features:
    if feat in features_perfect.columns:
        print(f"\n{feat}:")
        print(f"   Perfect: mean={features_perfect[feat].mean():.4f}, std={features_perfect[feat].std():.4f}")
        print(f"   Noisy:   mean={features_noisy[feat].mean():.4f}, std={features_noisy[feat].std():.4f}")
        print(f"   Current: mean={features_current[feat].mean():.4f}, std={features_current[feat].std():.4f}")

# 5. Check the processed training data
print("\n5️⃣ Checking processed training data...")
try:
    X_train = pd.read_csv('data/processed/X_train.csv')
    y_train_dropout = pd.read_csv('data/processed/y_dropout_train.csv')
    print(f"   Processed training data: {X_train.shape}")
    print(f"   Dropout labels: {y_train_dropout.shape}")
    print(f"   Dropout rate in training: {y_train_dropout.iloc[:, 0].mean():.2%}")
except Exception as e:
    print(f"   ⚠️  Could not load processed data: {e}")

# 6. Sample comparison - check actual values
print("\n6️⃣ Sample Data Comparison (first 5 users):")
print("\nUser IDs and user_type:")
comparison = pd.DataFrame({
    'user_id': features_perfect['user_id'].head(),
    'perfect_type': features_perfect['user_type'].head(),
    'noisy_type': features_noisy['user_type'].head(),
    'current_type': features_current['user_type'].head()
})
print(comparison.to_string(index=False))

# Count how many changed
if 'user_type' in features_perfect.columns and 'user_type' in features_noisy.columns:
    changed = (features_perfect['user_type'] != features_noisy['user_type']).sum()
    print(f"\n   Total users with changed labels: {changed} out of {len(features_perfect)}")

# 7. Check specific noise characteristics
print("\n7️⃣ Noise Characteristics Check:")
print(f"   Perfect 'moderate' count: {(features_perfect['user_type'] == 'moderate').sum()}")
print(f"   Noisy 'moderate' count:   {(features_noisy['user_type'] == 'moderate').sum()}")
print(f"   Current 'moderate' count: {(features_current['user_type'] == 'moderate').sum()}")
print(f"   Expected shift: ~123 users → moderate")

# 8. Final verdict
print("\n" + "="*70)
print("📊 FINAL VERIFICATION RESULT:")
print("="*70)

if features_current.equals(features_noisy):
    print("✅ CONFIRMED: The noisy dataset IS being used!")
    print("   - features.csv matches features_noisy.csv perfectly")
    print("   - Noise injection worked as intended")
    print("   - Models trained on noisy data")
elif features_current.equals(features_perfect):
    print("❌ ERROR: The PERFECT dataset is being used, not noisy!")
    print("   - features.csv matches features_perfect.csv")  
    print("   - Need to copy features_noisy.csv to features.csv")
else:
    print("⚠️  UNCLEAR: features.csv doesn't match either version")
    print("   - Manual inspection required")

print("="*70)
