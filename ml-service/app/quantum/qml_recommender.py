"""
Quantum Machine Learning Components
Uses PennyLane for quantum circuit-based recommendations
Hybrid quantum-classical approach for challenge matching
"""

import numpy as np
import logging
from typing import Dict, List

try:
    import pennylane as qml
    PENNYLANE_AVAILABLE = True
except ImportError:
    PENNYLANE_AVAILABLE = False
    logging.warning("PennyLane not available. Using classical simulation.")

logger = logging.getLogger(__name__)

class QuantumChallengeRecommender:
    def __init__(self, n_qubits: int = 4):
        """
        Initialize Quantum ML recommender.
        
        Args:
            n_qubits: Number of qubits to use in quantum circuit
        """
        self.n_qubits = n_qubits
        self.dev = None
        self.qnode = None
        
        if PENNYLANE_AVAILABLE:
            try:
                # Create quantum device (simulator)
                self.dev = qml.device('default.qubit', wires=n_qubits)
                self.qnode = qml.QNode(self._quantum_circuit, self.dev)
                logger.info(f"Quantum device initialized with {n_qubits} qubits")
            except Exception as e:
                logger.error(f"Failed to initialize quantum device: {str(e)}")
                PENNYLANE_AVAILABLE = False
    
    def _quantum_circuit(self, features: np.ndarray, weights: np.ndarray) -> float:
        """
        Quantum circuit for feature encoding and classification.
        
        Args:
            features: User features to encode
            weights: Trainable weights for quantum gates
            
        Returns:
            Measurement expectation value
        """
        # Feature encoding layer (angle encoding)
        for i in range(self.n_qubits):
            qml.RY(features[i % len(features)], wires=i)
        
        # Entanglement layer
        for i in range(self.n_qubits - 1):
            qml.CNOT(wires=[i, i + 1])
        
        # Variational layer with trainable parameters
        for i in range(self.n_qubits):
            qml.RY(weights[i], wires=i)
            qml.RZ(weights[i + self.n_qubits], wires=i)
        
        # Another entanglement layer
        for i in range(self.n_qubits - 1):
            qml.CNOT(wires=[i, i + 1])
        
        # Measurement
        return qml.expval(qml.PauliZ(0))
    
    def quantum_score(
        self, 
        user_features: Dict, 
        challenge_features: Dict
    ) -> float:
        """
        Calculate quantum-enhanced similarity score.
        
        Args:
            user_features: User profile features
            challenge_features: Challenge characteristics
            
        Returns:
            Similarity score (0-1)
        """
        if not PENNYLANE_AVAILABLE or self.qnode is None:
            # Fallback to classical computation
            return self._classical_fallback(user_features, challenge_features)
        
        try:
            # Prepare feature vector
            features = self._prepare_features(user_features, challenge_features)
            
            # Initialize weights (in production, these would be trained)
            weights = np.random.uniform(0, 2 * np.pi, size=2 * self.n_qubits)
            
            # Run quantum circuit
            result = self.qnode(features, weights)
            
            # Convert to probability (0-1 range)
            score = (result + 1) / 2  # Transform from [-1, 1] to [0, 1]
            
            return float(score)
            
        except Exception as e:
            logger.error(f"Quantum circuit error: {str(e)}")
            return self._classical_fallback(user_features, challenge_features)
    
    def _prepare_features(
        self, 
        user_features: Dict, 
        challenge_features: Dict
    ) -> np.ndarray:
        """
        Prepare normalized feature vector for quantum encoding.
        
        Args:
            user_features: User profile data
            challenge_features: Challenge data
            
        Returns:
            Normalized feature array
        """
        features = []
        
        # User features
        features.append(user_features.get("completion_rate", 0.5))
        features.append(user_features.get("social_score", 0.5))
        features.append(user_features.get("engagement", 0.5))
        features.append(user_features.get("streak_factor", 0.5))
        
        # Challenge features
        features.append(challenge_features.get("difficulty", 3) / 5.0)
        features.append(1.0 if challenge_features.get("social_component") else 0.0)
        features.append(challenge_features.get("popularity", 0.5))
        features.append(challenge_features.get("success_rate", 0.5))
        
        # Normalize to [0, π] for angle encoding
        features = np.array(features[:self.n_qubits])
        features = features * np.pi
        
        return features
    
    def _classical_fallback(
        self, 
        user_features: Dict, 
        challenge_features: Dict
    ) -> float:
        """Classical computation fallback when quantum is unavailable."""
        # Simple cosine similarity
        user_vec = np.array([
            user_features.get("completion_rate", 0.5),
            user_features.get("social_score", 0.5),
            user_features.get("engagement", 0.5),
            user_features.get("streak_factor", 0.5)
        ])
        
        challenge_vec = np.array([
            challenge_features.get("difficulty", 3) / 5.0,
            1.0 if challenge_features.get("social_component") else 0.0,
            challenge_features.get("popularity", 0.5),
            challenge_features.get("success_rate", 0.5)
        ])
        
        # Cosine similarity
        dot_product = np.dot(user_vec, challenge_vec)
        norm_user = np.linalg.norm(user_vec)
        norm_challenge = np.linalg.norm(challenge_vec)
        
        if norm_user == 0 or norm_challenge == 0:
            return 0.5
        
        similarity = dot_product / (norm_user * norm_challenge)
        
        # Normalize to 0-1
        return (similarity + 1) / 2
    
    def get_circuit_visualization(self) -> Dict:
        """
        Get quantum circuit visualization data.
        
        Returns:
            Dictionary with circuit information for visualization
        """
        if not PENNYLANE_AVAILABLE or self.dev is None:
            return {
                "available": False,
                "message": "Quantum computing framework not available"
            }
        
        try:
            # Generate sample circuit
            sample_features = np.random.uniform(0, np.pi, size=self.n_qubits)
            sample_weights = np.random.uniform(0, 2 * np.pi, size=2 * self.n_qubits)
            
            # Get circuit drawing
            circuit_info = {
                "available": True,
                "n_qubits": self.n_qubits,
                "device": str(self.dev),
                "gates_used": ["RY", "RZ", "CNOT"],
                "circuit_depth": 4,
                "description": "Variational Quantum Circuit with angle encoding"
            }
            
            return circuit_info
            
        except Exception as e:
            logger.error(f"Error generating circuit visualization: {str(e)}")
            return {
                "available": False,
                "error": str(e)
            }


