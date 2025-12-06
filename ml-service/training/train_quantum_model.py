"""
Train Quantum Neural Network for Dropout Prediction
Uses real training data to optimize quantum circuit weights
"""

import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, roc_auc_score, f1_score
import pennylane as qml
from pennylane import numpy as pnp
import joblib
import json
from datetime import datetime

print("="*80)
print("🔮 QUANTUM NEURAL NETWORK TRAINING")
print("="*80)

# Load processed training data
print("\n📊 Loading training data...")
try:
    X_train = pd.read_csv('./data/processed/X_train.csv')
    y_train = pd.read_csv('./data/processed/y_dropout_train.csv')
    X_test = pd.read_csv('./data/processed/X_test.csv')
    y_test = pd.read_csv('./data/processed/y_dropout_test.csv')
    
    # Convert to numpy
    X_train = X_train.values
    y_train = y_train.values.ravel()
    X_test = X_test.values
    y_test = y_test.values.ravel()
    
    print(f"✓ Loaded {len(X_train)} training samples, {len(X_test)} test samples")
    print(f"  Features: {X_train.shape[1]}")
    print(f"  Dropout rate: {y_train.mean():.1%}")
except Exception as e:
    print(f"⚠️  Could not load processed data: {e}")
    print("  Generating synthetic data for demonstration...")
    from data.realistic_data_generator import RealisticHealthDataGenerator
    generator = RealisticHealthDataGenerator(n_users=500, n_days=60)
    datasets = generator.generate_complete_dataset()
    features = datasets['features']
    X = features.drop(['user_id', 'user_type', 'will_dropout'], axis=1, errors='ignore').values
    y = features['will_dropout'].values if 'will_dropout' in features.columns else np.random.randint(0, 2, len(X))
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Use only first 4 features for quantum circuit (4 qubits)
n_qubits = 4
n_layers = 3
X_train_q = X_train[:, :n_qubits]
X_test_q = X_test[:, :n_qubits]

# Normalize features to [0, 1] for quantum encoding
X_train_norm = (X_train_q - X_train_q.min(axis=0)) / (X_train_q.max(axis=0) - X_train_q.min(axis=0) + 1e-10)
X_test_norm = (X_test_q - X_test_q.min(axis=0)) / (X_test_q.max(axis=0) - X_test_q.min(axis=0) + 1e-10)

print(f"\n⚛️  Quantum Circuit Configuration:")
print(f"  Qubits: {n_qubits}")
print(f"  Layers: {n_layers}")
print(f"  Parameters: {n_qubits * n_layers * 3}")

# Create quantum device
dev = qml.device('default.qubit', wires=n_qubits)

# Define quantum circuit
def quantum_circuit(features, weights):
    """Variational Quantum Classifier"""
    # Feature encoding (amplitude encoding)
    for i, feature in enumerate(features[:n_qubits]):
        qml.RY(feature * np.pi, wires=i)
    
    # Variational layers
    for layer_weights in weights:
        # Rotations
        for i in range(n_qubits):
            qml.RX(layer_weights[i, 0], wires=i)
            qml.RY(layer_weights[i, 1], wires=i)
            qml.RZ(layer_weights[i, 2], wires=i)
        
        # Entanglement (ring topology)
        for i in range(n_qubits):
            qml.CNOT(wires=[i, (i + 1) % n_qubits])
    
    return qml.expval(qml.PauliZ(0))

@qml.qnode(dev)
def quantum_prediction(features, weights):
    """QNode for prediction"""
    return quantum_circuit(features, weights)

def predict_quantum(X, weights):
    """Batch prediction"""
    predictions = []
    for x in X:
        # Get expectation value (-1 to 1)
        expectation = quantum_prediction(x, weights)
        # Convert to probability (0 to 1)
        prob = (expectation + 1) / 2
        predictions.append(prob)
    return pnp.array(predictions)

def accuracy(labels, predictions):
    """Calculate accuracy"""
    return np.mean((predictions > 0.5) == labels)

def binary_cross_entropy(labels, predictions):
    """Loss function for binary classification"""
    # Use PennyLane numpy for autograd compatibility
    predictions = pnp.clip(predictions, 1e-10, 1 - 1e-10)
    return -pnp.mean(labels * pnp.log(predictions) + (1 - labels) * pnp.log(1 - predictions))

def cost_function(weights, X, y):
    """Cost function for optimization"""
    predictions = predict_quantum(X, weights)
    return binary_cross_entropy(y, predictions)

# Initialize weights
print("\n🎲 Initializing quantum weights...")
initial_weights = pnp.random.randn(n_layers, n_qubits, 3, requires_grad=True)

# Training configuration
print("\n🏋️  Training quantum neural network...")
print(f"  Optimizer: Adam")
print(f"  Learning rate: 0.01")
print(f"  Batch size: 32")
print(f"  Max iterations: 100")

# Use smaller batch for training speed
batch_size = 32
n_iterations = 100

