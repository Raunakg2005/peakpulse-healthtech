import { Heart, MessageCircle, TrendingUp, Award, Users, Share2 } from 'lucide-react';

export default function SocialPage() {
    const feed = [
        {
            user: 'Sarah Chen',
            avatar: '/api/placeholder/40/40',
            time: '2 hours ago',
            activity: 'Completed 30-Day Yoga Challenge',
            category: 'Exercise',
            likes: 24,
            comments: 5,
            points: 500,
        },
        {
            user: 'Mike Johnson',
            avatar: '/api/placeholder/40/40',
            time: '5 hours ago',
            activity: 'Hit 50-day meditation streak! 🔥',
            category: 'Meditation',
            likes: 18,
            comments: 3,
            points: 0,
        },
        {
            user: 'Emma Williams',
            avatar: '/api/placeholder/40/40',
            time: '1 day ago',
            activity: 'Started Mindful Eating Week challenge',
            category: 'Nutrition',
            likes: 12,
            comments: 2,
            points: 0,
        },
    ];

    const leaderboard = [
        { rank: 1, name: 'Alex Kumar', points: 2850, streak: 45, avatar: '/api/placeholder/40/40' },
        { rank: 2, name: 'Lisa Park', points: 2620, streak: 38, avatar: '/api/placeholder/40/40' },
        { rank: 3, name: 'John Smith', points: 2490, streak: 42, avatar: '/api/placeholder/40/40' },
        { rank: 4, name: 'You', points: 1250, streak: 23, avatar: '/api/placeholder/40/40', isCurrentUser: true },
        { rank: 5, name: 'Maria Garcia', points: 1180, streak: 19, avatar: '/api/placeholder/40/40' },
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
                                <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold">
                                    {post.user.charAt(0)}
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
                            {leaderboard.map((user) => (
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

                                    <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold">
                                        {user.name.charAt(0)}
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
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
