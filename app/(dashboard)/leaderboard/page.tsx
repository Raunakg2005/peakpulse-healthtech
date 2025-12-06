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
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
            </div>
        );
    }

    const topThree = leaderboard.slice(0, 3);
    const restOfLeaderboard = leaderboard.slice(3);

    return (
        <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
            {/* Header */}
            <div className="text-center">
                <h1 className="text-4xl font-bold text-slate-900 mb-2">Leaderboard</h1>
                <p className="text-slate-600">Compete with the community and climb to the top!</p>
            </div>

            {/* Timeframe Filter */}
            <div className="flex justify-center gap-2">
                {(['all', 'month', 'week'] as const).map((tf) => (
                    <button
                        key={tf}
                        onClick={() => setTimeframe(tf)}
                        className={`px-6 py-2 rounded-lg font-medium transition ${timeframe === tf
                            ? 'bg-teal-600 text-white'
                            : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                            }`}
                    >
                        {tf === 'all' ? 'All Time' : tf === 'month' ? 'This Month' : 'This Week'}
                    </button>
                ))}
            </div>

            {/* Top 3 Podium */}
            {topThree.length >= 3 && (
                <div className="flex items-end justify-center gap-4 mb-8">
                    {/* 2nd Place */}
                    <div className="flex flex-col items-center">
                        <div className="relative mb-2">
                            <div className="w-20 h-20 rounded-full bg-slate-200 flex items-center justify-center border-4 border-slate-300 shadow-lg overflow-hidden">
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
                            <div className="absolute -bottom-2 -right-2 bg-slate-400 rounded-full p-2 shadow">
                                <Medal className="w-5 h-5 text-white fill-white" />
                            </div>
                        </div>
                        <div className="bg-gradient-to-b from-slate-200 to-slate-300 rounded-t-lg p-4 w-32 text-center border-2 border-slate-400 h-28 flex flex-col justify-center">
                            <p className="font-bold text-slate-800 mb-1 truncate w-full">{topThree[1].name}</p>
                            <p className="text-2xl font-bold text-slate-700">{topThree[1].points}</p>
                            <p className="text-xs text-slate-600">points</p>
                        </div>
                    </div>

                    {/* 1st Place */}
                    <div className="flex flex-col items-center">
                        <div className="relative mb-2">
                            <div className="w-24 h-24 rounded-full bg-amber-200 flex items-center justify-center border-4 border-amber-400 shadow-xl animate-pulse-slow overflow-hidden">
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
                            <div className="absolute -bottom-2 -right-2 bg-amber-500 rounded-full p-2 shadow-lg">
                                <Crown className="w-6 h-6 text-white fill-white" />
                            </div>
                        </div>
                        <div className="bg-gradient-to-b from-amber-200 to-amber-300 rounded-t-lg p-4 w-36 text-center border-2 border-amber-500 h-36 flex flex-col justify-center">
                            <p className="font-bold text-amber-900 mb-1 truncate w-full">{topThree[0].name}</p>
                            <p className="text-3xl font-bold text-amber-800">{topThree[0].points}</p>
                            <p className="text-xs text-amber-700">points</p>
                            <Zap className="w-5 h-5 mx-auto mt-2 text-amber-600 fill-amber-600" />
                        </div>
                    </div>

                    {/* 3rd Place */}
                    <div className="flex flex-col items-center">
                        <div className="relative mb-2">
                            <div className="w-20 h-20 rounded-full bg-orange-200 flex items-center justify-center border-4 border-orange-300 shadow-lg overflow-hidden">
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
                            <div className="absolute -bottom-2 -right-2 bg-orange-600 rounded-full p-2 shadow">
                                <Medal className="w-5 h-5 text-white fill-white" />
                            </div>
                        </div>
                        <div className="bg-gradient-to-b from-orange-200 to-orange-300 rounded-t-lg p-4 w-32 text-center border-2 border-orange-400 h-24 flex flex-col justify-center">
                            <p className="font-bold text-orange-800 mb-1 truncate w-full">{topThree[2].name}</p>
                            <p className="text-2xl font-bold text-orange-700">{topThree[2].points}</p>
                            <p className="text-xs text-orange-600">points</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Rest of Leaderboard */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-teal-600 to-emerald-600 p-4 text-white">
                    <div className="grid grid-cols-12 gap-4 font-semibold">
                        <div className="col-span-1">Rank</div>
                        <div className="col-span-5">User</div>
                        <div className="col-span-2 text-center">Points</div>
                        <div className="col-span-2 text-center">Streak</div>
                        <div className="col-span-2 text-center">Level</div>
                    </div>
                </div>

                <div className="divide-y divide-slate-100">
                    {restOfLeaderboard.map((user) => (
                        <div
                            key={user.rank}
                            className={`grid grid-cols-12 gap-4 p-4 items-center hover:bg-slate-50 transition ${user.rank <= 10 ? 'font-medium' : ''
                                }`}
                        >
                            <div className="col-span-1 flex items-center justify-center">
                                {getRankIcon(user.rank)}
                            </div>

                            <div className="col-span-5 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center text-white font-bold shadow overflow-hidden">
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
                                <div>
                                    <p className="font-semibold text-slate-900">{user.name}</p>
                                    <p className="text-xs text-slate-500">{user.badges.length} badges</p>
                                </div>
                            </div>

                            <div className="col-span-2 text-center">
                                <div className="inline-flex items-center gap-1 bg-teal-50 px-3 py-1 rounded-full">
                                    <Trophy className="w-4 h-4 text-teal-600" />
                                    <span className="font-bold text-teal-700">{user.points}</span>
                                </div>
                            </div>

                            <div className="col-span-2 text-center">
                                <div className="inline-flex items-center gap-1 bg-orange-50 px-3 py-1 rounded-full">
                                    <Zap className="w-4 h-4 text-orange-600" />
                                    <span className="font-bold text-orange-700">{user.streak}</span>
                                </div>
                            </div>

                            <div className="col-span-2 text-center">
                                <div className="inline-flex items-center gap-1 bg-purple-50 px-3 py-1 rounded-full">
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
