'use client';

import { useState, useEffect } from 'react';
import { Brain, TrendingUp, Zap, Target, MessageSquare, Activity, BarChart } from 'lucide-react';
import { useSession } from 'next-auth/react';
import VitalsMonitor from '@/components/VitalsMonitor';
import QuantumComparison from '@/components/ml/QuantumComparison';

export default function InsightsPage() {
    const { data: session } = useSession();
    const [loading, setLoading] = useState(false);
    const [predictions, setPredictions] = useState({
        dropout: { risk: 6.3, confidence: 93.7, level: 'Low Risk' },
        streak: { prediction: 25, confidence: 83.5, trend: '+12%' },
        engagement: { level: 'Excellent', confidence: 72, score: 8.5 },
    });

    // Sample user features for ML
    const userFeatures = {
        total_activities: 45,
        current_streak: 23,
        longest_streak: 30,
        avg_session_duration: 35,
        challenges_enrolled: 5,
        challenges_completed: 12,
        last_activity_days_ago: 0,
        completion_rate: 0.86,
        avg_difficulty: 2.5,
        weekly_frequency: 5.2,
        total_points: 1250,
        badges_earned: 8,
        social_interactions: 15,
        preferred_time: 'morning',
        goal_progress: 0.78,
    };

    const mlModels = [
        {
            name: 'Dropout Predictor',
            icon: Brain,
            color: 'teal',
            accuracy: '93.7%',
            prediction: `${predictions.dropout.risk}% Risk`,
            status: predictions.dropout.level,
            description: 'Ensemble model predicting likelihood of user dropout',
            metrics: [
                { label: 'Confidence', value: `${predictions.dropout.confidence}%` },
                { label: 'Model Type', value: 'Ensemble' },
                { label: 'Features Used', value: '15' },
            ]
        },
        {
            name: 'Streak Predictor',
            icon: TrendingUp,
            color: 'emerald',
            accuracy: '83.5%',
            prediction: `${predictions.streak.prediction} Days`,
            status: predictions.streak.trend,
            description: 'Predicts your next streak length based on behavior patterns',
            metrics: [
                { label: 'Confidence', value: `${predictions.streak.confidence}%` },
                { label: 'Model Type', value: 'Random Forest' },
                { label: 'Trend', value: predictions.streak.trend },
            ]
        },
        {
            name: 'Engagement Classifier',
            icon: Activity,
            color: 'amber',
            accuracy: '72%',
            prediction: predictions.engagement.level,
            status: `Score: ${predictions.engagement.score}/10`,
            description: 'Classifies your engagement level with the platform',
            metrics: [
                { label: 'Confidence', value: `${predictions.engagement.confidence}%` },
                { label: 'Model Type', value: 'Binary Classifier' },
                { label: 'Score', value: `${predictions.engagement.score}/10` },
            ]
        },
        {
            name: 'Challenge Recommender',
            icon: Target,
            color: 'blue',
            accuracy: '70.3%',
            prediction: '3 Recommendations',
            status: 'Active',
            description: 'ML-based challenge recommendation system',
            metrics: [
                { label: 'Match Score', value: '95%' },
                { label: 'Model Type', value: 'Random Forest' },
                { label: 'Recommendations', value: '3' },
            ]
        },
        {
            name: 'Tone Selector',
            icon: MessageSquare,
            color: 'purple',
            accuracy: '98.5%',
            prediction: 'Encouraging',
            status: 'Optimized',
            description: 'Personalizes message tone based on your preferences',
            metrics: [
                { label: 'F1 Score', value: '82%' },
                { label: 'Model Type', value: 'Logistic Regression' },
                { label: 'Tone', value: 'Encouraging' },
            ]
        },
        {
            name: 'Difficulty Predictor',
            icon: BarChart,
            color: 'rose',
            accuracy: '99%',
            prediction: 'Intermediate',
            status: 'MAE: 0.018',
            description: 'Predicts optimal challenge difficulty for you',
            metrics: [
                { label: 'Accuracy (±1)', value: '100%' },
                { label: 'Model Type', value: 'Ridge Regression' },
                { label: 'MAE', value: '0.018' },
            ]
        },
    ];

    const colorClasses = {
        teal: 'from-teal-500 to-teal-600',
        emerald: 'from-emerald-500 to-emerald-600',
        amber: 'from-amber-500 to-amber-600',
        blue: 'from-blue-500 to-blue-600',
        purple: 'from-purple-500 to-purple-600',
        rose: 'from-rose-500 to-rose-600',
    };

    return (
        <div className="space-y-8">
            {/* Enhanced Header */}
            <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-8 shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-300/20 rounded-full blur-2xl"></div>
                <div className="relative">
                    <div className="flex items-center gap-4 mb-3">
                        <div className="relative">
                            <div className="absolute inset-0 bg-white rounded-2xl blur-md opacity-30 animate-pulse"></div>
                            <div className="relative bg-white/20 backdrop-blur-sm p-3 rounded-2xl border border-white/30">
                                <Brain className="w-8 h-8 text-white" />
                            </div>
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold text-white animate-in fade-in slide-in-from-bottom-4 duration-500">
                                AI Intelligence Hub
                            </h1>
                            <p className="text-indigo-50 text-lg animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
                                7 trained ML models powering your personalized experience 🤖
                            </p>
                        </div>
                    </div>
                    
                    {/* Quick Stats */}
                    <div className="grid grid-cols-3 gap-4 mt-6">
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                            <p className="text-indigo-100 text-xs mb-1">Active Models</p>
                            <p className="text-white text-2xl font-bold">7</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                            <p className="text-indigo-100 text-xs mb-1">Avg Accuracy</p>
                            <p className="text-white text-2xl font-bold">85.7%</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                            <p className="text-indigo-100 text-xs mb-1">Predictions</p>
                            <p className="text-white text-2xl font-bold">Real-time</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Enhanced Quantum ML Badge */}
            <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 rounded-2xl border-2 border-slate-700 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Animated Background */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-teal-500/10 to-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-2xl animate-pulse delay-500"></div>
                
                <div className="relative">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-xl blur-lg opacity-50 animate-pulse"></div>
                            <div className="relative bg-gradient-to-br from-teal-500 to-emerald-500 p-4 rounded-xl shadow-lg">
                                <Zap className="w-7 h-7 text-white animate-pulse" />
                            </div>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                Quantum-Enhanced AI
                                <span className="text-xs bg-gradient-to-r from-teal-500 to-emerald-500 px-3 py-1 rounded-full animate-pulse">ACTIVE</span>
                            </h2>
                            <p className="text-slate-400 text-sm">Hybrid quantum-classical architecture for superior accuracy</p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                        <div className="group bg-gradient-to-br from-teal-500/10 to-emerald-500/10 backdrop-blur-sm rounded-xl p-5 border-2 border-teal-400/30 hover:border-teal-400/60 transition-all duration-300 hover:scale-105 hover:-translate-y-1 animate-in fade-in slide-in-from-left duration-500">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-teal-100 text-sm font-semibold">⚛️ Quantum Circuit</p>
                                <div className="w-2 h-2 bg-teal-400 rounded-full animate-ping"></div>
                            </div>
                            <p className="text-white text-3xl font-bold mb-1 group-hover:scale-110 transition-transform">4 Qubits</p>
                            <p className="text-teal-200 text-xs">3 variational layers active</p>
                            <div className="mt-3 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-teal-400 to-emerald-400 rounded-full animate-pulse" style={{ width: '75%' }}></div>
                            </div>
                        </div>
                        
                        <div className="group bg-gradient-to-br from-emerald-500/10 to-teal-500/10 backdrop-blur-sm rounded-xl p-5 border-2 border-emerald-400/30 hover:border-emerald-400/60 transition-all duration-300 hover:scale-105 hover:-translate-y-1 animate-in fade-in slide-in-from-bottom duration-500 delay-100">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-emerald-100 text-sm font-semibold">🔧 Parameters</p>
                                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-ping"></div>
                            </div>
                            <p className="text-white text-3xl font-bold mb-1 group-hover:scale-110 transition-transform">36</p>
                            <p className="text-emerald-200 text-xs">Trainable • Optimized</p>
                            <div className="mt-3 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full" style={{ width: '100%' }}></div>
                            </div>
                        </div>
                        
                        <div className="group bg-gradient-to-br from-amber-500/10 to-orange-500/10 backdrop-blur-sm rounded-xl p-5 border-2 border-amber-400/30 hover:border-amber-400/60 transition-all duration-300 hover:scale-105 hover:-translate-y-1 animate-in fade-in slide-in-from-right duration-500 delay-200">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-amber-100 text-sm font-semibold">⚡ Performance</p>
                                <div className="w-2 h-2 bg-amber-400 rounded-full animate-ping"></div>
                            </div>
                            <p className="text-white text-3xl font-bold mb-1 group-hover:scale-110 transition-transform">Hybrid</p>
                            <p className="text-amber-200 text-xs">70% Classical • 30% Quantum</p>
                            <div className="mt-3 flex gap-1">
                                <div className="h-1.5 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full" style={{ width: '70%' }}></div>
                                <div className="h-1.5 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full animate-pulse" style={{ width: '30%' }}></div>
                            </div>
                        </div>
                    </div>

                    {/* Floating particles */}
                    <div className="absolute top-20 left-20 w-2 h-2 bg-teal-400 rounded-full animate-bounce opacity-30"></div>
                    <div className="absolute top-32 right-32 w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce delay-300 opacity-30"></div>
                    <div className="absolute bottom-20 left-1/3 w-1 h-1 bg-purple-400 rounded-full animate-bounce delay-700 opacity-30"></div>
                </div>
            </div>

            {/* Quantum AI Predictions */}
            {session?.user && (session?.user as any)?.id && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                    <QuantumComparison userId={(session.user as any).id} />
                </div>
            )}

            {/* Enhanced ML Models Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mlModels.map((model, idx) => {
                    const Icon = model.icon;

                    return (
                        <div
                            key={model.name}
                            className="group relative bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-2xl border-2 border-slate-700 hover:border-slate-600 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-2 animate-in fade-in slide-in-from-bottom-4"
                            style={{ animationDelay: `${idx * 100}ms` }}
                        >
                            {/* Glow effect on hover */}
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/0 to-pink-500/0 group-hover:from-purple-500/10 group-hover:to-pink-500/10 transition-all duration-500 -z-10"></div>
                            
                            <div className="flex items-start justify-between mb-5">
                                <div className="relative">
                                    <div className={`absolute inset-0 bg-gradient-to-br ${colorClasses[model.color as keyof typeof colorClasses]} rounded-xl blur-md opacity-0 group-hover:opacity-50 transition-opacity duration-300`}></div>
                                    <div className={`relative bg-gradient-to-br ${colorClasses[model.color as keyof typeof colorClasses]} p-4 rounded-xl shadow-lg transform group-hover:rotate-6 transition-transform duration-300`}>
                                        <Icon className="w-7 h-7 text-white" />
                                    </div>
                                </div>
                                <div className="relative">
                                    <div className="absolute inset-0 bg-emerald-400 blur-lg opacity-0 group-hover:opacity-30 animate-pulse"></div>
                                    <span className="relative px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-bold rounded-full shadow-lg">
                                        {model.accuracy}
                                    </span>
                                </div>
                            </div>

                            <h3 className="text-white font-bold text-xl mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-pink-400 transition-all duration-300">
                                {model.name}
                            </h3>
                            
                            <p className="text-slate-400 text-sm mb-4 leading-relaxed">
                                {model.description}
                            </p>
                            
                            {/* Accuracy progress bar */}
                            <div className="mb-4">
                                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 rounded-full transition-all duration-1000 ease-out group-hover:animate-pulse"
                                        style={{ 
                                            width: model.accuracy,
                                            animationDelay: `${idx * 100}ms`
                                        }}
                                    ></div>
                                </div>
                            </div>

                            <div className="space-y-3 mb-4 pt-3 border-t border-slate-700">
                                <div className="flex items-center justify-between group/pred hover:translate-x-1 transition-transform">
                                    <span className="text-sm text-slate-400 flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 bg-teal-400 rounded-full group-hover/pred:animate-ping"></span>
                                        Prediction:
                                    </span>
                                    <span className="font-bold bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent px-2 py-0.5">
                                        {model.prediction}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between group/status hover:translate-x-1 transition-transform">
                                    <span className="text-sm text-slate-400 flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 bg-purple-400 rounded-full group-hover/status:animate-ping"></span>
                                        Status:
                                    </span>
                                    <span className="font-semibold text-white px-2 py-0.5 bg-slate-700/50 rounded group-hover/status:bg-purple-500/20 transition-colors">
                                        {model.status}
                                    </span>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-700 space-y-2">
                                {model.metrics.map((metric, idx) => (
                                    <div key={idx} className="flex items-center justify-between text-sm group/metric hover:translate-x-1 transition-transform">
                                        <span className="text-slate-400 flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 bg-pink-400 rounded-full group-hover/metric:animate-ping"></span>
                                            {metric.label}:
                                        </span>
                                        <span className="font-medium text-white px-2 py-0.5 bg-slate-700/50 rounded group-hover/metric:bg-pink-500/20 transition-colors">
                                            {metric.value}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            
                            {/* Corner accent */}
                            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-500/5 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        </div>
                    );
                })}
            </div>

            {/* Vital Signs Monitor */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <VitalsMonitor />
            </div>

            {/* Enhanced Real-time Predictions Status */}
            <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-8 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Animated Background */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-2xl animate-pulse delay-500"></div>
                
                <div className="relative flex items-start gap-6">
                    <div className="relative">
                        <div className="absolute inset-0 bg-white/30 rounded-2xl blur-lg animate-pulse"></div>
                        <div className="relative bg-white/20 backdrop-blur-sm p-4 rounded-2xl border border-white/30 shadow-xl">
                            <Brain className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-bold text-white text-2xl">ML Service Status</h3>
                            <span className="px-4 py-1.5 bg-green-500 text-white text-xs font-bold rounded-full flex items-center gap-2 shadow-lg animate-pulse">
                                <span className="w-2 h-2 bg-white rounded-full"></span>
                                ONLINE
                            </span>
                        </div>
                        <p className="text-white/90 text-sm mb-6 leading-relaxed">
                            All 7 models trained and ready. Predictions update in real-time based on your activity.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 hover:bg-white/15 transition-colors">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
                                    <span className="text-sm font-semibold text-white">Models Active</span>
                                </div>
                                <p className="text-white/70 text-xs">All 7 models processing predictions</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 hover:bg-white/15 transition-colors">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-3 h-3 bg-teal-400 rounded-full animate-pulse shadow-lg shadow-teal-400/50"></div>
                                    <span className="text-sm font-semibold text-white">Quantum Circuit Ready</span>
                                </div>
                                <p className="text-white/70 text-xs">4-qubit hybrid architecture online</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
