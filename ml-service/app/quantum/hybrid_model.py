"""
Hybrid Quantum-Classical Dropout Predictor
Combines quantum feature processing with classical ML
"""
import numpy as np
import joblib
import logging
import os
from typing import Dict
from .quantum_circuit import QuantumPatternRecognition, quantum_kernel

logger = logging.getLogger(__name__)

class QuantumEnhancedDropoutPredictor:
    """
    Hybrid model: Quantum circuit for feature extraction + Classical ensemble
    """
    
    def __init__(self, n_qubits: int = 4):
        """
        Initialize hybrid quantum-classical model
        
        Args:
            n_qubits: Number of qubits for quantum circuit
        """
        self.n_qubits = n_qubits
        
        # Quantum component
        self.quantum_circuit = QuantumPatternRecognition(n_qubits=n_qubits, n_layers=3)
        
        # Try to load trained quantum weights
        try:
            import json
            weights_path = './models/saved/quantum_weights.npy'
            norm_path = './models/saved/quantum_norm_params.json'
            
            if os.path.exists(weights_path):
                trained_weights = np.load(weights_path)
                self.quantum_circuit.weights = trained_weights
                logger.info(f"✅ Loaded TRAINED quantum weights ({trained_weights.shape})")
                
                # Load normalization parameters
                if os.path.exists(norm_path):
                    with open(norm_path, 'r') as f:
                        self.norm_params = json.load(f)
                    logger.info("✅ Loaded quantum normalization parameters")
                else:
                    self.norm_params = None
            else:
                self.norm_params = None
                logger.warning("⚠️  Using untrained quantum weights (random initialization)")
        except Exception as e:
            self.norm_params = None
            logger.warning(f"⚠️  Could not load quantum weights: {e}")
        
        # Classical component (load trained model)
        try:
            self.classical_model = joblib.load('./models/saved/dropout_predictor_ENSEMBLE.pkl')
            logger.info("✅ Loaded classical dropout ensemble")
        except:
            self.classical_model = None
            logger.warning("⚠️  Classical model not found, using quantum only")
        
        # Dynamic weighting: If quantum is trained, give it more weight
        if self.norm_params is not None:
            self.alpha = 0.5  # 50% classical
            self.beta = 0.5   # 50% quantum (trained)
            logger.info("⚡ Using balanced hybrid mode (both models trained)")
        else:
            self.alpha = 0.7  # 70% classical
            self.beta = 0.3   # 30% quantum (untrained)
            logger.info("📊 Using classical-heavy mode (quantum untrained)")
        
        logger.info(f"✅ Hybrid Quantum-Classical model initialized ({n_qubits} qubits)")
    
    def predict(self, features: Dict) -> Dict:
        """
        Hybrid prediction combining quantum and classical
        
        Args:
            features: User feature dictionary
            
        Returns:
            Prediction with quantum and classical components
        """
        # Extract feature vector
        feature_vec = self._prepare_features(features)
        
        # Quantum prediction
        quantum_prob = self.quantum_circuit.predict(feature_vec)
        
        # Classical prediction
        if self.classical_model:
            classical_prob = float(self.classical_model.predict_proba([feature_vec])[0][1])
        else:
            classical_prob = 0.5
        
        # Hybrid combination
        hybrid_prob = self.alpha * classical_prob + self.beta * quantum_prob
        
        return {
            "dropout_probability": hybrid_prob,
            "quantum_component": quantum_prob,
            "classical_component": classical_prob,
            "hybrid_weights": {"classical": self.alpha, "quantum": self.beta},
            "prediction": "high_risk" if hybrid_prob > 0.5 else "low_risk",
            "confidence": abs(hybrid_prob - 0.5) * 2  # 0 to 1 scale
        }
    
    def quantum_feature_extraction(self, features: np.ndarray) -> np.ndarray:
        """
        Use quantum circuit to extract quantum-enhanced features
        
        Args:
            features: Input features
            
        Returns:
            Quantum-transformed features
        """
        quantum_features = []
        
        # Use quantum kernel to compare with different basis states
        basis_states = [
            np.array([1, 0, 0, 0]),
            np.array([0, 1, 0, 0]),
            np.array([0, 0, 1, 0]),
            np.array([0, 0, 0, 1])
        ]
        
        for basis in basis_states:
            kernel_val = quantum_kernel(features[:4], basis, self.n_qubits)
            quantum_features.append(kernel_val)
        
        return np.array(quantum_features)
    
    def _prepare_features(self, features: Dict) -> np.ndarray:
        """Convert feature dict to numpy array (15 features for ensemble model)"""
        return np.array([
            features.get('days_active', 10),
            features.get('total_days', 30),
            features.get('avg_steps', 5000),
            features.get('meditation_streak', 3),
            features.get('avg_meditation', 5),
            features.get('avg_sleep', 7),
            features.get('completion_rate', 0.5),
            features.get('total_points', 500),
            features.get('social_score', 0.5),
            features.get('social_interactions', 50),
            features.get('notification_response', 0.5),
            0.5,  # mood correlation
            0,    # activity_slope
            0,    # three_day_decline
            0     # consistency_score
        ])
    
    def get_quantum_info(self) -> Dict:
        """Get information about quantum component"""
        circuit_info = self.quantum_circuit.get_circuit_info()
        
        return {
            "model_type": "Hybrid Quantum-Classical",
            "quantum_circuit": circuit_info,
            "hybrid_weights": {
                "classical_weight": self.alpha,
                "quantum_weight": self.beta
            },
            "total_parameters": circuit_info["n_parameters"]
        }


