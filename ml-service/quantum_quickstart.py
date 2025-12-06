#!/usr/bin/env python
"""
Quick Start: Train and Test Quantum ML System
Run this to get started with quantum predictions
"""

import os
import sys

print("""
╔══════════════════════════════════════════════════════════════╗
║  🔮 QUANTUM ML QUICK START                                   ║
║  Train and deploy hybrid quantum-classical predictions      ║
╚══════════════════════════════════════════════════════════════╝
""")

# Check if training data exists
if not os.path.exists('./data/processed/X_train.csv'):
    print("⚠️  Training data not found. Generating synthetic data...")
    print("   This will take a moment...")
    
    try:
        from data.realistic_data_generator import RealisticHealthDataGenerator
        import pandas as pd
        import numpy as np
        from sklearn.model_selection import train_test_split
        
        generator = RealisticHealthDataGenerator(n_users=1000, n_days=90)
        datasets = generator.generate_complete_dataset()
        
        features = datasets['features']
        X = features.drop(['user_id', 'user_type', 'will_dropout'], axis=1, errors='ignore')
        y = features['will_dropout'] if 'will_dropout' in features.columns else (np.random.rand(len(X)) > 0.5).astype(int)
        
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        os.makedirs('./data/processed', exist_ok=True)
        X_train.to_csv('./data/processed/X_train.csv', index=False)
        X_test.to_csv('./data/processed/X_test.csv', index=False)
        pd.DataFrame(y_train, columns=['dropout']).to_csv('./data/processed/y_dropout_train.csv', index=False)
        pd.DataFrame(y_test, columns=['dropout']).to_csv('./data/processed/y_dropout_test.csv', index=False)
        
        print("✓ Training data generated")
    except Exception as e:
        print(f"✗ Error generating data: {e}")
        sys.exit(1)

# Ask user what to do
print("\nWhat would you like to do?\n")
print("1. Train quantum model (recommended first time) - 5-10 minutes")
print("2. Test quantum predictions (requires trained model)")
print("3. Compare classical vs quantum models")
print("4. Start ML service with quantum support")
print("5. View quantum model info")
print("6. Run full workflow (train → test → compare)")
print("\n0. Exit")

choice = input("\nEnter choice (0-6): ").strip()

if choice == '1':
    print("\n🏋️  Starting quantum model training...")
    print("   This will take 5-10 minutes.\n")
    os.system('python training/train_quantum_model.py')
    
elif choice == '2':
    print("\n🧪 Testing quantum predictions...\n")
    
    if not os.path.exists('./models/saved/quantum_weights.npy'):
        print("⚠️  No trained quantum model found!")
        print("   Run option 1 first to train the model.")
        sys.exit(1)
    
    from app.quantum.hybrid_model import QuantumEnhancedDropoutPredictor
    
    predictor = QuantumEnhancedDropoutPredictor()
    
    test_cases = [
        {
            'name': 'High-risk user',
            'features': {
                'days_active': 3,
                'completion_rate': 0.2,
                'social_score': 0.1,
                'avg_steps': 2000
            }
        },
        {
            'name': 'Medium-risk user',
            'features': {
                'days_active': 10,
                'completion_rate': 0.5,
                'social_score': 0.5,
                'avg_steps': 5000
            }
        },
        {
            'name': 'Low-risk user',
            'features': {
                'days_active': 30,
                'completion_rate': 0.9,
                'social_score': 0.8,
                'avg_steps': 10000
            }
        }
    ]
    
    for test in test_cases:
        result = predictor.predict(test['features'])
        print(f"\n{test['name']}:")
        print(f"  Dropout Risk: {result['dropout_probability']:.1%}")
        print(f"  Quantum:      {result['quantum_component']:.1%}")
        print(f"  Classical:    {result['classical_component']:.1%}")
        print(f"  Prediction:   {result['prediction']}")
    
    print("\n✅ Testing complete!\n")
    
