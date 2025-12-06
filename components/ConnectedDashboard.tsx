
'use client';

import { useEffect, useState } from 'react';
import { Brain, Target, Award, Activity, Zap } from 'lucide-react';
import { fetchDashboardData, fetchMLPredictions } from '@/lib/api';
import QuantumInsights from './ml/QuantumInsights';
import CalorieTracker from './CalorieTracker';
import UserStatsWidget from './UserStatsWidget';

export default function ConnectedDashboard() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const refreshDashboard = async () => {
        try {
            const [dashboardData, mlData] = await Promise.all([
                fetchDashboardData().catch(() => ({ data: null })),
                fetchMLPredictions().catch(() => null),
            ]);
            setData({ ...dashboardData.data, ml: mlData });
        } catch (error) {
            console.error('Error loading dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshDashboard();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Welcome back!</h1>
                    <p className="text-slate-600 mt-1">Here's your health overview</p>
                </div>
            </div>

            {/* Stats Grid - Connected to Real Data */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-teal-50 p-3 rounded-lg">
                            <Activity className="w-6 h-6 text-teal-600" />
                        </div>
                        <span className="text-2xl font-bold text-slate-900">
                            {data?.currentStreak || 0}
                        </span>
                    </div>
                    <p className="text-slate-600 font-medium">Current Streak</p>
                    <p className="text-sm text-emerald-600 mt-1">
                        {data?.currentStreak > 0 ? 'Keep it up!' : 'Start today!'}
                    </p>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-emerald-50 p-3 rounded-lg">
                            <Target className="w-6 h-6 text-emerald-600" />
                        </div>
                        <span className="text-2xl font-bold text-slate-900">
                            {data?.activeChallenges || 0}/{data?.totalChallenges || 0}
                        </span>
                    </div>
                    <p className="text-slate-600 font-medium">Challenges</p>
                    <p className="text-sm text-slate-500 mt-1">
                        {(data?.totalChallenges - data?.activeChallenges) || 0} remaining
                    </p>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-amber-50 p-3 rounded-lg">
                            <Award className="w-6 h-6 text-amber-600" />
                        </div>
                        <span className="text-2xl font-bold text-slate-900">
                            {data?.totalPoints?.toLocaleString() || '0'}
                        </span>
                    </div>
                    <p className="text-slate-600 font-medium">Total Points</p>
                    <p className="text-sm text-slate-500 mt-1">
                        Level {Math.floor((data?.totalPoints || 0) / 250)}
                    </p>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-teal-50 p-3 rounded-lg">
                            <Brain className="w-6 h-6 text-teal-600" />
                        </div>
                        <span className="text-2xl font-bold text-emerald-600">
                            {data?.ml?.dropout_probability
                                ? `${(data.ml.dropout_probability * 100).toFixed(1)}%`
                                : 'N/A'}
                        </span>
                    </div>
                    <p className="text-slate-600 font-medium">Dropout Risk</p>
                    <p className="text-sm text-emerald-600 mt-1">
                        {data?.ml?.risk_level === 'low' ? 'Excellent!' : 'Keep going!'}
                    </p>
                </div>
            </div>

            {/* Quantum ML Insights - New Component */}
            <QuantumInsights userProfile={{
                user_id: data?.user?.id,
                days_active: data?.stats?.currentStreak || 1,
                avg_steps_last_7_days: 7500,
                meditation_streak: data?.stats?.currentStreak || 0,
                challenge_completion_rate: 0.75,
                social_engagement_score: 0.6,
                preferred_activity_times: ['morning'],
                response_rate_to_notifications: 0.8
            }} />

            {/* Legacy Quantum Section (keep for comparison) */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-6 border border-slate-700">
                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-gradient-to-br from-teal-500 to-emerald-500 p-3 rounded-lg">
                        <Zap className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">ML Prediction Summary</h2>
                        <p className="text-slate-400 text-sm">Classical ensemble model results</p>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-teal-500/20 backdrop-blur-sm rounded-lg p-4 border border-teal-400/30">
                        <p className="text-teal-100 text-sm mb-2">Dropout Prediction</p>
                        <p className="text-white text-2xl font-bold">
                            {data?.ml?.risk_level === 'low' ? 'Low Risk' :
                                data?.ml?.risk_level === 'medium' ? 'Medium Risk' :
                                    data?.ml?.risk_level === 'high' ? 'High Risk' : 'Calculating...'}
                        </p>
                        <p className="text-teal-200 text-xs mt-1">93.7% accurate</p>
                    </div>

                    <div className="bg-emerald-500/20 backdrop-blur-sm rounded-lg p-4 border border-emerald-400/30">
                        <p className="text-emerald-100 text-sm mb-2">Streak Forecast</p>
                        <p className="text-white text-2xl font-bold">
                            {data?.ml?.days_until_predicted_dropout || 'N/A'} days
                        </p>
                        <p className="text-emerald-200 text-xs mt-1">83.5% accurate</p>
                    </div>

                    <div className="bg-amber-500/20 backdrop-blur-sm rounded-lg p-4 border border-emerald-400/30">
                        <p className="text-amber-100 text-sm mb-2">Engagement</p>
                        <p className="text-white text-2xl font-bold">
                            {data?.ml?.engagement_level || 'Good'}
                        </p>
                        <p className="text-amber-200 text-xs mt-1">71% accurate</p>
                    </div>
                </div>
            </div>

            {/* Recent Activities */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Recent Activity</h3>
                {data?.recentActivities && data.recentActivities.length > 0 ? (
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                        {data.recentActivities.map((activity: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition px-2 rounded-lg">
                                <div>
                                    <p className="font-medium text-slate-900">{activity.name}</p>
                                    <div className="flex items-center gap-2 text-sm text-slate-500">
                                        <span>{activity.type}</span>
                                        <span>•</span>
                                        <span>{new Date(activity.completedAt || activity.timestamp).toLocaleString()}</span>
                                    </div>
                                </div>
                                <span className="text-sm text-teal-600 font-medium bg-teal-50 px-2 py-1 rounded">
                                    +{activity.points || activity.duration || 0} pts
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="h-32 flex items-center justify-center bg-slate-50 rounded-lg">
                        <p className="text-slate-400">No recent activities. Start logging!</p>
                    </div>
                )}
            </div>

            {/* Two Column Layout */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Calorie Tracker */}
                <CalorieTracker onActivityLogged={refreshDashboard} />

                {/* User StatsWidget */}
                <UserStatsWidget key={data?.totalPoints} />
            </div>
        </div>
    );
}
