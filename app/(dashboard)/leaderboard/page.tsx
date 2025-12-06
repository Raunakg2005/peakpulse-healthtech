'use client';

import { useState, useEffect } from 'react';
import { Trophy, Medal, TrendingUp, Crown, Zap } from 'lucide-react';
import { getAvatarById } from '@/lib/avatars';

interface LeaderboardUser {
    rank: number;
    name: string;
    email: string;
    avatar?: string;
    points: number;
    streak: number;
    level: number;
    badges: string[];
}

export default function LeaderboardPage() {
    const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [timeframe, setTimeframe] = useState<'all' | 'month' | 'week'>('all');

    useEffect(() => {
        fetchLeaderboard();
    }, [timeframe]);

    const fetchLeaderboard = async () => {
        try {
            const response = await fetch(`/api/leaderboard?limit=all`);
            const data = await response.json();
            setLeaderboard(data.leaderboard || []);
        } catch (error) {
            console.error('Failed to fetch leaderboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const getRankIcon = (rank: number) => {
        if (rank === 1) return <Crown className="w-6 h-6 text-amber-500 fill-amber-500" />;
        if (rank === 2) return <Medal className="w-6 h-6 text-slate-400 fill-slate-400" />;
        if (rank === 3) return <Medal className="w-6 h-6 text-amber-700 fill-amber-700" />;
        return <span className="font-bold text-slate-600">#{rank}</span>;
    };

    const getRankBg = (rank: number) => {
        if (rank === 1) return 'bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-300';
        if (rank === 2) return 'bg-gradient-to-r from-slate-50 to-gray-50 border-slate-300';
        if (rank === 3) return 'bg-gradient-to-r from-orange-50 to-amber-50 border-orange-300';
        return 'bg-white border-slate-200';
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
                    <Trophy className="w-16 h-16 text-amber-600 animate-bounce relative" />
                </div>
                <p className="text-slate-600 mt-4 animate-pulse">Loading champions...</p>
            </div>
        );
    }

    const topThree = leaderboard.slice(0, 3);
    const restOfLeaderboard = leaderboard.slice(3);

    return (
        <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
            {/* Enhanced Header */}
            <div className="relative overflow-hidden bg-gradient-to-br from-amber-600 via-orange-600 to-rose-600 rounded-3xl p-12 shadow-2xl animate-in fade-in slide-in-from-top duration-700">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-2xl animate-pulse delay-500"></div>
                
                <div className="relative text-center">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="relative">
                            <div className="absolute inset-0 bg-white rounded-2xl blur-lg opacity-50 animate-pulse"></div>
                            <div className="relative bg-white/20 backdrop-blur-sm p-4 rounded-2xl border border-white/30">
                                <Trophy className="w-12 h-12 text-white" />
                            </div>
                        </div>
                    </div>
                    <h1 className="text-5xl font-bold text-white mb-3 animate-in fade-in slide-in-from-bottom duration-500">🏆 Hall of Champions</h1>
                    <p className="text-white/90 text-lg animate-in fade-in slide-in-from-bottom duration-500 delay-100">Compete with the community and rise to greatness!</p>
                </div>
            </div>

            {/* Enhanced Timeframe Filter */}
            <div className="flex justify-center gap-3">
                {(['all', 'month', 'week'] as const).map((tf) => (
                    <button
                        key={tf}
                        onClick={() => setTimeframe(tf)}
                        className={`relative px-8 py-3 rounded-xl font-semibold transition-all duration-300 ${timeframe === tf
                            ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg scale-105'
                            : 'bg-white text-slate-600 hover:bg-slate-50 hover:scale-105 border-2 border-slate-200 hover:border-amber-300'
                            }`}
                    >
                        {timeframe === tf && (
                            <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-400 rounded-xl blur-lg opacity-30 animate-pulse -z-10"></div>
                        )}
                        {tf === 'all' ? '⏳ All Time' : tf === 'month' ? '📅 This Month' : '⚡ This Week'}
                    </button>
                ))}
            </div>

            {/* Enhanced Top 3 Podium */}
            {topThree.length > 0 && (
                <div className="flex items-end justify-center gap-6 mb-8 animate-in fade-in slide-in-from-bottom duration-700 delay-200">
                    {/* 2nd Place */}
                    {topThree[1] && (
                        <div className="flex flex-col items-center animate-in zoom-in duration-500 delay-400">
                            <div className="relative mb-3">
                                <div className="absolute inset-0 bg-slate-300 rounded-full blur-xl opacity-50 animate-pulse"></div>
                                <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center border-4 border-slate-400 shadow-xl overflow-hidden transform hover:scale-110 transition-transform duration-300">
                                    {topThree[1].avatar ? (
                                        <img
                                            src={getAvatarById(topThree[1].avatar)?.imageUrl || topThree[1].avatar}
                                            alt={topThree[1].name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-2xl font-bold text-slate-600">
                                            {topThree[1].name.charAt(0)}
                                        </span>
                                    )}
                                </div>
                                <div className="absolute -bottom-2 -right-2 bg-gradient-to-br from-slate-400 to-slate-500 rounded-full p-2.5 shadow-lg">
                                    <Medal className="w-6 h-6 text-white fill-white animate-pulse" />
                                </div>
                            </div>
                            <div className="bg-gradient-to-b from-slate-200 via-slate-250 to-slate-300 rounded-t-2xl p-5 w-36 text-center border-4 border-slate-400 h-32 flex flex-col justify-center shadow-xl hover:shadow-2xl transition-shadow relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                                <p className="font-bold text-slate-900 mb-2 truncate w-full relative z-10">🥈 {topThree[1].name}</p>
                                <p className="text-3xl font-bold text-slate-800 relative z-10">{topThree[1].points}</p>
                                <p className="text-xs text-slate-700 font-semibold relative z-10">points</p>
                            </div>
                        </div>
                    )}

                    {/* 1st Place - Champion */}
                    {topThree[0] && (
                        <div className="flex flex-col items-center animate-in zoom-in duration-500 delay-300">
                            <div className="relative mb-3">
                                <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-yellow-400 rounded-full blur-2xl opacity-60 animate-pulse"></div>
                                <div className="relative w-28 h-28 rounded-full bg-gradient-to-br from-amber-200 via-yellow-300 to-amber-400 flex items-center justify-center border-4 border-amber-500 shadow-2xl overflow-hidden transform hover:scale-110 hover:rotate-6 transition-all duration-300">
                                    {topThree[0].avatar ? (
                                        <img
                                            src={getAvatarById(topThree[0].avatar)?.imageUrl || topThree[0].avatar}
                                            alt={topThree[0].name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-3xl font-bold text-amber-700">
                                            {topThree[0].name.charAt(0)}
                                        </span>
                                    )}
                                </div>
                                <div className="absolute -bottom-3 -right-3 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full p-3 shadow-2xl animate-pulse">
                                    <Crown className="w-7 h-7 text-white fill-white" />
                                </div>
                                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                                    <div className="text-3xl animate-bounce">👑</div>
                                </div>
                            </div>
                            <div className="bg-gradient-to-b from-amber-200 via-yellow-300 to-amber-400 rounded-t-2xl p-6 w-40 text-center border-4 border-amber-500 h-40 flex flex-col justify-center shadow-2xl hover:shadow-3xl transition-shadow relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent"></div>
                                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
                                <p className="font-bold text-amber-950 mb-2 truncate w-full relative z-10 text-lg">🏆 {topThree[0].name}</p>
                                <p className="text-4xl font-bold text-amber-900 relative z-10 mb-1">{topThree[0].points}</p>
                                <p className="text-xs text-amber-800 font-semibold relative z-10">points</p>
                                <div className="flex items-center justify-center gap-1 mt-2 relative z-10">
                                    <Zap className="w-5 h-5 text-amber-700 fill-amber-700 animate-pulse" />
                                    <span className="text-xs font-bold text-amber-700">CHAMPION</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 3rd Place */}
                    {topThree[2] && (
                        <div className="flex flex-col items-center animate-in zoom-in duration-500 delay-500">
                            <div className="relative mb-3">
                                <div className="absolute inset-0 bg-orange-400 rounded-full blur-xl opacity-50 animate-pulse"></div>
                                <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-orange-200 to-amber-300 flex items-center justify-center border-4 border-orange-400 shadow-xl overflow-hidden transform hover:scale-110 transition-transform duration-300">
                                    {topThree[2].avatar ? (
                                        <img
                                            src={getAvatarById(topThree[2].avatar)?.imageUrl || topThree[2].avatar}
                                            alt={topThree[2].name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-2xl font-bold text-orange-600">
                                            {topThree[2].name.charAt(0)}
                                        </span>
                                    )}
                                </div>
                                <div className="absolute -bottom-2 -right-2 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full p-2.5 shadow-lg">
                                    <Medal className="w-6 h-6 text-white fill-white animate-pulse" />
                                </div>
                            </div>
                            <div className="bg-gradient-to-b from-orange-200 via-orange-250 to-amber-300 rounded-t-2xl p-5 w-36 text-center border-4 border-orange-400 h-28 flex flex-col justify-center shadow-xl hover:shadow-2xl transition-shadow relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                                <p className="font-bold text-orange-900 mb-2 truncate w-full relative z-10">🥉 {topThree[2].name}</p>
                                <p className="text-3xl font-bold text-orange-800 relative z-10">{topThree[2].points}</p>
                                <p className="text-xs text-orange-700 font-semibold relative z-10">points</p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Enhanced Leaderboard Table */}
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border-2 border-slate-200 animate-in fade-in slide-in-from-bottom duration-700 delay-400">
                <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 p-6 text-white relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/50 to-pink-500/50 animate-pulse"></div>
                    <div className="grid grid-cols-12 gap-4 font-bold text-sm relative z-10">
                        <div className="col-span-1 flex items-center">\ud83c\udfc5 Rank</div>
                        <div className="col-span-5 flex items-center">\ud83d\udc64 User</div>
                        <div className="col-span-2 text-center flex items-center justify-center">\ud83c\udfc6 Points</div>
                        <div className="col-span-2 text-center flex items-center justify-center">\ud83d\udd25 Streak</div>
                        <div className="col-span-2 text-center flex items-center justify-center">\u2b06\ufe0f Level</div>
                    </div>
                </div>

                <div className="divide-y divide-slate-100">
                    {leaderboard.map((user, idx) => (
                        <div
                            key={user.rank}
                            className={`grid grid-cols-12 gap-4 p-5 items-center transition-all duration-300 animate-in fade-in slide-in-from-left ${user.rank <= 3 ? 'bg-gradient-to-r from-amber-50 to-yellow-50 hover:from-amber-100 hover:to-yellow-100' : 'hover:bg-gradient-to-r hover:from-slate-50 hover:to-purple-50'
                                } group`}
                            style={{ animationDelay: `${idx * 50}ms` }}
                        >
                            <div className="col-span-1 flex items-center justify-center">
                                <div className="group-hover:scale-110 transition-transform">
                                    {getRankIcon(user.rank)}
                                </div>
                            </div>

                            <div className="col-span-5 flex items-center gap-3">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full blur-md opacity-0 group-hover:opacity-50 transition-opacity"></div>
                                    <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white font-bold shadow-lg overflow-hidden border-2 border-white group-hover:scale-110 transition-transform">
                                        {user.avatar ? (
                                            <img
                                                src={getAvatarById(user.avatar)?.imageUrl || user.avatar}
                                                alt={user.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            user.name.charAt(0)
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900 group-hover:text-purple-600 transition-colors">{user.name}</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <p className="text-xs text-slate-500 flex items-center gap-1">
                                            <Trophy className="w-3 h-3" />
                                            {user.badges.length} badges
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="col-span-2 text-center">
                                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-50 to-emerald-50 px-4 py-2 rounded-xl border-2 border-teal-200 group-hover:border-teal-300 group-hover:scale-105 transition-all shadow-sm">
                                    <Trophy className="w-4 h-4 text-teal-600" />
                                    <span className="font-bold text-teal-700">{user.points.toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="col-span-2 text-center">
                                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-50 to-amber-50 px-4 py-2 rounded-xl border-2 border-orange-200 group-hover:border-orange-300 group-hover:scale-105 transition-all shadow-sm">
                                    <Zap className="w-4 h-4 text-orange-600 fill-orange-600" />
                                    <span className="font-bold text-orange-700">{user.streak}</span>
                                </div>
                            </div>

                            <div className="col-span-2 text-center">
                                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-50 to-pink-50 px-4 py-2 rounded-xl border-2 border-purple-200 group-hover:border-purple-300 group-hover:scale-105 transition-all shadow-sm">
                                    <TrendingUp className="w-4 h-4 text-purple-600" />
                                    <span className="font-bold text-purple-700">{user.level}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Empty State */}
            {leaderboard.length === 0 && (
                <div className="text-center py-12">
                    <Trophy className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500">No users on the leaderboard yet</p>
                </div>
            )}
        </div>
    );
}
