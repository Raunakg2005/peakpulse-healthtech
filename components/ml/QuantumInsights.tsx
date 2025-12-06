'use client';

import { useEffect, useState } from 'react';
import { Zap, Activity, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface QuantumInsightsProps {
    userProfile?: any;
}

export default function QuantumInsights({ userProfile }: QuantumInsightsProps) {
    const [comparison, setComparison] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadQuantumPrediction() {
            if (!userProfile) {
                setLoading(false);
                return;
            }

            try {
                const res = await fetch('/api/ml/compare', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(userProfile),
                });

                if (res.ok) {
                    const data = await res.json();
                    setComparison(data);
                } else {
                    setError('Quantum service unavailable');
                }
            } catch (err) {
                console.error('Quantum prediction error:', err);
                setError('Could not load quantum insights');
            } finally {
                setLoading(false);
            }
        }

        loadQuantumPrediction();
    }, [userProfile]);

    if (loading) {
        return (
            <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl p-6 text-white">
                <div className="flex items-center gap-3 mb-4">
                    <Zap className="w-6 h-6" />
                    <h3 className="text-xl font-bold">Quantum ML Insights</h3>
                </div>
                <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
                </div>
            </div>
        );
    }

    if (error || !comparison?.quantum?.available) {
        return (
            <div className="bg-gradient-to-br from-slate-600 to-slate-700 rounded-2xl p-6 text-white">
                <div className="flex items-center gap-3 mb-4">
                    <Zap className="w-6 h-6 opacity-50" />
                    <h3 className="text-xl font-bold">Quantum ML Insights</h3>
                </div>
                <p className="text-slate-300 text-sm">
                    Quantum predictions temporarily unavailable. Using classical models only.
                </p>
            </div>
        );
    }

    const { classical, quantum, recommendation } = comparison;
    const quantumConfidence = Math.abs(quantum.probability - 0.5) * 2;
    const classicalConfidence = Math.abs(classical.probability - 0.5) * 2;

    return (
        <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl p-6 text-white">
            <div className="flex items-center gap-3 mb-4">
                <Zap className="w-6 h-6" />
                <div>
                    <h3 className="text-xl font-bold">Quantum ML Insights</h3>
                    <p className="text-purple-200 text-xs">Hybrid Quantum-Classical Analysis</p>
                </div>
            </div>

            {/* Quantum Component Breakdown */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-purple-200 text-xs mb-1">Quantum Component</p>
                        <p className="text-2xl font-bold">{(quantum.quantum_component * 100).toFixed(1)}%</p>
                        <p className="text-xs text-purple-200 mt-1">4 qubits, 36 parameters</p>
                    </div>
                    <div>
                        <p className="text-purple-200 text-xs mb-1">Classical Component</p>
                        <p className="text-2xl font-bold">{(quantum.classical_component * 100).toFixed(1)}%</p>
                        <p className="text-xs text-purple-200 mt-1">Ensemble (93.7% acc)</p>
                    </div>
                </div>
            </div>

            {/* Model Comparison */}
            <div className="space-y-3">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Classical Model</span>
                        <span className="text-lg font-bold">{(classical.probability * 100).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2">
                        <div
                            className="bg-white rounded-full h-2 transition-all"
                            style={{ width: `${classical.probability * 100}%` }}
                        ></div>
                    </div>
                    <p className="text-xs text-purple-200 mt-1">
                        Risk: {classical.risk_level} • Confidence: {(classicalConfidence * 100).toFixed(0)}%
                    </p>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium flex items-center gap-1">
                            <Zap className="w-4 h-4" />
                            Quantum-Hybrid
                        </span>
                        <span className="text-lg font-bold">{(quantum.probability * 100).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2">
                        <div
                            className="bg-gradient-to-r from-yellow-300 to-purple-300 rounded-full h-2 transition-all"
                            style={{ width: `${quantum.probability * 100}%` }}
                        ></div>
                    </div>
                    <p className="text-xs text-purple-200 mt-1">
                        Hybrid • Confidence: {(quantumConfidence * 100).toFixed(0)}%
                    </p>
                </div>
            </div>

            {/* Recommendation */}
            <div className="mt-4 flex items-start gap-2 bg-white/10 backdrop-blur-sm rounded-lg p-3">
                {recommendation === 'Use quantum' ? (
                    <>
                        <CheckCircle2 className="w-5 h-5 text-green-300 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="font-medium text-sm">Quantum Advantage Detected</p>
                            <p className="text-xs text-purple-200 mt-1">
                                Quantum model shows higher confidence for this prediction
                            </p>
                        </div>
                    </>
                ) : (
                    <>
                        <Activity className="w-5 h-5 text-blue-300 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="font-medium text-sm">Classical Model Preferred</p>
                            <p className="text-xs text-purple-200 mt-1">
                                Ensemble model provides more reliable prediction for this case
                            </p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
