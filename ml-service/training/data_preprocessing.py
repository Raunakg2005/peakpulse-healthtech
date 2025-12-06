"""
Data Cleaning and Preprocessing Pipeline
Handles missing values, outliers, feature scaling, and data validation
"""

import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.model_selection import train_test_split
import logging
import os

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class DataCleaner:
    """Clean and preprocess raw data."""
    
    def __init__(self, data_dir: str = "./ml-service/data"):
        self.data_dir = data_dir
        self.scaler = StandardScaler()
        self.label_encoders = {}
        
    def load_data(self):
        """Load all datasets."""
        logger.info("Loading datasets...")
        
        self.users = pd.read_csv(f"{self.data_dir}/users.csv")
        self.activities = pd.read_csv(f"{self.data_dir}/activities.csv")
        self.challenges = pd.read_csv(f"{self.data_dir}/challenges.csv")
        self.social = pd.read_csv(f"{self.data_dir}/social.csv")
        self.features = pd.read_csv(f"{self.data_dir}/features.csv")
        
        logger.info(f"✓ Loaded {len(self.users)} users")
        logger.info(f"✓ Loaded {len(self.activities)} activity records")
        logger.info(f"✓ Loaded {len(self.challenges)} challenge records")
        logger.info(f"✓ Loaded {len(self.social)} social interactions")
        logger.info(f"✓ Loaded {len(self.features)} feature vectors")
        
        return self
    
    def check_missing_values(self, df: pd.DataFrame, name: str):
        """Check for missing values."""
        missing = df.isnull().sum()
        if missing.sum() > 0:
            logger.warning(f"\n⚠️ Missing values in {name}:")
            logger.warning(missing[missing > 0])
        else:
            logger.info(f"✓ No missing values in {name}")
        return missing
    
    def check_duplicates(self, df: pd.DataFrame, name: str):
        """Check for duplicate records."""
        duplicates = df.duplicated().sum()
        if duplicates > 0:
            logger.warning(f"⚠️ Found {duplicates} duplicates in {name}")
        else:
            logger.info(f"✓ No duplicates in {name}")
        return duplicates
    
    def detect_outliers(self, df: pd.DataFrame, column: str, threshold: float = 3.0):
        """Detect outliers using Z-score method."""
        z_scores = np.abs((df[column] - df[column].mean()) / df[column].std())
        outliers = z_scores > threshold
        num_outliers = outliers.sum()
        
        if num_outliers > 0:
            logger.warning(f"⚠️ Found {num_outliers} outliers in {column}")
        
        return outliers
    
    def clean_features(self):
        """Clean the feature matrix."""
        logger.info("\n🧹 Cleaning feature matrix...")
        
        # Check data quality
        self.check_missing_values(self.features, "features")
        self.check_duplicates(self.features, "features")
        
        # Remove any duplicates
        before = len(self.features)
        self.features = self.features.drop_duplicates()
        logger.info(f"✓ Removed {before - len(self.features)} duplicates")
        
        # Handle missing values (if any)
        numeric_columns = self.features.select_dtypes(include=[np.number]).columns
        for col in numeric_columns:
            if self.features[col].isnull().sum() > 0:
                self.features[col].fillna(self.features[col].median(), inplace=True)
        
        # Detect and handle outliers
        outlier_columns = ['avg_steps_last_7_days', 'avg_meditation_minutes']
        for col in outlier_columns:
            if col in self.features.columns:
                outliers = self.detect_outliers(self.features, col)
                # Cap outliers at 99th percentile
                upper_limit = self.features[col].quantile(0.99)
                self.features.loc[outliers, col] = upper_limit
        
        logger.info("✓ Feature cleaning complete")
        return self.features
    
    def create_training_labels(self):
        """Create labels for supervised learning tasks."""
        logger.info("\n🏷️ Creating training labels...")
        
        # Label 1: User engagement level (for classification)
        # Based on user_type from the generated data
        self.features['engagement_label'] = self.features['user_type'].map({
            'highly_engaged': 3,
            'moderate': 2,
            'struggling': 1,
            'dropout': 0
        })
        
        # Label 2: Dropout risk (binary)
        self.features['dropout_label'] = (self.features['user_type'] == 'dropout').astype(int)
        
        # Label 3: High performer (for recommendation optimization)
        self.features['high_performer'] = (
            self.features['challenge_completion_rate'] > 0.7
        ).astype(int)
        
        logger.info("✓ Created 3 label types for different ML tasks")
        return self.features
    
    def prepare_train_test_split(self, test_size=0.2, val_size=0.1):
        """Create train/validation/test splits with stratification."""
        logger.info("\n✂️ Splitting data into train/val/test sets...")
        
        # Select feature columns - UPDATED for temporal features
        feature_cols = [
            # TEMPORAL FEATURES (should be strongest predictors)
            'activity_slope',
            'three_day_decline',
            'consistency_score',
            'momentum',
            # STANDARD FEATURES
            'days_active',
            'total_days',
            'avg_steps_last_7_days',
            'avg_meditation_minutes',
            'avg_sleep_hours',
            'challenge_completion_rate',
            'total_points_earned',
            'social_engagement_score',
            'social_interactions_count',
            'response_rate_to_notifications',
            'mood_correlation_with_exercise'
        ]
        
        X = self.features[feature_cols].copy()
        y_engagement = self.features['engagement_label'].copy()
        y_dropout = self.features['dropout_label'].copy()
        
        # First split: train+val vs test
        X_trainval, X_test, y_eng_trainval, y_eng_test, y_drop_trainval, y_drop_test = train_test_split(
            X, y_engagement, y_dropout,
            test_size=test_size,
            stratify=y_dropout,  # Stratify on dropout to maintain class balance
            random_state=42
        )
        
        # Second split: train vs val
        val_ratio = val_size / (1 - test_size)
        X_train, X_val, y_eng_train, y_eng_val, y_drop_train, y_drop_val = train_test_split(
            X_trainval, y_eng_trainval, y_drop_trainval,
            test_size=val_ratio,
            stratify=y_drop_trainval,
            random_state=42
        )
        
        logger.info(f"✓ Training set: {len(X_train)} samples ({len(X_train)/len(X)*100:.1f}%)")
        logger.info(f"✓ Validation set: {len(X_val)} samples ({len(X_val)/len(X)*100:.1f}%)")
        logger.info(f"✓ Test set: {len(X_test)} samples ({len(X_test)/len(X)*100:.1f}%)")
        
        # Check class distribution
        logger.info("\n📊 Dropout class distribution:")
        logger.info(f"  Train: {y_drop_train.value_counts(normalize=True).to_dict()}")
        logger.info(f"  Val: {y_drop_val.value_counts(normalize=True).to_dict()}")
        logger.info(f"  Test: {y_drop_test.value_counts(normalize=True).to_dict()}")
        
        return {
            'X_train': X_train,
            'X_val': X_val,
            'X_test': X_test,
            'y_engagement_train': y_eng_train,
            'y_engagement_val': y_eng_val,
            'y_engagement_test': y_eng_test,
            'y_dropout_train': y_drop_train,
            'y_dropout_val': y_drop_val,
            'y_dropout_test': y_drop_test,
            'feature_names': feature_cols
        }
    
    def scale_features(self, splits: dict):
        """Scale features using StandardScaler (fit on train only!)."""
        logger.info("\n📏 Scaling features...")
        logger.info("⚠️ IMPORTANT: Fitting scaler only on training data to prevent data leakage!")
        
        # Fit scaler ONLY on training data
        self.scaler.fit(splits['X_train'])
        
        # Transform all splits using the same fitted scaler
        splits['X_train_scaled'] = pd.DataFrame(
            self.scaler.transform(splits['X_train']),
            columns=splits['feature_names'],
            index=splits['X_train'].index
        )
        
        splits['X_val_scaled'] = pd.DataFrame(
            self.scaler.transform(splits['X_val']),
            columns=splits['feature_names'],
            index=splits['X_val'].index
        )
        
        splits['X_test_scaled'] = pd.DataFrame(
            self.scaler.transform(splits['X_test']),
            columns=splits['feature_names'],
            index=splits['X_test'].index
        )
        
        logger.info("✓ Feature scaling complete (no data leakage)")
        
        return splits
    
    def check_data_leakage(self, splits: dict):
        """Check for potential data leakage."""
        logger.info("\n🔍 Checking for data leakage...")
        
        leakage_detected = False
        
        # Check 1: No overlap between train/val/test indices
        train_idx = set(splits['X_train'].index)
        val_idx = set(splits['X_val'].index)
        test_idx = set(splits['X_test'].index)
        
        if train_idx & val_idx:
            logger.error(f"❌ LEAKAGE: {len(train_idx & val_idx)} samples overlap between train and val")
            leakage_detected = True
        if train_idx & test_idx:
            logger.error(f"❌ LEAKAGE: {len(train_idx & test_idx)} samples overlap between train and test")
            leakage_detected = True
        if val_idx & test_idx:
            logger.error(f"❌ LEAKAGE: {len(val_idx & test_idx)} samples overlap between val and test")
            leakage_detected = True
        
        if not leakage_detected:
            logger.info("✅ No index overlap detected - data splits are clean")
        
        # Check 2: Feature statistics shouldn't be too similar
        train_mean = splits['X_train'].mean().mean()
        test_mean = splits['X_test'].mean().mean()
        logger.info(f"Train mean: {train_mean:.4f}, Test mean: {test_mean:.4f}")
        
        # Check 3: Target distribution
        train_dropout_rate = splits['y_dropout_train'].mean()
        test_dropout_rate = splits['y_dropout_test'].mean()
        logger.info(f"Dropout rate - Train: {train_dropout_rate:.2%}, Test: {test_dropout_rate:.2%}")
        
        if abs(train_dropout_rate - test_dropout_rate) > 0.15:
            logger.warning("⚠️ Large difference in dropout rates between train and test")
        
        return not leakage_detected
    
    def save_cleaned_data(self, splits: dict, output_dir: str = "./data/processed"):
        """Save processed data and scaler."""
        os.makedirs(output_dir, exist_ok=True)
        
        logger.info(f"\n💾 Saving processed data to {output_dir}...")
        
        # Save splits
        splits['X_train_scaled'].to_csv(f"{output_dir}/X_train.csv", index=False)
        splits['X_val_scaled'].to_csv(f"{output_dir}/X_val.csv", index=False)
        splits['X_test_scaled'].to_csv(f"{output_dir}/X_test.csv", index=False)
        
        splits['y_dropout_train'].to_csv(f"{output_dir}/y_dropout_train.csv", index=False)
        splits['y_dropout_val'].to_csv(f"{output_dir}/y_dropout_val.csv", index=False)
        splits['y_dropout_test'].to_csv(f"{output_dir}/y_dropout_test.csv", index=False)
        
        splits['y_engagement_train'].to_csv(f"{output_dir}/y_engagement_train.csv", index=False)
        splits['y_engagement_val'].to_csv(f"{output_dir}/y_engagement_val.csv", index=False)
        splits['y_engagement_test'].to_csv(f"{output_dir}/y_engagement_test.csv", index=False)
        
        # Save scaler
        import joblib
        joblib.dump(self.scaler, f"{output_dir}/scaler.pkl")
        
        # Save feature names
        with open(f"{output_dir}/feature_names.txt", 'w') as f:
            f.write('\n'.join(splits['feature_names']))
        
        logger.info("✓ All processed data saved")


def run_data_cleaning_pipeline():
    """Run the complete data cleaning pipeline."""
    logger.info("="*60)
    logger.info("🧹 STARTING DATA CLEANING PIPELINE")
    logger.info("="*60)
    
    # Initialize cleaner
    cleaner = DataCleaner()
    
    # Load data
    cleaner.load_data()
    
    # Clean features
    cleaner.clean_features()
    
    # Create labels
    cleaner.create_training_labels()
    
    # Create splits
    splits = cleaner.prepare_train_test_split(test_size=0.2, val_size=0.1)
    
    # Scale features
    splits = cleaner.scale_features(splits)
    
    # Check for leakage
    no_leakage = cleaner.check_data_leakage(splits)
    
    if no_leakage:
        # Save processed data
        cleaner.save_cleaned_data(splits)
        logger.info("\n" + "="*60)
        logger.info("✅ DATA CLEANING PIPELINE COMPLETE")
        logger.info("="*60)
    else:
        logger.error("\n" + "="*60)
        logger.error("❌ DATA LEAKAGE DETECTED - STOPPING PIPELINE")
        logger.error("="*60)
        return None
    
    return splits, cleaner


if __name__ == "__main__":
    run_data_cleaning_pipeline()
