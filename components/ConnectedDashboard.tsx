
'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Brain, Target, Award, Activity, Zap } from 'lucide-react';
import { fetchDashboardData, fetchMLPredictions } from '@/lib/api';
import QuantumInsights from './ml/QuantumInsights';
import CalorieTracker from './CalorieTracker';
import UserStatsWidget from './UserStatsWidget';

export default function ConnectedDashboard() {
    const { data: session } = useSession();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const refreshDashboard = async () => {
        try {
            const userId = (session?.user as any)?.id;
            const [dashboardData, mlData] = await Promise.all([
                fetchDashboardData().catch(() => ({ data: null })),
                userId ? fetchMLPredictions(userId).catch(() => null) : Promise.resolve(null),
            ]);
            
            // Flatten the data structure for easier access
            const flatData = {
                ...dashboardData.data,
                currentStreak: dashboardData.data?.stats?.currentStreak || 0,
                totalPoints: dashboardData.data?.stats?.totalPoints || 0,
                totalChallenges: (dashboardData.data?.activeChallenges || 0) + (dashboardData.data?.stats?.completedChallenges || 0),
                ml: mlData
            };
            
            setData(flatData);
        } catch (error) {
            console.error('Error loading dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (session) {
            refreshDashboard();
        }
    }, [session]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[500px] space-y-6">
                {/* Animated Logo/Icon */}
                <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
                    <div className="relative bg-gradient-to-br from-teal-500 to-emerald-500 p-6 rounded-full animate-bounce">
                        <Activity className="w-12 h-12 text-white" />
                    </div>
                </div>
                
                {/* Spinning Loader */}
                <div className="relative">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200"></div>
                    <div className="absolute inset-0 animate-spin rounded-full h-16 w-16 border-4 border-transparent border-t-teal-600 border-r-emerald-600"></div>
                </div>

                {/* Loading Text */}
                <div className="text-center space-y-2">
                    <p className="text-lg font-semibold text-slate-700 animate-pulse">Loading your dashboard...</p>
                    <p className="text-sm text-slate-500">Preparing your health insights</p>
                </div>

                {/* Progress Dots */}
                <div className="flex gap-2">
                    <div className="w-3 h-3 bg-teal-500 rounded-full animate-bounce"></div>
                    <div className="w-3 h-3 bg-emerald-500 rounded-full animate-bounce delay-100"></div>
                    <div className="w-3 h-3 bg-teal-600 rounded-full animate-bounce delay-200"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Enhanced Header with Gradient */}
            <div className="relative overflow-hidden bg-gradient-to-br from-teal-500 via-emerald-500 to-cyan-600 rounded-2xl p-8 shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-300/20 rounded-full blur-2xl"></div>
                <div className="relative">
                    <h1 className="text-4xl font-bold text-white mb-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        Welcome back, {session?.user?.name?.split(' ')[0] || 'Champion'}! 👋
                    </h1>
                    <p className="text-teal-50 text-lg animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
                        You're doing amazing! Here's your health journey at a glance
                    </p>
                </div>
            </div>

            {/* Enhanced Stats Grid with Gradients */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="group relative bg-gradient-to-br from-teal-500 to-emerald-600 p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 animate-in fade-in slide-in-from-bottom-4">
                    <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 rounded-xl transition-opacity"></div>
                    <div className="relative">
                        <div className="flex items-center justify-between mb-4">
                            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-lg">
                                <Activity className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-3xl font-bold text-white">
                                {data?.currentStreak || 0}
                            </span>
                        </div>
                        <p className="text-white font-semibold text-lg">Current Streak</p>
                        <p className="text-teal-50 text-sm mt-1 flex items-center gap-1">
                            🔥 {data?.currentStreak > 0 ? 'Keep it up!' : 'Start today!'}
                        </p>
                    </div>
                </div>

                <div className="group relative bg-gradient-to-br from-purple-500 to-pink-600 p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 animate-in fade-in slide-in-from-bottom-4 delay-100">
                    <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 rounded-xl transition-opacity"></div>
                    <div className="relative">
                        <div className="flex items-center justify-between mb-4">
                            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-lg">
                                <Target className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-3xl font-bold text-white">
                                {data?.activeChallenges || 0}/{data?.totalChallenges || 0}
                            </span>
                        </div>
                        <p className="text-white font-semibold text-lg">Active Challenges</p>
                        <p className="text-purple-50 text-sm mt-1">
                            🎯 {(data?.totalChallenges - data?.activeChallenges) || 0} to explore
                        </p>
                    </div>
                </div>

                <div className="group relative bg-gradient-to-br from-amber-500 to-orange-600 p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 animate-in fade-in slide-in-from-bottom-4 delay-200">
                    <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 rounded-xl transition-opacity"></div>
                    <div className="relative">
                        <div className="flex items-center justify-between mb-4">
                            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-lg">
                                <Award className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-3xl font-bold text-white">
                                {data?.totalPoints?.toLocaleString() || '0'}
                            </span>
                        </div>
                        <p className="text-white font-semibold text-lg">Total Points</p>
                        <p className="text-amber-50 text-sm mt-1">
                            ⭐ Level {Math.floor((data?.totalPoints || 0) / 250)}
                        </p>
                    </div>
                </div>

                <div className="group relative bg-gradient-to-br from-emerald-500 to-teal-600 p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 animate-in fade-in slide-in-from-bottom-4 delay-300">
                    <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 rounded-xl transition-opacity"></div>
                    <div className="relative">
                        <div className="flex items-center justify-between mb-4">
                            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-lg">
                                <Brain className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-3xl font-bold text-white">
                                {data?.ml?.dropout_probability
                                    ? `${(data.ml.dropout_probability * 100).toFixed(1)}%`
                                    : 'N/A'}
                            </span>
                        </div>
                        <p className="text-white font-semibold text-lg">Dropout Risk</p>
                        <p className="text-emerald-50 text-sm mt-1">
                            ✨ {data?.ml?.risk_level === 'low' ? 'Excellent!' : 'Keep going!'}
                        </p>
                    </div>
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

            {/* Enhanced ML Prediction Section with Advanced Animations */}
            <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-8 border-2 border-slate-700 shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-700">
                {/* Animated Background Elements */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-teal-500/20 to-emerald-500/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-2xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-full blur-2xl animate-pulse delay-500"></div>
                
                <div className="relative">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-xl blur-lg opacity-50 animate-pulse"></div>
                            <div className="relative bg-gradient-to-br from-teal-500 to-emerald-500 p-4 rounded-xl">
                                <Zap className="w-7 h-7 text-white animate-pulse" />
                            </div>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                AI-Powered Insights
                                <span className="text-xs bg-gradient-to-r from-teal-500 to-emerald-500 px-2 py-1 rounded-full animate-pulse">LIVE</span>
                            </h2>
                            <p className="text-slate-400 text-sm">Real-time predictions from our ML ensemble</p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="group relative bg-gradient-to-br from-teal-500/10 to-emerald-500/10 backdrop-blur-sm rounded-xl p-6 border-2 border-teal-400/30 hover:border-teal-400/60 transition-all duration-300 hover:scale-105 hover:-translate-y-1 hover:shadow-2xl hover:shadow-teal-500/20 animate-in fade-in slide-in-from-left duration-500">
                            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/0 to-emerald-500/0 group-hover:from-teal-500/20 group-hover:to-emerald-500/20 rounded-xl transition-all duration-300"></div>
                            <div className="relative">
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-teal-100 text-sm font-semibold">Dropout Risk</p>
                                    <div className="w-2 h-2 bg-teal-400 rounded-full animate-ping"></div>
                                </div>
                                <p className="text-white text-3xl font-bold mb-2 group-hover:scale-110 transition-transform duration-300">
                                    {data?.ml?.predictions?.dropout?.risk_level === 'low' ? '✅ Low' :
                                        data?.ml?.predictions?.dropout?.risk_level === 'medium' ? '⚠️ Medium' :
                                            data?.ml?.predictions?.dropout?.risk_level === 'high' ? '🔴 High' : '⏳ Analyzing...'}
                                </p>
                                <div className="flex items-center justify-between">
                                    <p className="text-teal-200 text-xs">
                                        {data?.ml?.predictions?.dropout?.dropout_probability 
                                            ? `${(data.ml.predictions.dropout.dropout_probability * 100).toFixed(1)}% probability` 
                                            : '93.7% accurate'}
                                    </p>
                                    <Brain className="w-4 h-4 text-teal-300 opacity-50 group-hover:opacity-100 group-hover:animate-pulse" />
                                </div>
                                <div className="mt-3 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-gradient-to-r from-teal-400 to-emerald-400 rounded-full transition-all duration-1000 ease-out"
                                        style={{ width: data?.ml?.predictions?.dropout?.dropout_probability ? `${(1 - data.ml.predictions.dropout.dropout_probability) * 100}%` : '93.7%' }}
                                    ></div>
                                </div>
                            </div>
                        </div>

                        <div className="group relative bg-gradient-to-br from-emerald-500/10 to-teal-500/10 backdrop-blur-sm rounded-xl p-6 border-2 border-emerald-400/30 hover:border-emerald-400/60 transition-all duration-300 hover:scale-105 hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-500/20 animate-in fade-in slide-in-from-bottom duration-500 delay-100">
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 to-teal-500/0 group-hover:from-emerald-500/20 group-hover:to-teal-500/20 rounded-xl transition-all duration-300"></div>
                            <div className="relative">
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-emerald-100 text-sm font-semibold">Streak Forecast</p>
                                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-ping"></div>
                                </div>
                                <p className="text-white text-3xl font-bold mb-2 group-hover:scale-110 transition-transform duration-300">
                                    {data?.ml?.predictions?.dropout?.days_until_predicted_dropout 
                                        ? `🔥 ${data.ml.predictions.dropout.days_until_predicted_dropout}d`
                                        : data?.ml?.predictions?.streak?.predicted_streak_length
                                        ? `🔥 ${data.ml.predictions.streak.predicted_streak_length}d`
                                        : '📊 N/A'}
                                </p>
                                <div className="flex items-center justify-between">
                                    <p className="text-emerald-200 text-xs">83.5% accurate</p>
                                    <Activity className="w-4 h-4 text-emerald-300 opacity-50 group-hover:opacity-100 group-hover:animate-pulse" />
                                </div>
                                <div className="mt-3 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full animate-pulse"
                                        style={{ width: '83.5%' }}
                                    ></div>
                                </div>
                            </div>
                        </div>

                        <div className="group relative bg-gradient-to-br from-amber-500/10 to-orange-500/10 backdrop-blur-sm rounded-xl p-6 border-2 border-amber-400/30 hover:border-amber-400/60 transition-all duration-300 hover:scale-105 hover:-translate-y-1 hover:shadow-2xl hover:shadow-amber-500/20 animate-in fade-in slide-in-from-right duration-500 delay-200">
                            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/0 to-orange-500/0 group-hover:from-amber-500/20 group-hover:to-orange-500/20 rounded-xl transition-all duration-300"></div>
                            <div className="relative">
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-amber-100 text-sm font-semibold">Streak Break Risk</p>
                                    <div className="w-2 h-2 bg-amber-400 rounded-full animate-ping"></div>
                                </div>
                                <p className="text-white text-3xl font-bold mb-2 group-hover:scale-110 transition-transform duration-300">
                                    {(() => {
                                        const breakProb = data?.ml?.predictions?.streak?.streak_break_probability;
                                        if (breakProb === undefined) return '⏳ Loading';
                                        if (breakProb < 0.3) return '✨ Low';
                                        if (breakProb < 0.6) return '⚡ Medium';
                                        return '⚠️ High';
                                    })()}
                                </p>
                                <div className="flex items-center justify-between">
                                    <p className="text-amber-200 text-xs">
                                        {data?.ml?.predictions?.streak?.streak_break_probability 
                                            ? `${(data.ml.predictions.streak.streak_break_probability * 100).toFixed(1)}% probability` 
                                            : '71% accurate'}
                                    </p>
                                    <Target className="w-4 h-4 text-amber-300 opacity-50 group-hover:opacity-100 group-hover:animate-pulse" />
                                </div>
                                <div className="mt-3 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-gradient-to-r from-amber-400 to-orange-400 rounded-full transition-all duration-1000 ease-out"
                                        style={{ width: data?.ml?.predictions?.streak?.streak_break_probability ? `${(1 - data.ml.predictions.streak.streak_break_probability) * 100}%` : '71%' }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Floating Particles Animation */}
                    <div className="absolute top-10 left-10 w-2 h-2 bg-teal-400 rounded-full animate-bounce opacity-30"></div>
                    <div className="absolute top-20 right-20 w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce delay-300 opacity-30"></div>
                    <div className="absolute bottom-10 left-1/4 w-1 h-1 bg-purple-400 rounded-full animate-bounce delay-700 opacity-30"></div>
                    <div className="absolute bottom-20 right-1/3 w-2 h-2 bg-amber-400 rounded-full animate-bounce delay-500 opacity-30"></div>
                </div>
            </div>

            {/* Enhanced Recent Activities */}
            <div className="bg-white p-6 rounded-xl border-2 border-slate-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-br from-teal-500 to-emerald-500 p-2 rounded-lg">
                            <Activity className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">Recent Activity</h3>
                    </div>
                    <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                        {data?.recentActivities?.length || 0} activities
                    </span>
                </div>
                {data?.recentActivities && data.recentActivities.length > 0 ? (
                    <div className="space-y-2 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                        {data.recentActivities.map((activity: any, idx: number) => (
                            <div 
                                key={idx} 
                                className="group flex items-center justify-between p-4 border-2 border-slate-100 hover:border-teal-300 hover:bg-gradient-to-r hover:from-teal-50 hover:to-emerald-50 transition-all rounded-xl cursor-pointer"
                                style={{ animation: `fadeIn 0.3s ease-out ${idx * 0.05}s both` }}
                            >
                                <div className="flex-1">
                                    <p className="font-semibold text-slate-900 group-hover:text-teal-600 transition-colors">
                                        {activity.name}
                                    </p>
                                    <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                                        <span className="bg-slate-100 px-2 py-0.5 rounded-full font-medium">
                                            {activity.type}
                                        </span>
                                        <span>•</span>
                                        <span>{new Date(activity.completedAt || activity.timestamp).toLocaleString()}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-teal-600 bg-gradient-to-r from-teal-100 to-emerald-100 px-4 py-2 rounded-lg border-2 border-teal-200 group-hover:scale-110 transition-transform">
                                        +{activity.points || activity.duration || 0} pts
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="relative h-40 flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border-2 border-dashed border-slate-300">
                        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-emerald-500/5 rounded-xl"></div>
                        <Activity className="w-12 h-12 text-slate-300 mb-2" />
                        <p className="text-slate-500 font-medium">No recent activities</p>
                        <p className="text-slate-400 text-sm">Start logging to see your progress!</p>
                    </div>
                )}
            </div>

            {/* Two Column Layout with Staggered Animation */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Calorie Tracker with Animation */}
                <div className="animate-in fade-in slide-in-from-left duration-700 delay-200">
                    <CalorieTracker onActivityLogged={refreshDashboard} />
                </div>

                {/* User StatsWidget with Animation */}
                <div className="animate-in fade-in slide-in-from-right duration-700 delay-300">
                    <UserStatsWidget key={data?.totalPoints} />
                </div>
            </div>

            {/* Custom CSS for Additional Animations */}
            <style jsx>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes float {
                    0%, 100% {
                        transform: translateY(0px);
                    }
                    50% {
                        transform: translateY(-10px);
                    }
                }

                @keyframes shimmer {
                    0% {
                        background-position: -1000px 0;
                    }
                    100% {
                        background-position: 1000px 0;
                    }
                }

                @keyframes glow {
                    0%, 100% {
                        box-shadow: 0 0 5px rgba(20, 184, 166, 0.5);
                    }
                    50% {
                        box-shadow: 0 0 20px rgba(20, 184, 166, 0.8), 0 0 30px rgba(16, 185, 129, 0.6);
                    }
                }

                .delay-100 {
                    animation-delay: 100ms;
                }

                .delay-200 {
                    animation-delay: 200ms;
                }

                .delay-300 {
                    animation-delay: 300ms;
                }

                .delay-500 {
                    animation-delay: 500ms;
                }

                .delay-700 {
                    animation-delay: 700ms;
                }

                .delay-1000 {
                    animation-delay: 1000ms;
                }
            `}</style>
        </div>
    );
}