class QuantumSupportVectorMachine:
    """
    Quantum Support Vector Machine using quantum kernel
    """
    
    def __init__(self, n_qubits: int = 4):
        self.n_qubits = n_qubits
        self.support_vectors = None
        self.support_labels = None
        self.alphas = None
        
        logger.info(f"✅ Quantum SVM initialized ({n_qubits} qubits)")
    
    def quantum_kernel_matrix(self, X1: np.ndarray, X2: np.ndarray) -> np.ndarray:
        """
        Compute quantum kernel matrix between two sets of samples
        
        Args:
            X1, X2: Feature matrices
            
        Returns:
            Kernel matrix
        """
        K = np.zeros((len(X1), len(X2)))
        
        for i, x1 in enumerate(X1):
            for j, x2 in enumerate(X2):
                K[i, j] = quantum_kernel(x1, x2, self.n_qubits)
        
        return K
    
    def fit(self, X: np.ndarray, y: np.ndarray):
        """
        Fit QSVM (simplified - stores all points as support vectors)
        
        Args:
            X: Training features
            y: Training labels
        """
        self.support_vectors = X
        self.support_labels = y
        self.alphas = np.ones(len(y)) / len(y)  # Simplified
        
        logger.info(f"QSVM fitted with {len(X)} support vectors")
    
    def predict(self, X: np.ndarray) -> np.ndarray:
        """
        Predict using quantum kernel
        
        Args:
            X: Test features
            
        Returns:
            Predictions
        """
        if self.support_vectors is None:
            raise ValueError("Model not fitted")
        
        # Compute kernel between test and support vectors
        K = self.quantum_kernel_matrix(X, self.support_vectors)
        
        # Decision function
        decision = np.dot(K, self.alphas * self.support_labels)
        
        return (decision > 0).astype(int)


if __name__ == "__main__":
    print("="*70)
    print("🔮 TESTING HYBRID QUANTUM-CLASSICAL DROPOUT PREDICTOR")
    print("="*70)
    
    # Initialize hybrid model
    hybrid_model = QuantumEnhancedDropoutPredictor(n_qubits=4)
    
    # Test prediction
    test_user = {
        'days_active': 15,
        'avg_steps': 7500,
        'meditation_streak': 5,
        'completion_rate': 0.75,
        'social_score': 0.6
    }
    
    prediction = hybrid_model.predict(test_user)
    
    print("\n📊 Hybrid Prediction Results:")
    print(f"   Dropout Probability: {prediction['dropout_probability']:.3f}")
    print(f"   Quantum Component:   {prediction['quantum_component']:.3f}")
    print(f"   Classical Component: {prediction['classical_component']:.3f}")
    print(f"   Prediction:          {prediction['prediction']}")
    print(f"   Confidence:          {prediction['confidence']:.3f}")
    
    # Get model info
    info = hybrid_model.get_quantum_info()
    print(f"\n🔮 Quantum Info:")
    print(f"   Model Type: {info['model_type']}")
    print(f"   Qubits: {info['quantum_circuit']['n_qubits']}")
    print(f"   Quantum Parameters: {info['total_parameters']}")
    print(f"   Hybrid Weights: Classical={info['hybrid_weights']['classical_weight']}, Quantum={info['hybrid_weights']['quantum_weight']}")
    
    print("\n" + "="*70)
    print("✅ HYBRID QUANTUM-CLASSICAL MODEL READY")
    print("="*70)
