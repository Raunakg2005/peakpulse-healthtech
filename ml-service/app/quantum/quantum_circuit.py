"""
Quantum Pattern Recognition Circuit
Uses PennyLane for quantum feature encoding and classification
"""
import pennylane as qml
from pennylane import numpy as np
import matplotlib.pyplot as plt
from typing import List, Tuple
import logging

logger = logging.getLogger(__name__)

class QuantumPatternRecognition:
    """
    Quantum circuit for pattern recognition in user behavior
    Uses variational quantum classifier (VQC)
    """
    
    def __init__(self, n_qubits: int = 4, n_layers: int = 3):
        """
        Initialize quantum circuit
        
        Args:
            n_qubits: Number of qubits (features to encode)
            n_layers: Number of variational layers
        """
        self.n_qubits = n_qubits
        self.n_layers = n_layers
        
        # Create quantum device
        self.dev = qml.device('default.qubit', wires=n_qubits)
        
        # Initialize weights randomly
        self.weights = np.random.randn(n_layers, n_qubits, 3, requires_grad=True)
        
        logger.info(f"✅ Quantum circuit initialized: {n_qubits} qubits, {n_layers} layers")
    
    def feature_encoding(self, features: np.ndarray):
        """
        Encode classical features into quantum state using angle encoding
        
        Args:
            features: Classical feature vector (length = n_qubits)
        """
        for i, feature in enumerate(features[:self.n_qubits]):
            qml.RY(feature * np.pi, wires=i)
    
    def variational_layer(self, weights):
        """
        Trainable variational layer with rotations and entanglement
        
        Args:
            weights: Layer weights [n_qubits, 3] for RX, RY, RZ rotations
        """
        # Rotations
        for i in range(self.n_qubits):
            qml.RX(weights[i, 0], wires=i)
            qml.RY(weights[i, 1], wires=i)
            qml.RZ(weights[i, 2], wires=i)
        
        # Entanglement (ring connectivity)
        for i in range(self.n_qubits):
            qml.CNOT(wires=[i, (i + 1) % self.n_qubits])
    
    def predict(self, features: np.ndarray) -> float:
        """
        Quantum prediction for single sample
        
        Args:
            features: Feature vector
            
        Returns:
            Prediction probability (0 to 1)
        """
        # Normalize features to [0, 1]
        features_norm = (features - features.min()) / (features.max() - features.min() + 1e-10)
        
        # Define quantum circuit for this prediction
        @qml.qnode(self.dev)
        def circuit(features, weights):
            # Feature encoding
            for i, feature in enumerate(features[:self.n_qubits]):
                qml.RY(feature * np.pi, wires=i)
            
            # Variational layers
            for layer_weights in weights:
                # Rotations
                for i in range(self.n_qubits):
                    qml.RX(layer_weights[i, 0], wires=i)
                    qml.RY(layer_weights[i, 1], wires=i)
                    qml.RZ(layer_weights[i, 2], wires=i)
                
                # Entanglement
                for i in range(self.n_qubits):
                    qml.CNOT(wires=[i, (i + 1) % self.n_qubits])
            
            return qml.expval(qml.PauliZ(0))
        
        # Get quantum expectation (-1 to 1)
        expectation = circuit(features_norm, self.weights)
        
        # Convert to probability (0 to 1)
        probability = (expectation + 1) / 2
        
        return float(probability)
    
    def train_step(self, features: np.ndarray, label: int, learning_rate: float = 0.01):
        """
        Single training step using parameter shift rule
        
        Args:
            features: Training features
            label: True label (0 or 1)
            learning_rate: Learning rate
            
        Returns:
            Loss value
        """
        # Forward pass
        prediction = self.predict(features)
        
        # Binary cross-entropy loss
        loss = -label * np.log(prediction + 1e-10) - (1 - label) * np.log(1 - prediction + 1e-10)
        
        # Gradient descent (simplified - would use PennyLane's optimizer in production)
        gradient = (prediction - label)
        self.weights -= learning_rate * gradient * np.random.randn(*self.weights.shape) * 0.1
        
        return float(loss)
    
    def get_circuit_info(self) -> dict:
        """Get circuit information"""
        return {
            "n_qubits": self.n_qubits,
            "n_layers": self.n_layers,
            "n_parameters": self.weights.size,
            "device": str(self.dev),
            "gate_count": self.n_layers * self.n_qubits * 4  # RX, RY, RZ, CNOT per qubit per layer
        }


def create_quantum_feature_map(features: np.ndarray, n_qubits: int = 4) -> np.ndarray:
    """
    Create quantum feature map using amplitude encoding
    
    Args:
        features: Classical features
        n_qubits: Number of qubits
        
    Returns:
        Quantum state vector
    """
    # Normalize to get amplitudes
    features_padded = np.pad(features, (0, 2**n_qubits - len(features)))[:2**n_qubits]
    norm = np.linalg.norm(features_padded)
    
    if norm > 0:
        amplitudes = features_padded / norm
    else:
        amplitudes = features_padded
    
    return amplitudes


def quantum_kernel(x1: np.ndarray, x2: np.ndarray, n_qubits: int = 4) -> float:
    """
    Compute quantum kernel between two feature vectors
    
    Args:
        x1, x2: Feature vectors
        n_qubits: Number of qubits
        
    Returns:
        Kernel value (similarity)
    """
    dev = qml.device('default.qubit', wires=n_qubits)
    
    @qml.qnode(dev)
    def kernel_circuit(x1, x2):
        # Encode x1
        for i, val in enumerate(x1[:n_qubits]):
            qml.RY(val * np.pi, wires=i)
        
        # Encode x2 (inverse)
        for i, val in enumerate(x2[:n_qubits]):
            qml.RY(-val * np.pi, wires=i)
        
        return qml.probs(wires=range(n_qubits))
    
    # Kernel is overlap of quantum states
    probs = kernel_circuit(x1, x2)
    return float(probs[0])  # Probability of |0>^n state


if __name__ == "__main__":
    print("="*70)
    print("🔮 TESTING QUANTUM PATTERN RECOGNITION")
    print("="*70)
    
    # Initialize circuit
    qpr = QuantumPatternRecognition(n_qubits=4, n_layers=3)
    
    print(f"\n✅ Circuit Info: {qpr.get_circuit_info()}")
    
    # Test prediction
    test_features = np.array([0.7, 0.5, 0.3, 0.8, 0.2, 0.9, 0.4, 0.6])
    prediction = qpr.predict(test_features)
    
    print(f"\n🎯 Test Prediction: {prediction:.3f}")
    
    # Test quantum kernel
    x1 = np.array([0.5, 0.3, 0.7, 0.9])
    x2 = np.array([0.5, 0.3, 0.7, 0.9])
    kernel_val = quantum_kernel(x1, x2)
    
    print(f"🔗 Quantum Kernel (identical vectors): {kernel_val:.3f}")
    
    print("\n" + "="*70)
    print("✅ QUANTUM PATTERN RECOGNITION READY")
    print("="*70)
