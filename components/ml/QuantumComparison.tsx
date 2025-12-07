'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Zap, TrendingUp } from 'lucide-react';

interface QuantumPrediction {
    dropout_probability: number;
    quantum_component: number;
    classical_component: number;
    risk_level: string;
    confidence: number;
    model_type: string;
    quantum_info?: {
        model_type: string;
        quantum_circuit: any;
        hybrid_weights: {
            classical_weight: number;
            quantum_weight: number;
        };
    };
}

interface ClassicalPrediction {
    dropout_probability: number;
    risk_level: string;
    model: string;
    accuracy: string;
}

interface ComparisonData {
    classical: ClassicalPrediction;
    quantum: QuantumPrediction;
    recommendation: string;
}

export default function QuantumComparison({ userId }: { userId: string }) {
    const { data: session } = useSession();
    const [loading, setLoading] = useState(false);
    const [comparison, setComparison] = useState<ComparisonData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [useQuantum, setUseQuantum] = useState(true);

    const fetchPredictions = async () => {
        if (!session?.user) return;
        
        setLoading(true);
        setError(null);

        try {
            // Fetch user data from dashboard endpoint
            const dashboardRes = await fetch('/api/dashboard');
            if (!dashboardRes.ok) throw new Error('Failed to fetch dashboard data');
            const dashboardData = await dashboardRes.json();
            
            const userData = dashboardData.data;

            // Prepare features from dashboard data
            const features = {
                user_id: userId,
                days_active: userData.stats?.completedChallenges || 30,
                avg_steps_last_7_days: 8000,
                avg_meditation_minutes: 15,
                avg_sleep_hours: 7.5,
                challenge_completion_rate: (userData.stats?.completedChallenges || 0) / 
                    ((userData.stats?.completedChallenges || 0) + (userData.activeChallenges || 1)),
                total_points_earned: userData.stats?.totalPoints || 1000,
                social_engagement_score: 0.7,
                social_interactions_count: 25,
                response_rate_to_notifications: 0.8,
                meditation_streak: userData.stats?.currentStreak || 5,
                preferred_activity_times: ['morning']
            };

            // Fetch comparison
            const compareRes = await fetch('/api/ml/compare', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(features)
            });

            if (!compareRes.ok) throw new Error('Failed to fetch predictions');
            
            const data = await compareRes.json();
            setComparison(data);

        } catch (err) {
            console.error('Prediction error:', err);
            setError(err instanceof Error ? err.message : 'Failed to load predictions');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPredictions();
    }, [userId, session]);

    if (loading) {
        return (
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-teal-500/20 flex items-center justify-center">
                        <span className="text-2xl">⚛️</span>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white">Quantum AI Prediction</h3>
                        <p className="text-slate-400 text-sm">Loading predictions...</p>
                    </div>
                </div>
                <div className="animate-pulse space-y-3">
                    <div className="h-20 bg-slate-700/50 rounded-lg"></div>
                    <div className="h-20 bg-slate-700/50 rounded-lg"></div>
                </div>
            </div>
        );
    }

    if (error || !comparison) {
        return (
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                        <span className="text-2xl">⚠️</span>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white">Quantum AI Unavailable</h3>
                        <p className="text-slate-400 text-sm">{error || 'Failed to load predictions'}</p>
                    </div>
                </div>
            </div>
        );
    }

    const activePrediction = useQuantum ? comparison.quantum : comparison.classical;
    const activeProb = activePrediction.dropout_probability * 100;

    return (
        <div className="space-y-6">
            {/* Main Prediction Card */}
            <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-2xl border-2 border-slate-700 shadow-2xl">
                {/* Background Effects */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-teal-500/10 to-emerald-500/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-2xl"></div>
                
                <div className="relative">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-xl blur-lg opacity-50"></div>
                                <div className="relative bg-gradient-to-br from-teal-500 to-emerald-500 p-3 rounded-xl shadow-lg">
                                    <Zap className="w-6 h-6 text-white" />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">
                                    {useQuantum ? 'Quantum-Enhanced Prediction' : 'Classical ML Prediction'}
                                </h3>
                                <p className="text-slate-400 text-sm">
                                    {useQuantum ? 'Hybrid quantum-classical model' : 'Ensemble voting classifier'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setUseQuantum(!useQuantum)}
                            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300 ${
                                useQuantum
                                    ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white hover:from-teal-600 hover:to-emerald-600 shadow-lg'
                                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                            }`}
                        >
                            {useQuantum ? 'Switch to Classical' : 'Use Quantum ⚛️'}
                        </button>
                    </div>

                    {/* Active Prediction Display */}
                    <div className={`relative rounded-xl p-6 border-2 transition-all duration-300 ${
                    activePrediction.risk_level === 'high'
                        ? 'bg-gradient-to-br from-rose-900/50 via-red-900/40 to-pink-900/30 border-rose-400/60 shadow-xl shadow-rose-500/30'
                        : activePrediction.risk_level === 'medium'
                        ? 'bg-gradient-to-br from-amber-900/50 via-orange-900/40 to-yellow-900/30 border-amber-400/60 shadow-xl shadow-amber-500/30'
                        : 'bg-gradient-to-br from-emerald-900/50 via-green-900/40 to-teal-900/30 border-emerald-400/60 shadow-xl shadow-emerald-500/30'
                }`}>
                    <div className="flex items-start justify-between mb-6">
                        <div>
                            <div className="flex items-baseline gap-2 mb-1">
                                <h3 className="text-4xl font-bold text-white">
                                    {activeProb.toFixed(1)}%
                                </h3>
                                <span className="text-lg text-slate-300">dropout risk</span>
                            </div>
                            <p className="text-slate-400 text-sm">
                                Predicted by {useQuantum ? 'Hybrid Quantum-Classical' : 'Ensemble'} model
                            </p>
                        </div>
                        <div className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wide shadow-lg ${
                            activePrediction.risk_level === 'high'
                                ? 'bg-gradient-to-r from-rose-500 to-red-600 text-white animate-pulse'
                                : activePrediction.risk_level === 'medium'
                                ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white'
                                : 'bg-gradient-to-r from-emerald-500 to-green-600 text-white'
                        }`}>
                            {activePrediction.risk_level} Risk
                        </div>
                    </div>

                    {/* Enhanced Progress Bar */}
                    <div className="relative w-full h-4 bg-slate-950/70 rounded-full overflow-hidden mb-6 shadow-inner border border-slate-700/50">
                        <div
                            className={`absolute top-0 left-0 h-full transition-all duration-700 ease-out ${
                                activePrediction.risk_level === 'high'
                                    ? 'bg-gradient-to-r from-rose-400 via-red-500 to-pink-500'
                                    : activePrediction.risk_level === 'medium'
                                    ? 'bg-gradient-to-r from-amber-400 via-orange-500 to-yellow-500'
                                    : 'bg-gradient-to-r from-emerald-400 via-green-500 to-teal-500'
                            }`}
                            style={{ width: `${activeProb}%` }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-pulse"></div>
                        </div>
                    </div>

                    {/* Quantum Components Breakdown */}
                    {useQuantum && comparison.quantum.quantum_component !== undefined && (
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-500/30">
                            <div className="bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-lg p-3 border border-cyan-400/40 shadow-lg shadow-cyan-500/20">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-lg">⚛️</span>
                                    <span className="text-xs font-semibold text-cyan-300 uppercase tracking-wide">Quantum</span>
                                </div>
                                <p className="text-2xl font-bold bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
                                    {(comparison.quantum.quantum_component * 100).toFixed(1)}%
                                </p>
                            </div>
                            <div className="bg-gradient-to-br from-indigo-500/20 to-purple-600/20 rounded-lg p-3 border border-indigo-400/40 shadow-lg shadow-indigo-500/20">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-lg">🖥️</span>
                                    <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wide">Classical</span>
                                </div>
                                <p className="text-2xl font-bold bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent">
                                    {(comparison.quantum.classical_component * 100).toFixed(1)}%
                                </p>
                            </div>
                        </div>
                    )}
                    </div>
                </div>
            </div>

            {/* Model Comparison Cards - Premium Design */}
            <div className="grid grid-cols-2 gap-6">
                {/* Classical ML Card */}
                <div 
                    className={`group relative overflow-hidden rounded-2xl border-2 transition-all duration-700 cursor-pointer ${
                        !useQuantum 
                            ? 'bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 border-indigo-400/60 shadow-2xl shadow-indigo-500/40 scale-[1.03]' 
                            : 'bg-gradient-to-br from-slate-800/80 to-slate-900/70 border-slate-700 hover:border-indigo-400/50 hover:shadow-xl hover:shadow-indigo-500/20'
                    }`}
                    onClick={() => setUseQuantum(false)}
                >
                    {/* Animated Background Rings */}
                    <div className={`absolute inset-0 transition-opacity duration-700 ${!useQuantum ? 'opacity-100' : 'opacity-0'}`}>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl animate-pulse"></div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-300"></div>
                    </div>
                    
                    {/* Content */}
                    <div className="relative p-8 text-center">
                        {/* Icon Container */}
                        <div className="relative inline-flex items-center justify-center mb-6">
                            <div className={`absolute inset-0 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl blur-2xl transition-all duration-700 ${
                                !useQuantum ? 'opacity-60 scale-125 animate-pulse' : 'opacity-0 scale-100'
                            }`}></div>
                            <div className={`relative w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-700 ${
                                !useQuantum 
                                    ? 'bg-gradient-to-br from-indigo-500 via-indigo-600 to-blue-600 shadow-2xl shadow-indigo-500/60 rotate-[8deg] scale-110' 
                                    : 'bg-slate-800 border-2 border-slate-700 group-hover:border-indigo-500/40 group-hover:bg-slate-700'
                            }`}>
                                <span className={`text-5xl transition-transform duration-700 ${!useQuantum ? 'scale-110' : 'scale-100'}`}>🖥️</span>
                            </div>
                        </div>
                        
                        {/* Title with Underline */}
                        <div className="mb-5">
                            <h4 className={`text-base font-black uppercase tracking-widest mb-2 transition-all duration-500 ${
                                !useQuantum ? 'text-white' : 'text-slate-400 group-hover:text-indigo-300'
                            }`}>
                                Classical ML
                            </h4>
                            <div className={`w-16 h-1 mx-auto rounded-full transition-all duration-500 ${
                                !useQuantum ? 'bg-gradient-to-r from-indigo-400 to-blue-500 w-24' : 'bg-slate-700 group-hover:bg-indigo-500/30'
                            }`}></div>
                        </div>
                        
                        {/* Large Prediction Display */}
                        <div className="mb-6">
                            <p className={`text-5xl font-black mb-2 transition-all duration-500 ${
                                !useQuantum 
                                    ? 'text-white drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]' 
                                    : 'text-slate-400 group-hover:text-indigo-400'
                            }`}>
                                {(comparison.classical.dropout_probability * 100).toFixed(1)}%
                            </p>
                            <p className={`text-sm font-medium uppercase tracking-wide ${
                                !useQuantum ? 'text-indigo-300' : 'text-slate-500'
                            }`}>
                                Dropout Risk
                            </p>
                        </div>
                        
                        {/* Model Info Card */}
                        <div className={`inline-flex flex-col gap-2 px-4 py-3 rounded-xl transition-all duration-500 ${
                            !useQuantum 
                                ? 'bg-indigo-500/20 border border-indigo-400/40 shadow-lg' 
                                : 'bg-slate-800 border border-slate-700 group-hover:border-indigo-500/30'
                        }`}>
                            <div className="flex items-center gap-2 justify-center">
                                <span className={`w-2 h-2 rounded-full transition-all duration-500 ${
                                    !useQuantum ? 'bg-indigo-400 animate-pulse shadow-lg shadow-indigo-400/50' : 'bg-slate-600'
                                }`}></span>
                                <span className={`text-xs font-bold uppercase tracking-wider ${
                                    !useQuantum ? 'text-white' : 'text-slate-400'
                                }`}>
                                    {comparison.classical.model}
                                </span>
                            </div>
                            <div className={`text-xs ${!useQuantum ? 'text-indigo-200' : 'text-slate-500'}`}>
                                Ensemble Model
                            </div>
                        </div>
                    </div>
                    
                    {/* Active Indicator */}
                    {!useQuantum && (
                        <div className="absolute top-4 right-4 animate-in fade-in zoom-in duration-500">
                            <div className="relative">
                                <div className="absolute inset-0 bg-indigo-400 rounded-full blur-lg animate-pulse"></div>
                                <div className="relative flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 via-indigo-600 to-blue-600 text-white text-xs font-black rounded-full shadow-2xl shadow-indigo-500/60 uppercase tracking-wider">
                                    <span className="relative flex h-2.5 w-2.5">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
                                    </span>
                                    Active
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Quantum AI Card */}
                <div 
                    className={`group relative overflow-hidden rounded-2xl border-2 transition-all duration-700 cursor-pointer ${
                        useQuantum 
                            ? 'bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 border-cyan-400/60 shadow-2xl shadow-cyan-500/40 scale-[1.03]' 
                            : 'bg-gradient-to-br from-slate-800/80 to-slate-900/70 border-slate-700 hover:border-cyan-400/50 hover:shadow-xl hover:shadow-cyan-500/20'
                    }`}
                    onClick={() => setUseQuantum(true)}
                >
                    {/* Animated Background Rings */}
                    <div className={`absolute inset-0 transition-opacity duration-700 ${useQuantum ? 'opacity-100' : 'opacity-0'}`}>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl animate-pulse"></div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-teal-500/5 rounded-full blur-3xl animate-pulse delay-300"></div>
                    </div>
                    
                    {/* Content */}
                    <div className="relative p-8 text-center">
                        {/* Icon Container */}
                        <div className="relative inline-flex items-center justify-center mb-6">
                            <div className={`absolute inset-0 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-2xl blur-2xl transition-all duration-700 ${
                                useQuantum ? 'opacity-60 scale-125 animate-pulse' : 'opacity-0 scale-100'
                            }`}></div>
                            <div className={`relative w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-700 ${
                                useQuantum 
                                    ? 'bg-gradient-to-br from-cyan-500 via-cyan-600 to-teal-600 shadow-2xl shadow-cyan-500/60 -rotate-[8deg] scale-110' 
                                    : 'bg-slate-800 border-2 border-slate-700 group-hover:border-cyan-500/40 group-hover:bg-slate-700'
                            }`}>
                                <span className={`text-5xl transition-transform duration-700 ${useQuantum ? 'scale-110' : 'scale-100'}`}>⚛️</span>
                            </div>
                        </div>
                        
                        {/* Title with Underline */}
                        <div className="mb-5">
                            <h4 className={`text-base font-black uppercase tracking-widest mb-2 transition-all duration-500 ${
                                useQuantum ? 'text-white' : 'text-slate-400 group-hover:text-cyan-300'
                            }`}>
                                Quantum AI
                            </h4>
                            <div className={`w-16 h-1 mx-auto rounded-full transition-all duration-500 ${
                                useQuantum ? 'bg-gradient-to-r from-cyan-400 to-teal-500 w-24' : 'bg-slate-700 group-hover:bg-cyan-500/30'
                            }`}></div>
                        </div>
                        
                        {/* Large Prediction Display */}
                        <div className="mb-6">
                            <p className={`text-5xl font-black mb-2 transition-all duration-500 ${
                                useQuantum 
                                    ? 'text-white drop-shadow-[0_0_15px_rgba(6,182,212,0.5)]' 
                                    : 'text-slate-400 group-hover:text-cyan-400'
                            }`}>
                                {(comparison.quantum.dropout_probability * 100).toFixed(1)}%
                            </p>
                            <p className={`text-sm font-medium uppercase tracking-wide ${
                                useQuantum ? 'text-cyan-300' : 'text-slate-500'
                            }`}>
                                Dropout Risk
                            </p>
                        </div>
                        
                        {/* Model Info Card */}
                        <div className={`inline-flex flex-col gap-2 px-4 py-3 rounded-xl transition-all duration-500 ${
                            useQuantum 
                                ? 'bg-cyan-500/20 border border-cyan-400/40 shadow-lg' 
                                : 'bg-slate-800 border border-slate-700 group-hover:border-cyan-500/30'
                        }`}>
                            <div className="flex items-center gap-2 justify-center">
                                <span className={`w-2 h-2 rounded-full transition-all duration-500 ${
                                    useQuantum ? 'bg-cyan-400 animate-pulse shadow-lg shadow-cyan-400/50' : 'bg-slate-600'
                                }`}></span>
                                <span className={`text-xs font-bold uppercase tracking-wider ${
                                    useQuantum ? 'text-white' : 'text-slate-400'
                                }`}>
                                    Hybrid Q-C
                                </span>
                            </div>
                            <div className={`text-xs ${useQuantum ? 'text-cyan-200' : 'text-slate-500'}`}>
                                4 Qubits • 70/30 Hybrid
                            </div>
                        </div>
                    </div>
                    
                    {/* Active Indicator */}
                    {useQuantum && (
                        <div className="absolute top-4 right-4 animate-in fade-in zoom-in duration-500">
                            <div className="relative">
                                <div className="absolute inset-0 bg-cyan-400 rounded-full blur-lg animate-pulse"></div>
                                <div className="relative flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 via-cyan-600 to-teal-600 text-white text-xs font-black rounded-full shadow-2xl shadow-cyan-500/60 uppercase tracking-wider">
                                    <span className="relative flex h-2.5 w-2.5">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
                                    </span>
                                    Active
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* AI Recommendation */}
            <div className="group relative overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-2xl border-2 border-slate-700 hover:border-purple-500/50 shadow-2xl transition-all duration-300 hover:scale-[1.02]">
                {/* Animated Background Glow */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-3xl opacity-50 group-hover:opacity-70 transition-opacity duration-500"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 rounded-full blur-2xl opacity-40 group-hover:opacity-60 transition-opacity duration-500"></div>
                
                <div className="relative flex items-start gap-5">
                    {/* Enhanced Icon */}
                    <div className="relative flex-shrink-0">
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl blur-lg opacity-60 animate-pulse"></div>
                        <div className="relative bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-500 p-3 rounded-xl shadow-xl shadow-amber-500/50 transform group-hover:rotate-12 group-hover:scale-110 transition-all duration-300">
                            <span className="text-2xl">💡</span>
                        </div>
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                            <h4 className="text-base font-bold text-white uppercase tracking-wide">
                                AI Recommendation
                            </h4>
                            <span className="px-2 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold rounded-full animate-pulse">
                                Smart
                            </span>
                        </div>
                        <p className="text-slate-200 text-base leading-relaxed">
                            {comparison.recommendation || 'Quantum-enhanced predictions provide higher accuracy with quantum circuit optimization'}
                        </p>
                        
                        {/* Additional Stats */}
                        <div className="mt-4 pt-4 border-t border-slate-700/50 grid grid-cols-3 gap-3">
                            <div className="text-center">
                                <p className="text-xs text-slate-400 mb-1">Confidence</p>
                                <p className="text-lg font-bold text-emerald-400">
                                    {useQuantum && comparison.quantum.confidence
                                        ? `${(comparison.quantum.confidence * 100).toFixed(0)}%`
                                        : '93%'
                                    }
                                </p>
                            </div>
                            <div className="text-center">
                                <p className="text-xs text-slate-400 mb-1">Model</p>
                                <p className="text-sm font-bold text-purple-400">
                                    {useQuantum ? 'Quantum' : 'Classical'}
                                </p>
                            </div>
                            <div className="text-center">
                                <p className="text-xs text-slate-400 mb-1">Status</p>
                                <div className="flex items-center justify-center gap-1">
                                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                                    <p className="text-sm font-bold text-emerald-400">Active</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
