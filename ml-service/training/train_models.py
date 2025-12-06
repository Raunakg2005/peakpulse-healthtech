"""
ML Model Training Pipeline
Train models with proper cross-validation, hyperparameter tuning, and evaluation
Save trained models as .pkl files
"""

import pandas as pd
import numpy as np
import joblib
import os
import logging
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    classification_report, confusion_matrix, roc_auc_score, roc_curve
)
from sklearn.model_selection import cross_val_score, GridSearchCV
import matplotlib.pyplot as plt
import seaborn as sns

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class ModelTrainer:
    """Train and evaluate ML models."""
    
    def __init__(self, data_dir: str = "./data/processed"):
        self.data_dir = data_dir
        self.models = {}
        self.results = {}
        
    def load_processed_data(self):
        """Load pre-processed training data."""
        logger.info("📂 Loading processed data...")
        
        self.X_train = pd.read_csv(f"{self.data_dir}/X_train.csv")
        self.X_val = pd.read_csv(f"{self.data_dir}/X_val.csv")
        self.X_test = pd.read_csv(f"{self.data_dir}/X_test.csv")
        
        self.y_dropout_train = pd.read_csv(f"{self.data_dir}/y_dropout_train.csv").values.ravel()
        self.y_dropout_val = pd.read_csv(f"{self.data_dir}/y_dropout_val.csv").values.ravel()
        self.y_dropout_test = pd.read_csv(f"{self.data_dir}/y_dropout_test.csv").values.ravel()
        
        self.y_engagement_train = pd.read_csv(f"{self.data_dir}/y_engagement_train.csv").values.ravel()
        self.y_engagement_val = pd.read_csv(f"{self.data_dir}/y_engagement_val.csv").values.ravel()
        self.y_engagement_test = pd.read_csv(f"{self.data_dir}/y_engagement_test.csv").values.ravel()
        
        self.scaler = joblib.load(f"{self.data_dir}/scaler.pkl")
        
        with open(f"{self.data_dir}/feature_names.txt", 'r') as f:
            self.feature_names = [line.strip() for line in f.readlines()]
        
        logger.info(f"✓ Loaded {len(self.X_train)} training samples")
        logger.info(f"✓ Loaded {len(self.X_val)} validation samples")
        logger.info(f"✓ Loaded {len(self.X_test)} test samples")
        logger.info(f"✓ Features: {len(self.feature_names)}")
        
        return self
    
    def train_dropout_predictor(self):
        """Train dropout prediction model with hyperparameter tuning."""
        logger.info("\n" + "="*60)
        logger.info("🎯 TRAINING DROPOUT PREDICTION MODEL")
        logger.info("="*60)
        
        # Define models to try - UPDATED with class balancing
        models = {
            'Logistic Regression': LogisticRegression(random_state=42, max_iter=1000, class_weight='balanced'),
            'Random Forest': RandomForestClassifier(
                random_state=42,
                class_weight='balanced',  # Handle imbalance!
                max_depth=10,  # Limit depth to prevent overfitting
                min_samples_leaf=5,  # Require more samples per leaf
                min_samples_split=10,  # Require more samples to split
                max_features='sqrt'  # Limit features per split
            ),
            'Gradient Boosting': GradientBoostingClassifier(
                random_state=42,
                max_depth=5,  # Shallow trees
                learning_rate=0.1,  # Slower learning
                n_estimators=100
            )
        }
        
        best_model = None
        best_score = 0
        best_name = ""
        
        for name, model in models.items():
            logger.info(f"\n📊 Training {name}...")
            
            # Cross-validation on training data
            cv_scores = cross_val_score(model, self.X_train, self.y_dropout_train, cv=5, scoring='f1')
            logger.info(f"  Cross-validation F1: {cv_scores.mean():.4f} (+/- {cv_scores.std():.4f})")
            
            # Train on full training set
            model.fit(self.X_train, self.y_dropout_train)
            
            # Evaluate on validation set
            val_pred = model.predict(self.X_val)
            val_f1 = f1_score(self.y_dropout_val, val_pred)
            logger.info(f"  Validation F1: {val_f1:.4f}")
            
            if val_f1 > best_score:
                best_score = val_f1
                best_model = model
                best_name = name
        
        logger.info(f"\n✅ Best model: {best_name} (F1: {best_score:.4f})")
        
        # Hyperparameter tuning for best model
        if best_name == 'Random Forest':
            logger.info("\n🔧 Hyperparameter tuning...")
            param_grid = {
                'n_estimators': [50, 100],  # Reduced from before
                'max_depth': [8, 10, 12],  # Shallower trees
                'min_samples_split': [10, 20],  # More samples required
                'min_samples_leaf': [5, 10],  # Larger leaves
                'max_features': ['sqrt', 'log2']  # Limit features
            }
            
            grid_search = GridSearchCV(
                RandomForestClassifier(random_state=42, class_weight='balanced'),
                param_grid,
                cv=3,
                scoring='recall',  # OPTIMIZE FOR RECALL!
                n_jobs=-1,
                verbose=1
            )
            
            grid_search.fit(self.X_train, self.y_dropout_train)
            best_model = grid_search.best_estimator_
            
            logger.info(f"  Best parameters: {grid_search.best_params_}")
            logger.info(f"  Best CV F1: {grid_search.best_score_:.4f}")
        
        # Final evaluation on test set
        logger.info("\n📈 Final Evaluation on Test Set:")
        test_pred = best_model.predict(self.X_test)
        test_pred_proba = best_model.predict_proba(self.X_test)[:, 1]
        
        accuracy = accuracy_score(self.y_dropout_test, test_pred)
        precision = precision_score(self.y_dropout_test, test_pred)
        recall = recall_score(self.y_dropout_test, test_pred)
        f1 = f1_score(self.y_dropout_test, test_pred)
        roc_auc = roc_auc_score(self.y_dropout_test, test_pred_proba)
        
        logger.info(f"  Accuracy:  {accuracy:.4f}")
        logger.info(f"  Precision: {precision:.4f}")
        logger.info(f"  Recall:    {recall:.4f}")
        logger.info(f"  F1 Score:  {f1:.4f}")
        logger.info(f"  ROC AUC:   {roc_auc:.4f}")
        
        # Check for overfitting
        train_pred = best_model.predict(self.X_train)
        train_f1 = f1_score(self.y_dropout_train, train_pred)
        
        logger.info(f"\n🔍 Overfitting Check:")
        logger.info(f"  Train F1: {train_f1:.4f}")
        logger.info(f"  Test F1:  {f1:.4f}")
        logger.info(f"  Difference: {abs(train_f1 - f1):.4f}")
        
        if abs(train_f1 - f1) > 0.1:
            logger.warning("  ⚠️ Possible overfitting detected!")
        else:
            logger.info("  ✅ No significant overfitting")
        
        # Classification report
        logger.info("\n📋 Classification Report:")
        print(classification_report(self.y_dropout_test, test_pred, target_names=['Retained', 'Dropout']))
        
        # Confusion matrix
        cm = confusion_matrix(self.y_dropout_test, test_pred)
        logger.info(f"\n📊 Confusion Matrix:")
        logger.info(f"  [[TN: {cm[0,0]}, FP: {cm[0,1]}]")
        logger.info(f"   [FN: {cm[1,0]}, TP: {cm[1,1]}]]")
        
        # Feature importance
        if hasattr(best_model, 'feature_importances_'):
            feature_importance = pd.DataFrame({
                'feature': self.feature_names,
                'importance': best_model.feature_importances_
            }).sort_values('importance', ascending=False)
            
            logger.info(f"\n🔝 Top 5 Most Important Features:")
            for idx, row in feature_importance.head(5).iterrows():
                logger.info(f"  {row['feature']}: {row['importance']:.4f}")
        
        # Store results
        self.models['dropout_predictor'] = best_model
        self.results['dropout'] = {
            'model_name': best_name,
            'accuracy': accuracy,
            'precision': precision,
            'recall': recall,
            'f1_score': f1,
            'roc_auc': roc_auc,
            'test_predictions': test_pred,
            'test_probabilities': test_pred_proba
        }
        
        return best_model
    
    def train_streak_predictor(self):
        """Train streak break prediction model."""
        logger.info("\n" + "="*60)
        logger.info("🔥 TRAINING STREAK PREDICTION MODEL")
        logger.info("="*60)
        
        # Create streak-specific labels from engagement levels
        # High engagement = low streak break risk
        y_streak_train = (self.y_engagement_train <= 1).astype(int)  # Struggling or dropout = high risk
        y_streak_val = (self.y_engagement_val <= 1).astype(int)
        y_streak_test = (self.y_engagement_test <= 1).astype(int)
        
        logger.info(f"  Streak break risk distribution:")
        logger.info(f"  Train: {np.bincount(y_streak_train)}")
        logger.info(f"  Test: {np.bincount(y_streak_test)}")
        
        # Train Logistic Regression (fast and interpretable)
        model = LogisticRegression(random_state=42, max_iter=1000)
        
        # Cross-validation
        cv_scores = cross_val_score(model, self.X_train, y_streak_train, cv=5, scoring='f1')
        logger.info(f"\n📊 Cross-validation F1: {cv_scores.mean():.4f} (+/- {cv_scores.std():.4f})")
        
        # Train
        model.fit(self.X_train, y_streak_train)
        
        # Evaluate
        test_pred = model.predict(self.X_test)
        test_pred_proba = model.predict_proba(self.X_test)[:, 1]
        
        accuracy = accuracy_score(y_streak_test, test_pred)
        precision = precision_score(y_streak_test, test_pred)
        recall = recall_score(y_streak_test, test_pred)
        f1 = f1_score(y_streak_test, test_pred)
        roc_auc = roc_auc_score(y_streak_test, test_pred_proba)
        
        logger.info(f"\n📈 Test Set Performance:")
        logger.info(f"  Accuracy:  {accuracy:.4f}")
        logger.info(f"  Precision: {precision:.4f}")
        logger.info(f"  Recall:    {recall:.4f}")
        logger.info(f"  F1 Score:  {f1:.4f}")
        logger.info(f"  ROC AUC:   {roc_auc:.4f}")
        
        # Store results
        self.models['streak_predictor'] = model
        self.results['streak'] = {
            'accuracy': accuracy,
            'precision': precision,
            'recall': recall,
            'f1_score': f1,
            'roc_auc': roc_auc
        }
        
        return model
    
    def train_engagement_classifier(self):
        """Train multi-class engagement level classifier."""
        logger.info("\n" + "="*60)
        logger.info("⭐ TRAINING ENGAGEMENT CLASSIFIER")
        logger.info("="*60)
        
        # Random Forest for multi-class
        model = RandomForestClassifier(
            n_estimators=100,
            max_depth=20,
            random_state=42
        )
        
        # Cross-validation
        cv_scores = cross_val_score(
            model, self.X_train, self.y_engagement_train,
            cv=5, scoring='accuracy'
        )
        logger.info(f"\n📊 Cross-validation Accuracy: {cv_scores.mean():.4f} (+/- {cv_scores.std():.4f})")
        
        # Train
        model.fit(self.X_train, self.y_engagement_train)
        
        # Evaluate
        test_pred = model.predict(self.X_test)
        
        accuracy = accuracy_score(self.y_engagement_test, test_pred)
        
        logger.info(f"\n📈 Test Set Accuracy: {accuracy:.4f}")
        
        # Multi-class metrics
        logger.info("\n📋 Classification Report:")
        print(classification_report(
            self.y_engagement_test, test_pred,
            target_names=['Dropout', 'Struggling', 'Moderate', 'Highly Engaged']
        ))
        
        # Store results
        self.models['engagement_classifier'] = model
        self.results['engagement'] = {
            'accuracy': accuracy,
            'test_predictions': test_pred
        }
        
        return model
    
    def save_models(self, output_dir: str = "./models/saved"):
        """Save all trained models."""
        os.makedirs(output_dir, exist_ok=True)
        
        logger.info("\n" + "="*60)
        logger.info("💾 SAVING TRAINED MODELS")
        logger.info("="*60)
        
        for name, model in self.models.items():
            filepath = f"{output_dir}/{name}.pkl"
            joblib.dump(model, filepath)
            logger.info(f"  ✓ Saved {name} to {filepath}")
        
        # Save scaler (already saved but copy it here for convenience)
        joblib.dump(self.scaler, f"{output_dir}/scaler.pkl")
        logger.info(f"  ✓ Saved scaler to {output_dir}/scaler.pkl")
        
        # Save feature names
        with open(f"{output_dir}/feature_names.txt", 'w') as f:
            f.write('\n'.join(self.feature_names))
        logger.info(f"  ✓ Saved feature names")
        
        # Save results summary
        import json
        results_summary = {
            name: {k: float(v) if isinstance(v, (np.float32, np.float64)) else v 
                   for k, v in metrics.items() if k not in ['test_predictions', 'test_probabilities']}
            for name, metrics in self.results.items()
        }
        
        with open(f"{output_dir}/model_results.json", 'w') as f:
            json.dump(results_summary, f, indent=2)
        logger.info(f"  ✓ Saved results summary")
        
        logger.info("\n✅ All models saved successfully!")
    
    def generate_summary_report(self):
        """Generate a summary report of all models."""
        logger.info("\n" + "="*60)
        logger.info("📊 TRAINING SUMMARY REPORT")
        logger.info("="*60)
        
        logger.info("\n🎯 DROPOUT PREDICTOR:")
        if 'dropout' in self.results:
            r = self.results['dropout']
            logger.info(f"  Model: {r['model_name']}")
            logger.info(f"  Accuracy:  {r['accuracy']:.4f}")
            logger.info(f"  Precision: {r['precision']:.4f}")
            logger.info(f"  Recall:    {r['recall']:.4f}")
            logger.info(f"  F1 Score:  {r['f1_score']:.4f}")
            logger.info(f"  ROC AUC:   {r['roc_auc']:.4f}")
        
        logger.info("\n🔥 STREAK PREDICTOR:")
        if 'streak' in self.results:
            r = self.results['streak']
            logger.info(f"  Accuracy:  {r['accuracy']:.4f}")
            logger.info(f"  Precision: {r['precision']:.4f}")
            logger.info(f"  Recall:    {r['recall']:.4f}")
            logger.info(f"  F1 Score:  {r['f1_score']:.4f}")
            logger.info(f"  ROC AUC:   {r['roc_auc']:.4f}")
        
        logger.info("\n⭐ ENGAGEMENT CLASSIFIER:")
        if 'engagement' in self.results:
            r = self.results['engagement']
            logger.info(f"  Accuracy: {r['accuracy']:.4f}")
        
        logger.info("\n" + "="*60)


def run_training_pipeline():
    """Run complete training pipeline."""
    logger.info("="*60)
    logger.info("🚀 STARTING ML TRAINING PIPELINE")
    logger.info("="*60)
    
    # Initialize trainer
    trainer = ModelTrainer()
    
    # Load data
    trainer.load_processed_data()
    
    # Train all models
    trainer.train_dropout_predictor()
    trainer.train_streak_predictor()
    trainer.train_engagement_classifier()
    
    # Save models
    trainer.save_models()
    
    # Generate summary
    trainer.generate_summary_report()
    
    logger.info("\n" + "="*60)
    logger.info("✅ ML TRAINING PIPELINE COMPLETE")
    logger.info("="*60)
    
    return trainer


if __name__ == "__main__":
    run_training_pipeline()
