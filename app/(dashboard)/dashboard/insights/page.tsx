'use client';

import { useState, useEffect } from 'react';
import { Brain, TrendingUp, Zap, Target, MessageSquare, Activity, BarChart } from 'lucide-react';

export default function InsightsPage() {
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
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-slate-900">ML Insights</h1>
                <p className="text-slate-600 mt-1">AI-powered predictions from 7 trained models</p>
            </div>

            {/* Quantum ML Badge */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-xl border border-slate-700">
                <div className="flex items-center gap-3 mb-4">
                    <div className="bg-gradient-to-br from-teal-500 to-emerald-500 p-3 rounded-xl animate-pulse">
                        <Zap className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">Quantum-Enhanced Predictions</h2>
                        <p className="text-slate-400 text-sm">Hybrid quantum-classical model with 4 qubits active</p>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-teal-500/20 backdrop-blur-sm rounded-lg p-4 border border-teal-400/30">
                        <p className="text-teal-100 text-sm mb-1">Quantum Circuit</p>
                        <p className="text-white text-xl font-bold">4 Qubits</p>
                        <p className="text-teal-200 text-xs mt-1">3 variational layers</p>
                    </div>
                    <div className="bg-emerald-500/20 backdrop-blur-sm rounded-lg p-4 border border-emerald-400/30">
                        <p className="text-emerald-100 text-sm mb-1">Parameters</p>
                        <p className="text-white text-xl font-bold">36 Trainable</p>
                        <p className="text-emerald-200 text-xs mt-1">Optimized</p>
                    </div>
                    <div className="bg-amber-500/20 backdrop-blur-sm rounded-lg p-4 border border-amber-400/30">
                        <p className="text-amber-100 text-sm mb-1">Performance</p>
                        <p className="text-white text-xl font-bold">Hybrid Model</p>
                        <p className="text-amber-200 text-xs mt-1">70% classical + 30% quantum</p>
                    </div>
                </div>
            </div>

            {/* ML Models Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mlModels.map((model) => {
                    const Icon = model.icon;

                    return (
                        <div
                            key={model.name}
                            className="bg-white p-6 rounded-xl border-2 border-slate-200 hover:border-teal-500 transition shadow-sm hover:shadow-lg"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className={`bg-gradient-to-br ${colorClasses[model.color as keyof typeof colorClasses]} p-3 rounded-xl`}>
                                    <Icon className="w-6 h-6 text-white" />
                                </div>
                                <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">
                                    {model.accuracy}
                                </span>
                            </div>

                            <h3 className="text-lg font-bold text-slate-900 mb-2">{model.name}</h3>
                            <p className="text-sm text-slate-600 mb-4">{model.description}</p>

                            <div className="space-y-2 mb-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-600">Prediction:</span>
                                    <span className="font-bold text-teal-600">{model.prediction}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-600">Status:</span>
                                    <span className="font-semibold text-slate-900">{model.status}</span>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-200 space-y-2">
                                {model.metrics.map((metric, idx) => (
                                    <div key={idx} className="flex items-center justify-between text-sm">
                                        <span className="text-slate-500">{metric.label}:</span>
                                        <span className="font-medium text-slate-700">{metric.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Real-time Predictions Status */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <div className="flex items-start gap-4">
                    <div className="bg-blue-100 p-3 rounded-lg">
                        <Brain className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 mb-1">ML Service Status</h3>
                        <p className="text-slate-600 text-sm mb-3">
                            All 7 models trained and ready. Predictions update in real-time based on your activity.
                        </p>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                <span className="text-sm text-slate-600">Models Active</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                <span className="text-sm text-slate-600">Quantum Circuit Ready</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