# Take a subset for faster training
train_subset_size = min(500, len(X_train_norm))
indices = np.random.choice(len(X_train_norm), train_subset_size, replace=False)
X_train_subset = X_train_norm[indices]
y_train_subset = y_train[indices]

# Optimizer
opt = qml.AdamOptimizer(stepsize=0.01)
weights = initial_weights

# Training loop
print("\n📈 Training progress:")
print("Iter | Loss    | Train Acc | Test Acc  | Time")
print("-" * 55)

best_weights = weights
best_acc = 0
training_history = []

import time
start_time = time.time()

for iteration in range(n_iterations):
    # Mini-batch training
    batch_indices = np.random.choice(len(X_train_subset), batch_size, replace=False)
    X_batch = X_train_subset[batch_indices]
    y_batch = y_train_subset[batch_indices]
    
    # Update weights
    weights, loss = opt.step_and_cost(
        lambda w: cost_function(w, X_batch, y_batch),
        weights
    )
    
    # Evaluate every 10 iterations
    if (iteration + 1) % 10 == 0:
        train_preds = predict_quantum(X_train_subset[:100], weights)
        train_acc = accuracy(y_train_subset[:100], train_preds)
        
        test_preds = predict_quantum(X_test_norm[:100], weights)
        test_acc = accuracy(y_test[:100], test_preds)
        
        elapsed = time.time() - start_time
        
        print(f"{iteration+1:4d} | {loss:.4f} | {train_acc:.3f}     | {test_acc:.3f}     | {elapsed:.1f}s")
        
        training_history.append({
            'iteration': iteration + 1,
            'loss': float(loss),
            'train_accuracy': float(train_acc),
            'test_accuracy': float(test_acc)
        })
        
        # Save best weights
        if test_acc > best_acc:
            best_acc = test_acc
            best_weights = weights.copy()

print("\n✓ Training complete!")

# Final evaluation with best weights
print("\n📊 Final Evaluation:")
print("-" * 55)

test_sample_size = min(200, len(X_test_norm))
test_sample_indices = np.random.choice(len(X_test_norm), test_sample_size, replace=False)

test_preds = predict_quantum(X_test_norm[test_sample_indices], best_weights)
test_labels = y_test[test_sample_indices]

final_acc = accuracy(test_labels, test_preds)
final_auc = roc_auc_score(test_labels, test_preds)
final_f1 = f1_score(test_labels, test_preds > 0.5)

print(f"Accuracy:  {final_acc:.3f} ({final_acc*100:.1f}%)")
print(f"ROC-AUC:   {final_auc:.3f}")
print(f"F1 Score:  {final_f1:.3f}")

# Save trained weights
print("\n💾 Saving trained quantum model...")
model_dir = './models/saved'
os.makedirs(model_dir, exist_ok=True)

# Save weights
weights_path = os.path.join(model_dir, 'quantum_weights.npy')
np.save(weights_path, best_weights)
print(f"✓ Weights saved: {weights_path}")

# Save normalization parameters
norm_params = {
    'min': X_train_q.min(axis=0).tolist(),
    'max': X_train_q.max(axis=0).tolist(),
    'n_qubits': n_qubits,
    'n_layers': n_layers
}
norm_path = os.path.join(model_dir, 'quantum_norm_params.json')
with open(norm_path, 'w') as f:
    json.dump(norm_params, f, indent=2)
print(f"✓ Normalization params saved: {norm_path}")

# Save training history
history_path = os.path.join(model_dir, 'quantum_training_history.json')
with open(history_path, 'w') as f:
    json.dump({
        'training_history': training_history,
        'final_metrics': {
            'accuracy': float(final_acc),
            'roc_auc': float(final_auc),
            'f1_score': float(final_f1)
        },
        'configuration': {
            'n_qubits': n_qubits,
            'n_layers': n_layers,
            'n_parameters': n_qubits * n_layers * 3,
            'optimizer': 'Adam',
            'learning_rate': 0.01,
            'batch_size': batch_size,
            'iterations': n_iterations,
            'train_samples': len(X_train_subset),
            'test_samples': test_sample_size
        },
        'timestamp': datetime.now().isoformat()
    }, f, indent=2)
print(f"✓ Training history saved: {history_path}")

print("\n" + "="*80)
print("🎉 QUANTUM MODEL TRAINING COMPLETE!")
print("="*80)
print(f"\n📦 Model artifacts:")
print(f"   • quantum_weights.npy ({os.path.getsize(weights_path)} bytes)")
print(f"   • quantum_norm_params.json")
print(f"   • quantum_training_history.json")
print(f"\n💡 Next steps:")
print(f"   1. Test: python -c 'from app.quantum.hybrid_model import QuantumEnhancedDropoutPredictor; q=QuantumEnhancedDropoutPredictor(); print(q.predict({{}}))'")
print(f"   2. Start ML service: uvicorn app.main:app --reload")
print(f"   3. Test endpoint: curl -X POST http://localhost:8000/api/predict-dropout-quantum")