elif choice == '3':
    print("\n📊 Comparing models...\n")
    
    if not os.path.exists('./models/saved/quantum_weights.npy'):
        print("⚠️  Warning: Quantum model not trained yet!")
        print("   Comparison will use untrained quantum weights.\n")
    
    from app.quantum.hybrid_model import QuantumEnhancedDropoutPredictor
    from app.models.predictor import DropoutPredictor
    
    quantum = QuantumEnhancedDropoutPredictor()
    classical = DropoutPredictor()
    
    test_features = {
        'days_active': 15,
        'completion_rate': 0.75,
        'social_score': 0.6,
        'avg_steps': 7500
    }
    
    q_result = quantum.predict(test_features)
    c_result = classical.predict(
        user_id='test',
        days_active=15,
        engagement_metrics={'steps': 7500, 'social': 0.6, 'notification_response': 0.8}
    )
    
    print("┌─────────────────────────────────────────────────────────┐")
    print("│  Classical Ensemble vs Quantum-Hybrid Comparison       │")
    print("├─────────────────────────────────────────────────────────┤")
    print(f"│  Classical Probability:  {c_result['dropout_probability']:.1%}                          │")
    print(f"│  Quantum-Hybrid:         {q_result['dropout_probability']:.1%}                          │")
    print(f"│  Quantum Component:      {q_result['quantum_component']:.1%}                          │")
    print(f"│  Classical Component:    {q_result['classical_component']:.1%}                          │")
    print("└─────────────────────────────────────────────────────────┘")
    
    diff = abs(q_result['dropout_probability'] - c_result['dropout_probability'])
    if diff < 0.05:
        print(f"\n✓ Models agree (difference: {diff:.1%})")
    else:
        print(f"\n⚠️  Models disagree significantly (difference: {diff:.1%})")
    
elif choice == '4':
    print("\n🚀 Starting ML service with quantum support...\n")
    print("   Service will run at: http://localhost:8000")
    print("   API docs at: http://localhost:8000/docs\n")
    print("   Press Ctrl+C to stop\n")
    os.system('uvicorn app.main:app --reload --port 8000')
    
elif choice == '5':
    print("\n📋 Quantum Model Information:\n")
    
    from app.quantum.hybrid_model import QuantumEnhancedDropoutPredictor
    
    predictor = QuantumEnhancedDropoutPredictor()
    info = predictor.get_quantum_info()
    
    print(f"Model Type:    {info['model_type']}")
    print(f"Qubits:        {info['quantum_circuit']['n_qubits']}")
    print(f"Layers:        {info['quantum_circuit']['n_layers']}")
    print(f"Parameters:    {info['total_parameters']}")
    print(f"Gate Count:    {info['quantum_circuit']['gate_count']}")
    print(f"Device:        {info['quantum_circuit']['device']}")
    print(f"\nHybrid Weights:")
    print(f"  Classical:   {info['hybrid_weights']['classical_weight']:.0%}")
    print(f"  Quantum:     {info['hybrid_weights']['quantum_weight']:.0%}")
    
    trained = os.path.exists('./models/saved/quantum_weights.npy')
    print(f"\nQuantum Status: {'✅ TRAINED' if trained else '⚠️  UNTRAINED'}")
    
elif choice == '6':
    print("\n🎯 Running full workflow...\n")
    print("Step 1/3: Training quantum model...")
    ret1 = os.system('python training/train_quantum_model.py')
    
    if ret1 == 0:
        print("\n\nStep 2/3: Testing predictions...")
        os.system(f'python {__file__}')  # Re-run this script with option 2
        
        print("\n\nStep 3/3: Model comparison...")
        os.system(f'python {__file__}')  # Re-run with option 3
        
        print("\n\n✅ Full workflow complete!")
        print("\nNext steps:")
        print("  • Start ML service: uvicorn app.main:app --reload")
        print("  • Test endpoint: curl -X POST http://localhost:8000/api/predict-dropout-quantum")
    else:
        print("\n✗ Training failed. Check errors above.")
    
elif choice == '0':
    print("\n👋 Goodbye!\n")
    sys.exit(0)
    
else:
    print("\n❌ Invalid choice. Please run again and select 0-6.\n")
    sys.exit(1)

print("\n" + "="*60)
print("For more information, see: ml-service/QUANTUM_GUIDE.md")
print("="*60 + "\n")