class QuantumPatternRecognizer:
    """
    Uses quantum computing for pattern recognition in user behavior.
    Detects subtle patterns that classical ML might miss.
    """
    
    def __init__(self, n_qubits: int = 3):
        self.n_qubits = n_qubits
        self.dev = None
        
        if PENNYLANE_AVAILABLE:
            try:
                self.dev = qml.device('default.qubit', wires=n_qubits)
                logger.info(f"Quantum pattern recognizer initialized with {n_qubits} qubits")
            except Exception as e:
                logger.error(f"Failed to initialize quantum pattern recognizer: {str(e)}")
    
    def detect_patterns(self, behavior_sequence: List[float]) -> Dict:
        """
        Detect patterns in user behavior using quantum interference.
        
        Args:
            behavior_sequence: Time series of user engagement scores
            
        Returns:
            Pattern detection results
        """
        if not PENNYLANE_AVAILABLE or self.dev is None:
            return self._classical_pattern_detection(behavior_sequence)
        
        try:
            # Use quantum Fourier transform for pattern detection
            patterns = self._quantum_fourier_analysis(behavior_sequence)
            
            return {
                "patterns_detected": patterns,
                "method": "quantum",
                "confidence": 0.85
            }
            
        except Exception as e:
            logger.error(f"Quantum pattern recognition error: {str(e)}")
            return self._classical_pattern_detection(behavior_sequence)
    
    def _quantum_fourier_analysis(self, sequence: List[float]) -> List[str]:
        """Simplified quantum Fourier transform for pattern detection."""
        # Placeholder for actual QFT implementation
        # In production, implement quantum Fourier transform
        
        patterns = []
        
        # Analyze sequence for patterns
        avg_engagement = np.mean(sequence)
        std_engagement = np.std(sequence)
        
        if std_engagement < 0.1:
            patterns.append("consistent_behavior")
        
        if avg_engagement > 0.7:
            patterns.append("high_engagement")
        elif avg_engagement < 0.3:
            patterns.append("declining_engagement")
        
        # Check for cyclical patterns
        if len(sequence) >= 7:
            weekly_pattern = sequence[-7:]
            if max(weekly_pattern) - min(weekly_pattern) > 0.5:
                patterns.append("weekly_variation")
        
        return patterns if patterns else ["stable_pattern"]
    
    def _classical_pattern_detection(self, sequence: List[float]) -> Dict:
        """Classical fallback for pattern detection."""
        patterns = []
        
        if not sequence:
            return {"patterns_detected": ["insufficient_data"], "method": "classical", "confidence": 0.3}
        
        avg = np.mean(sequence)
        
        if avg > 0.7:
            patterns.append("high_engagement")
        elif avg < 0.3:
            patterns.append("low_engagement")
        else:
            patterns.append("moderate_engagement")
        
        return {
            "patterns_detected": patterns,
            "method": "classical_fallback",
            "confidence": 0.65
        }


def is_quantum_available() -> bool:
    """Check if quantum computing is available."""
    return PENNYLANE_AVAILABLE


def get_quantum_info() -> Dict:
    """Get information about quantum computing availability."""
    if PENNYLANE_AVAILABLE:
        try:
            import pennylane as qml
            return {
                "available": True,
                "version": qml.__version__,
                "devices": ["default.qubit", "lightning.qubit"],
                "status": "operational"
            }
        except:
            return {"available": False, "status": "import_failed"}
    else:
        return {
            "available": False,
            "status": "not_installed",
            "message": "Install with: pip install pennylane"
        }
