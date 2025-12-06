'use client';

import { Heart, MessageCircle, TrendingUp, Award, Users, Share2, MessageSquare } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getAvatarById } from '@/lib/avatars';
import { useSession } from 'next-auth/react';

interface LeaderboardUser {
    rank: number;
    name: string;
    points: number;
    streak: number;
    avatar?: string;
    isCurrentUser?: boolean;
}

export default function SocialPage() {
    const { data: session } = useSession();
    const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
    const [posts, setPosts] = useState<any[]>([]);
    const [newPostContent, setNewPostContent] = useState('');
    const [isPosting, setIsPosting] = useState(false);

    useEffect(() => {
        fetchLeaderboard();
        fetchPosts();
    }, []);

    const fetchLeaderboard = async () => {
        try {
            const response = await fetch('/api/leaderboard?limit=5');
            const data = await response.json();
            setLeaderboard(data.leaderboard || []);
        } catch (error) {
            console.error('Failed to fetch leaderboard:', error);
        }
    };

    const fetchPosts = async () => {
        try {
            const response = await fetch('/api/social/posts');
            const data = await response.json();
            if (data.success) {
                setPosts(data.posts);
            }
        } catch (error) {
            console.error('Failed to fetch posts:', error);
        }
    };

    const handlePost = async () => {
        if (!newPostContent.trim()) return;

        setIsPosting(true);
        try {
            const response = await fetch('/api/social/posts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: newPostContent,
                    category: 'general'
                })
            });

            if (response.ok) {
                setNewPostContent('');
                fetchPosts(); // Refresh feed
            }
        } catch (error) {
            console.error('Failed to create post:', error);
        } finally {
            setIsPosting(false);
        }
    };

    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (seconds < 60) return 'just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    };

    const handleLike = async (postId: string) => {
        try {
            const response = await fetch(`/api/social/posts/${postId}/like`, {
                method: 'POST',
            });
            const data = await response.json();

            if (data.success) {
                setPosts(prevPosts => prevPosts.map(post => {
                    if (post._id === postId) {
                        const currentUserId = (session?.user as any)?.id;
                        let newLikes = [...(post.likes || [])];

                        if (data.liked) {
                            newLikes.push({ userId: currentUserId });
                        } else {
                            newLikes = newLikes.filter((like: any) =>
                                (like.userId?._id || like.userId) !== currentUserId
                            );
                        }
                        return { ...post, likes: newLikes };
                    }
                    return post;
                }));
            }
        } catch (error) {
            console.error('Failed to toggle like:', error);
        }
    };

    const isLikedByCurrentUser = (post: any) => {
        const currentUserId = (session?.user as any)?.id;
        return post.likes?.some((like: any) =>
            (like.userId?._id || like.userId) === currentUserId
        );
    };

    const currentUserPostsCount = posts.filter(p => {
        const postUserId = p.userId?._id || p.userId;
        const currentUserId = (session?.user as any)?.id;
        return postUserId === currentUserId;
    }).length;

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
                            value={newPostContent}
                            onChange={(e) => setNewPostContent(e.target.value)}
                        />
                        <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-2">
                                <button className="text-slate-600 hover:text-teal-600 transition">
                                    <Share2 className="w-5 h-5" />
                                </button>
                            </div>
                            <button
                                onClick={handlePost}
                                disabled={isPosting || !newPostContent.trim()}
                                className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white px-6 py-2 rounded-lg font-medium hover:from-teal-700 hover:to-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isPosting ? 'Posting...' : 'Post'}
                            </button>
                        </div>
                    </div>

                    {/* Feed */}
                    {posts.length === 0 ? (
                        <div className="text-center py-8 text-slate-500 bg-white rounded-xl border border-slate-200">
                            <p>No posts yet. Be the first to share!</p>
                        </div>
                    ) : (
                        posts.map((post, idx) => (
                            <div key={post._id || idx} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden border border-gray-200">
                                        <img
                                            src={getAvatarById(post.userId?.avatar)?.imageUrl || '/avatars/default.png'}
                                            alt={post.userId?.name || 'User'}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-2">
                                            <div>
                                                <h3 className="font-bold text-slate-900">{post.userId?.name || 'Unknown User'}</h3>
                                                <p className="text-sm text-slate-500">{formatTimeAgo(post.createdAt)}</p>
                                            </div>
                                        </div>

                                        <p className="text-slate-900 mb-3 whitespace-pre-wrap">{post.content}</p>

                                        <div className="flex items-center gap-1 mb-4">
                                            <span className="bg-teal-100 text-teal-700 px-3 py-1 rounded-full text-xs font-semibold capitalize">
                                                {post.category || 'general'}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-6 text-slate-600">
                                            <button
                                                onClick={() => handleLike(post._id)}
                                                className={`flex items-center gap-2 transition ${isLikedByCurrentUser(post)
                                                    ? 'text-red-500 hover:text-red-600'
                                                    : 'hover:text-teal-600'
                                                    }`}
                                            >
                                                <Heart className={`w-5 h-5 ${isLikedByCurrentUser(post) ? 'fill-current' : ''}`} />
                                                <span className="text-sm font-medium">{post.likes?.length || 0}</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
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
                                <p className="text-2xl font-bold">{currentUserPostsCount}</p>
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
