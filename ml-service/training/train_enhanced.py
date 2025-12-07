"""
Enhanced ML Training Pipeline with Better Feature Engineering
Target: 75-85% accuracy range
"""

import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import cross_val_score, GridSearchCV
from sklearn.metrics import classification_report, accuracy_score, f1_score, roc_auc_score, confusion_matrix
import pickle
import logging
from pathlib import Path

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class EnhancedMLTrainer:
    """Enhanced trainer with better feature engineering."""
    
    def __init__(self):
        self.models = {}
        self.best_params = {}
        
    def create_temporal_features(self, X):
        """Create advanced temporal features."""
        X_enhanced = X.copy()
        
        # Activity ratio
        X_enhanced['activity_ratio'] = X['days_active'] / (X['total_days'] + 1)
        
        # Engagement score
        X_enhanced['engagement_score'] = (
            X['challenge_completion_rate'] * 0.3 +
            X_enhanced['activity_ratio'] * 0.3 +
            X['social_engagement_score'] * 0.2 +
            (X['avg_steps_last_7_days'] / 10000).clip(0, 1) * 0.2
        )
        
        # Health vitals score (if vitals exist)
        if 'avg_heart_rate_7d' in X.columns:
            # Normalize heart rate (lower is better, 60-100 normal)
            hr_score = 1 - ((X['avg_heart_rate_7d'] - 60) / 40).clip(0, 1)
            # Blood oxygen score (95-100 is good)
            spo2_score = ((X['avg_blood_oxygen_7d'] - 90) / 10).clip(0, 1)
            # HRV score (higher is better, 50+ is good)
            hrv_score = (X['avg_hrv_7d'] / 100).clip(0, 1)
            
            X_enhanced['vitals_health_score'] = (hr_score + spo2_score + hrv_score) / 3
        
        # Consistency metric
        if 'meditation_streak' in X.columns:
            X_enhanced['consistency_index'] = (
                X['meditation_streak'] * 0.4 +
                X['avg_meditation_minutes'] * 0.3 +
                X['avg_sleep_hours'] / 10 * 0.3
            )
        
        # Social-activity interaction
        X_enhanced['social_activity_interaction'] = (
            X['social_engagement_score'] * X_enhanced['activity_ratio']
        )
        
        return X_enhanced
    
    def train_dropout_predictor(self, X_train, y_train, X_val, y_val, X_test, y_test):
        """Train enhanced dropout predictor."""
        logger.info("\n" + "="*60)
        logger.info("🎯 TRAINING ENHANCED DROPOUT PREDICTOR")
        logger.info("="*60)
        
        # Create enhanced features
        X_train_enh = self.create_temporal_features(X_train)
        X_val_enh = self.create_temporal_features(X_val)
        X_test_enh = self.create_temporal_features(X_test)
        
        logger.info(f"Features: {len(X_train_enh.columns)} (enhanced from {len(X_train.columns)})")
        
        models = {
            'LogisticRegression': LogisticRegression(
                C=0.1,
                class_weight='balanced',
                max_iter=1000,
                random_state=42
            ),
            'RandomForest': RandomForestClassifier(
                n_estimators=200,
                max_depth=10,
                min_samples_split=20,
                min_samples_leaf=10,
                class_weight='balanced',
                random_state=42
            ),
            'GradientBoosting': GradientBoostingClassifier(
                n_estimators=200,
                learning_rate=0.05,
                max_depth=5,
                min_samples_split=20,
                random_state=42
            )
        }
        
        best_model = None
        best_score = 0
        best_name = ""
        
        for name, model in models.items():
            logger.info(f"\n📊 Training {name}...")
            model.fit(X_train_enh, y_train)
            
            # Cross-validation
            cv_scores = cross_val_score(model, X_train_enh, y_train, cv=5, scoring='f1')
            logger.info(f"  CV F1: {cv_scores.mean():.4f} (+/- {cv_scores.std():.4f})")
            
            # Validation score
            val_pred = model.predict(X_val_enh)
            val_f1 = f1_score(y_val, val_pred)
            logger.info(f"  Validation F1: {val_f1:.4f}")
            
            if val_f1 > best_score:
                best_score = val_f1
                best_model = model
                best_name = name
        
        logger.info(f"\n✅ Best model: {best_name} (F1: {best_score:.4f})")
        
        # Final evaluation
        test_pred = best_model.predict(X_test_enh)
        test_proba = best_model.predict_proba(X_test_enh)[:, 1]
        
        logger.info("\n📈 Final Test Set Performance:")
        logger.info(f"  Accuracy:  {accuracy_score(y_test, test_pred):.4f}")
        logger.info(f"  Precision: {classification_report(y_test, test_pred, output_dict=True)['1']['precision']:.4f}")
        logger.info(f"  Recall:    {classification_report(y_test, test_pred, output_dict=True)['1']['recall']:.4f}")
        logger.info(f"  F1 Score:  {f1_score(y_test, test_pred):.4f}")
        logger.info(f"  ROC AUC:   {roc_auc_score(y_test, test_proba):.4f}")
        
        logger.info("\n📋 Classification Report:")
        print(classification_report(y_test, test_pred, target_names=['Retained', 'Dropout']))
        
        logger.info("\n📊 Confusion Matrix:")
        tn, fp, fn, tp = confusion_matrix(y_test, test_pred).ravel()
        logger.info(f"  [[TN: {tn}, FP: {fp}]")
        logger.info(f"   [FN: {fn}, TP: {tp}]]")
        
        # Feature importance
        if hasattr(best_model, 'feature_importances_'):
            feature_importance = pd.DataFrame({
                'feature': X_train_enh.columns,
                'importance': best_model.feature_importances_
            }).sort_values('importance', ascending=False)
            
            logger.info("\n🔝 Top 10 Most Important Features:")
            for idx, row in feature_importance.head(10).iterrows():
                logger.info(f"  {row['feature']}: {row['importance']:.4f}")
        
        return best_model, X_train_enh.columns.tolist()
    
    def train_streak_predictor(self, X_train, y_train, X_test, y_test):
        """Train enhanced streak predictor."""
        logger.info("\n" + "="*60)
        logger.info("🔥 TRAINING ENHANCED STREAK PREDICTOR")
        logger.info("="*60)
        
        # Create enhanced features
        X_train_enh = self.create_temporal_features(X_train)
        X_test_enh = self.create_temporal_features(X_test)
        
        model = RandomForestClassifier(
            n_estimators=200,
            max_depth=8,
            min_samples_split=15,
            min_samples_leaf=8,
            class_weight='balanced',
            random_state=42
        )
        
        model.fit(X_train_enh, y_train)
        
        # Evaluation
        test_pred = model.predict(X_test_enh)
        test_proba = model.predict_proba(X_test_enh)[:, 1]
        
        logger.info(f"\n📈 Test Set Performance:")
        logger.info(f"  Accuracy:  {accuracy_score(y_test, test_pred):.4f}")
        logger.info(f"  F1 Score:  {f1_score(y_test, test_pred):.4f}")
        logger.info(f"  ROC AUC:   {roc_auc_score(y_test, test_proba):.4f}")
        
        return model


