'use client';

import { Heart, MessageCircle, TrendingUp, Award, Users, Share2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getAvatarById } from '@/lib/avatars';

interface LeaderboardUser {
    rank: number;
    name: string;
    points: number;
    streak: number;
    avatar?: string;
    isCurrentUser?: boolean;
}

export default function SocialPage() {
    const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const response = await fetch('/api/leaderboard?limit=5');
                const data = await response.json();
                setLeaderboard(data.leaderboard || []);
            } catch (error) {
                console.error('Failed to fetch leaderboard:', error);
            }
        };

        fetchLeaderboard();
    }, []);

    const feed = [
        {
            user: 'Sarah Chen',
            avatar: 'girl_1',
            time: '2 hours ago',
            activity: 'Completed 30-Day Yoga Challenge',
            category: 'Exercise',
            likes: 24,
            comments: 5,
            points: 500,
        },
        {
            user: 'Mike Johnson',
            avatar: 'boy_2',
            time: '5 hours ago',
            activity: 'Hit 50-day meditation streak! 🔥',
            category: 'Meditation',
            likes: 18,
            comments: 3,
            points: 0,
        },
        {
            user: 'Emma Williams',
            avatar: 'girl_3',
            time: '1 day ago',
            activity: 'Started Mindful Eating Week challenge',
            category: 'Nutrition',
            likes: 12,
            comments: 2,
            points: 0,
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Social Feed</h1>
                <p className="text-slate-600 mt-1">Connect with the community and share your progress</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Left: Activity Feed */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Post Input */}
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <textarea
                            placeholder="Share your progress, ask questions, or motivate others..."
                            className="w-full p-4 border border-slate-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-teal-500"
                            rows={3}
                        />
                        <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-2">
                                <button className="text-slate-600 hover:text-teal-600 transition">
                                    <Share2 className="w-5 h-5" />
                                </button>
                            </div>
                            <button className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white px-6 py-2 rounded-lg font-medium hover:from-teal-700 hover:to-emerald-700 transition">
                                Post
                            </button>
                        </div>
                    </div>

                    {/* Feed */}
                    {feed.map((post, idx) => (
                        <div key={idx} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden border border-gray-200">
                                    <img
                                        src={getAvatarById(post.avatar)?.imageUrl || '/avatars/default.png'}
                                        alt={post.user}
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-2">
                                        <div>
                                            <h3 className="font-bold text-slate-900">{post.user}</h3>
                                            <p className="text-sm text-slate-500">{post.time}</p>
                                        </div>
                                        {post.points > 0 && (
                                            <div className="flex items-center gap-1 bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm font-semibold">
                                                <Award className="w-4 h-4" />
                                                +{post.points}
                                            </div>
                                        )}
                                    </div>

                                    <p className="text-slate-900 mb-3">{post.activity}</p>

                                    <div className="flex items-center gap-1 mb-4">
                                        <span className="bg-teal-100 text-teal-700 px-3 py-1 rounded-full text-xs font-semibold">
                                            {post.category}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-6 text-slate-600">
                                        <button className="flex items-center gap-2 hover:text-teal-600 transition">
                                            <Heart className="w-5 h-5" />
                                            <span className="text-sm font-medium">{post.likes}</span>
                                        </button>
                                        <button className="flex items-center gap-2 hover:text-teal-600 transition">
                                            <MessageCircle className="w-5 h-5" />
                                            <span className="text-sm font-medium">{post.comments}</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Right: Leaderboard */}
                <div className="space-y-6">
                    {/* Stats Card */}
                    <div className="bg-gradient-to-br from-teal-600 to-emerald-600 p-6 rounded-xl text-white">
                        <h3 className="text-lg font-bold mb-4">Your Community Impact</h3>
                        <div className="space-y-3">
                            <div>
                                <p className="text-teal-100 text-sm mb-1">Global Rank</p>
                                <p className="text-3xl font-bold">#4</p>
                            </div>
                            <div className="pt-3 border-t border-teal-400/30">
                                <p className="text-teal-100 text-sm mb-1">Followers</p>
                                <p className="text-2xl font-bold">127</p>
                            </div>
                            <div className="pt-3 border-t border-teal-400/30">
                                <p className="text-teal-100 text-sm mb-1">Posts This Week</p>
                                <p className="text-2xl font-bold">8</p>
                            </div>
                        </div>
                    </div>

                    {/* Leaderboard */}
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-2 mb-6">
                            <TrendingUp className="w-6 h-6 text-amber-600" />
                            <h3 className="text-lg font-bold text-slate-900">Top Users</h3>
                        </div>

                        <div className="space-y-3">
                            {leaderboard.length > 0 ? (
                                leaderboard.map((user) => (
                                    <div
                                        key={user.rank}
                                        className={`flex items-center gap-3 p-3 rounded-lg ${user.isCurrentUser ? 'bg-teal-50 border-2 border-teal-500' : 'hover:bg-slate-50'
                                            } transition`}
                                    >
                                        <div className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm ${user.rank === 1 ? 'bg-amber-400 text-white' :
                                            user.rank === 2 ? 'bg-slate-300 text-white' :
                                                user.rank === 3 ? 'bg-orange-400 text-white' :
                                                    'bg-slate-200 text-slate-700'
                                            }`}>
                                            {user.rank}
                                        </div>

                                        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 overflow-hidden border border-gray-200">
                                            {user.avatar ? (
                                                <img
                                                    src={getAvatarById(user.avatar)?.imageUrl || user.avatar}
                                                    alt={user.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <span className="font-bold text-slate-500">{user.name.charAt(0)}</span>
                                            )}
                                        </div>

                                        <div className="flex-1">
                                            <p className={`font-semibold ${user.isCurrentUser ? 'text-teal-600' : 'text-slate-900'}`}>
                                                {user.name}
                                            </p>
                                            <p className="text-xs text-slate-500">{user.streak} day streak</p>
                                        </div>

                                        <div className="text-right">
                                            <p className="font-bold text-slate-900">{user.points.toLocaleString()}</p>
                                            <p className="text-xs text-slate-500">points</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-4 text-slate-500 text-sm">Loading top users...</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
