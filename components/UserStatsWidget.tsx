'use client';

import { useState, useEffect } from 'react';
import { Trophy, Zap, TrendingUp, Star } from 'lucide-react';
import { getLevelProgress } from '@/lib/gamification';
import Link from 'next/link';

interface UserStatsProps {
    minimal?: boolean;
}

export default function UserStatsWidget({ minimal = false }: UserStatsProps) {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const [userResponse, badgesResponse] = await Promise.all([
                fetch('/api/user/profile'),
                fetch('/api/gamification')
            ]);
            
            const userData = await userResponse.json();
            const badgesData = await badgesResponse.json();
            
            const user = userData.user || userData;
            const totalPoints = user.stats?.totalPoints || 0;
            const levelProgress = getLevelProgress(totalPoints);
            
            setStats({
                ...user.stats,
                totalPoints,
                levelProgress,
                badgeCount: badgesData.earned?.length || 0,
                totalBadges: badgesData.stats?.totalPossible || 0
            });
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
                <div className="h-6 bg-slate-200 rounded w-1/2 mb-4"></div>
                <div className="space-y-3">
                    <div className="h-4 bg-slate-200 rounded"></div>
                    <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                </div>
            </div>
        );
    }

    if (!stats) return null;

    if (minimal) {
        return (
            <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-xl p-4 border border-teal-200">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-teal-600 rounded-lg p-2">
                            <TrendingUp className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-teal-700">Level {stats.levelProgress.currentLevel}</p>
                            <p className="text-xs text-slate-600">{stats.totalPoints} points</p>
                        </div>
                    </div>
                    <Link
                        href="/achievements"
                        className="px-3 py-1 bg-teal-600 text-white rounded-lg text-sm hover:bg-teal-700 transition"
                    >
                        View All
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <Trophy className="w-6 h-6 text-teal-600" />
                    Your Progress
                </h3>
                <Link
                    href="/achievements"
                    className="text-teal-600 hover:text-teal-700 font-medium text-sm"
                >
                    View All →
                </Link>
            </div>

            {/* Level Progress */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 mb-4 border border-purple-200">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-purple-600" />
                        <span className="font-semibold text-slate-900">Level {stats.levelProgress.currentLevel}</span>
                    </div>
                    <span className="text-sm text-slate-600">
                        {stats.totalPoints} / {stats.levelProgress.nextLevelPoints} pts
                    </span>
                </div>
                
                {/* Progress Bar */}
                <div className="relative h-3 bg-purple-200 rounded-full overflow-hidden">
                    <div
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                        style={{ width: `${stats.levelProgress.progress}%` }}
                    ></div>
                </div>
                
                <p className="text-xs text-slate-600 mt-2">
                    {stats.levelProgress.pointsToNext} points to level {stats.levelProgress.nextLevel}
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200">
                    <div className="flex items-center gap-2 mb-2">
                        <Trophy className="w-5 h-5 text-amber-600" />
                        <span className="text-sm font-medium text-slate-700">Badges</span>
                    </div>
                    <p className="text-2xl font-bold text-amber-700">
                        {stats.badgeCount}
                        <span className="text-sm font-normal text-slate-600">/{stats.totalBadges}</span>
                    </p>
                </div>

                <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-xl p-4 border border-teal-200">
                    <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-5 h-5 text-teal-600" />
                        <span className="text-sm font-medium text-slate-700">Total Points</span>
                    </div>
                    <p className="text-2xl font-bold text-teal-700">{stats.totalPoints}</p>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4 border border-orange-200">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">🔥</span>
                        <span className="text-sm font-medium text-slate-700">Streak</span>
                    </div>
                    <p className="text-2xl font-bold text-orange-700">{stats.currentStreak || 0} days</p>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                        <Star className="w-5 h-5 text-blue-600" />
                        <span className="text-sm font-medium text-slate-700">Challenges</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-700">{stats.completedChallenges || 0}</p>
                </div>
            </div>

            {/* Quick Links */}
            <div className="flex gap-2">
                <Link
                    href="/achievements"
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-lg hover:from-teal-700 hover:to-emerald-700 transition text-center font-medium"
                >
                    View Badges
                </Link>
                <Link
                    href="/leaderboard"
                    className="flex-1 px-4 py-2 border-2 border-teal-600 text-teal-600 rounded-lg hover:bg-teal-50 transition text-center font-medium"
                >
                    Leaderboard
                </Link>
            </div>
        </div>
    );
}