def main():
    """Main training pipeline."""
    logger.info("="*60)
    logger.info("🚀 ENHANCED ML TRAINING PIPELINE")
    logger.info("Target: 75-85% accuracy")
    logger.info("="*60)
    
    # Load processed data
    data_dir = Path("./data/processed")
    
    X_train = pd.read_csv(data_dir / "X_train.csv")
    X_val = pd.read_csv(data_dir / "X_val.csv")
    X_test = pd.read_csv(data_dir / "X_test.csv")
    y_dropout_train = pd.read_csv(data_dir / "y_dropout_train.csv").values.ravel()
    y_dropout_val = pd.read_csv(data_dir / "y_dropout_val.csv").values.ravel()
    y_dropout_test = pd.read_csv(data_dir / "y_dropout_test.csv").values.ravel()
    
    # Use dropout as streak predictor for now (same binary classification)
    y_streak_train = y_dropout_train.copy()
    y_streak_test = y_dropout_test.copy()
    
    logger.info(f"\n✓ Loaded training data: {len(X_train)} samples")
    logger.info(f"✓ Loaded validation data: {len(X_val)} samples")
    logger.info(f"✓ Loaded test data: {len(X_test)} samples")
    logger.info(f"✓ Features: {len(X_train.columns)}")
    
    # Train models
    trainer = EnhancedMLTrainer()
    
    dropout_model, feature_names = trainer.train_dropout_predictor(
        X_train, y_dropout_train, X_val, y_dropout_val, X_test, y_dropout_test
    )
    
    streak_model = trainer.train_streak_predictor(
        X_train, y_streak_train, X_test, y_streak_test
    )
    
    # Save models
    models_dir = Path("./models/saved")
    models_dir.mkdir(parents=True, exist_ok=True)
    
    logger.info("\n" + "="*60)
    logger.info("💾 SAVING ENHANCED MODELS")
    logger.info("="*60)
    
    with open(models_dir / "dropout_predictor.pkl", 'wb') as f:
        pickle.dump(dropout_model, f)
    logger.info("  ✓ Saved dropout_predictor.pkl")
    
    with open(models_dir / "streak_predictor.pkl", 'wb') as f:
        pickle.dump(streak_model, f)
    logger.info("  ✓ Saved streak_predictor.pkl")
    
    # Save feature names
    with open(models_dir / "feature_names.txt", 'w') as f:
        f.write('\n'.join(feature_names))
    logger.info("  ✓ Saved feature_names.txt")
    
    logger.info("\n" + "="*60)
    logger.info("✅ ENHANCED TRAINING COMPLETE")
    logger.info("="*60)


if __name__ == "__main__":
    main()
