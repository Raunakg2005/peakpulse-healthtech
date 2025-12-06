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
    const [commentingPostId, setCommentingPostId] = useState<string | null>(null);
    const [commentContent, setCommentContent] = useState('');
    const [userStats, setUserStats] = useState<any>(null);
    const [sharingPostId, setSharingPostId] = useState<string | null>(null);
    const [shareSuccess, setShareSuccess] = useState(false);

    useEffect(() => {
        fetchPosts();
        fetchUserStats();
    }, []);

    useEffect(() => {
        if (session?.user?.email) {
            fetchLeaderboard();
        }
    }, [session?.user?.email]);

    const fetchUserStats = async () => {
        try {
            const response = await fetch('/api/dashboard');
            const data = await response.json();
            if (data.success) {
                setUserStats(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch user stats:', error);
        }
    };

    const fetchLeaderboard = async () => {
        try {
            const email = session?.user?.email;
            const url = email ? `/api/leaderboard?limit=5&email=${encodeURIComponent(email)}` : '/api/leaderboard?limit=5';
            const response = await fetch(url);
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

    const handleComment = async (postId: string) => {
        if (!commentContent.trim()) return;

        try {
            const response = await fetch(`/api/social/posts/${postId}/comment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: commentContent })
            });

            if (response.ok) {
                setCommentContent('');
                setCommentingPostId(null);
                fetchPosts(); // Refresh to show new comment
            }
        } catch (error) {
            console.error('Failed to add comment:', error);
        }
    };

    const currentUserRank = leaderboard.findIndex(u => u.isCurrentUser) + 1;

    const handleShare = (postId: string, method: string) => {
        const post = posts.find(p => p._id === postId);
        if (!post) return;

        const shareText = `Check out this post from ${post.userId?.name || 'someone'}: "${post.content}"`;
        const shareUrl = `${window.location.origin}/dashboard/social?post=${postId}`;

        switch (method) {
            case 'copy':
                navigator.clipboard.writeText(shareUrl);
                setShareSuccess(true);
                setTimeout(() => setShareSuccess(false), 2000);
                break;
            case 'twitter':
                window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
                break;
            case 'facebook':
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
                break;
            case 'linkedin':
                window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank');
                break;
            case 'whatsapp':
                window.open(`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`, '_blank');
                break;
        }
        setSharingPostId(null);
    };

    return (
        <div className="space-y-8">
            {/* Enhanced Header with Gradient */}
            <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-pink-600 to-rose-600 rounded-2xl p-8 shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-300/20 rounded-full blur-2xl"></div>
                <div className="relative">
                    <div className="flex items-center gap-3 mb-2">
                        <Users className="w-8 h-8 text-white" />
                        <h1 className="text-4xl font-bold text-white">Community Hub</h1>
                    </div>
                    <p className="text-purple-50 text-lg">Connect, share, and celebrate wins together! 🎉</p>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Left: Activity Feed */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Enhanced Post Input */}
                    <div className="group bg-white p-6 rounded-2xl border-2 border-slate-200 hover:border-purple-300 shadow-lg hover:shadow-xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-4">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center overflow-hidden">
                                {session?.user ? (
                                    <img 
                                        src={getAvatarById((session.user as any)?.avatar)?.imageUrl || getAvatarById('boy_1')?.imageUrl} 
                                        alt="You" 
                                        className="w-full h-full object-cover" 
                                    />
                                ) : (
                                    <span className="text-white font-bold text-lg">{session?.user?.name?.charAt(0) || 'U'}</span>
                                )}
                            </div>
                            <div>
                                <p className="font-semibold text-slate-900">Share your journey</p>
                                <p className="text-sm text-slate-500">What's on your mind?</p>
                            </div>
                        </div>
                        <textarea
                            placeholder="💪 Crushed my workout today! | 🧘 Feeling zen after meditation | 🥗 Healthy eating wins..."
                            className="w-full p-4 border-2 border-slate-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                            rows={3}
                            value={newPostContent}
                            onChange={(e) => setNewPostContent(e.target.value)}
                        />
                        <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center gap-3">
                                <button className="flex items-center gap-2 text-slate-600 hover:text-purple-600 transition px-3 py-2 rounded-lg hover:bg-purple-50">
                                    <MessageSquare className="w-5 h-5" />
                                    <span className="text-sm font-medium">Poll</span>
                                </button>
                                <button className="flex items-center gap-2 text-slate-600 hover:text-pink-600 transition px-3 py-2 rounded-lg hover:bg-pink-50">
                                    <Share2 className="w-5 h-5" />
                                    <span className="text-sm font-medium">Media</span>
                                </button>
                            </div>
                            <button
                                onClick={handlePost}
                                disabled={isPosting || !newPostContent.trim()}
                                className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 text-white px-8 py-3 rounded-xl font-bold hover:from-purple-700 hover:via-pink-700 hover:to-rose-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:scale-105 transform"
                            >
                                {isPosting ? (
                                    <span className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Posting...
                                    </span>
                                ) : (
                                    '✨ Share Post'
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Enhanced Feed */}
                    {posts.length === 0 ? (
                        <div className="relative text-center py-16 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border-2 border-dashed border-slate-300">
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-2xl"></div>
                            <div className="relative">
                                <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                                <p className="text-lg font-semibold text-slate-600 mb-2">No posts yet</p>
                                <p className="text-slate-500">Be the first to share your journey! 🚀</p>
                            </div>
                        </div>
                    ) : (
                        posts.map((post, idx) => (
                            <div 
                                key={post._id || idx} 
                                className="group bg-white p-6 rounded-2xl border-2 border-slate-200 hover:border-purple-300 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] animate-in fade-in slide-in-from-bottom-4"
                                style={{ animationDelay: `${idx * 50}ms` }}
                            >
                                <div className="flex items-start gap-4">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full blur-md opacity-0 group-hover:opacity-50 transition-opacity"></div>
                                        <div className="relative w-14 h-14 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center overflow-hidden border-2 border-slate-200 group-hover:border-purple-400 transition-colors">
                                            <img
                                                src={getAvatarById(post.userId?.avatar)?.imageUrl || '/avatars/default.png'}
                                                alt={post.userId?.name || 'User'}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-3">
                                            <div>
                                                <h3 className="font-bold text-slate-900 text-lg group-hover:text-purple-600 transition-colors">
                                                    {post.userId?.name || 'Unknown User'}
                                                </h3>
                                                <p className="text-sm text-slate-500 flex items-center gap-2">
                                                    <span>{formatTimeAgo(post.createdAt)}</span>
                                                    <span>•</span>
                                                    <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-xs font-semibold capitalize">
                                                        {post.category || 'general'}
                                                    </span>
                                                </p>
                                            </div>
                                        </div>

                                        <p className="text-slate-700 mb-4 whitespace-pre-wrap leading-relaxed text-lg">
                                            {post.content}
                                        </p>

                                        <div className="flex items-center gap-6 pt-3 border-t border-slate-100">
                                            <button
                                                onClick={() => handleLike(post._id)}
                                                className={`group/like flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                                                    isLikedByCurrentUser(post)
                                                        ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg shadow-pink-500/30'
                                                        : 'bg-slate-100 text-slate-600 hover:bg-gradient-to-r hover:from-rose-500 hover:to-pink-500 hover:text-white hover:shadow-lg hover:shadow-pink-500/30'
                                                }`}
                                            >
                                                <Heart className={`w-5 h-5 transition-transform group-hover/like:scale-110 ${isLikedByCurrentUser(post) ? 'fill-current' : ''}`} />
                                                <span className="text-sm font-bold">{post.likes?.length || 0}</span>
                                                <span className="text-sm hidden sm:inline">
                                                    {isLikedByCurrentUser(post) ? 'Liked' : 'Like'}
                                                </span>
                                            </button>

                                            <button 
                                                onClick={() => setCommentingPostId(commentingPostId === post._id ? null : post._id)}
                                                className="group/comment flex items-center gap-2 px-4 py-2 rounded-xl font-medium bg-slate-100 text-slate-600 hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 hover:text-white hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300">
                                                <MessageCircle className="w-5 h-5 transition-transform group-hover/comment:scale-110" />
                                                <span className="text-sm font-bold">{post.comments?.length || 0}</span>
                                                <span className="text-sm hidden sm:inline">Comment</span>
                                            </button>

                                            <button 
                                                onClick={() => setSharingPostId(post._id)}
                                                className="ml-auto group/share flex items-center gap-2 px-4 py-2 rounded-xl font-medium bg-slate-100 text-slate-600 hover:bg-gradient-to-r hover:from-teal-500 hover:to-emerald-500 hover:text-white hover:shadow-lg hover:shadow-teal-500/30 transition-all duration-300">
                                                <Share2 className="w-5 h-5 transition-transform group-hover/share:scale-110" />
                                                <span className="text-sm hidden sm:inline">Share</span>
                                            </button>
                                        </div>

                                        {/* Comment Section */}
                                        {commentingPostId === post._id && (
                                            <div className="mt-4 pt-4 border-t border-slate-200 animate-in fade-in slide-in-from-top-2">
                                                <div className="flex gap-3">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                                                        {session?.user ? (
                                                            <img 
                                                                src={getAvatarById((session.user as any)?.avatar)?.imageUrl || getAvatarById('boy_1')?.imageUrl} 
                                                                alt="You" 
                                                                className="w-full h-full object-cover" 
                                                            />
                                                        ) : (
                                                            <span className="text-white font-bold text-sm">{session?.user?.name?.charAt(0) || 'U'}</span>
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <textarea
                                                            placeholder="Write a comment..."
                                                            value={commentContent}
                                                            onChange={(e) => setCommentContent(e.target.value)}
                                                            className="w-full p-3 border-2 border-slate-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                                                            rows={2}
                                                        />
                                                        <div className="flex justify-end gap-2 mt-2">
                                                            <button
                                                                onClick={() => {
                                                                    setCommentingPostId(null);
                                                                    setCommentContent('');
                                                                }}
                                                                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition"
                                                            >
                                                                Cancel
                                                            </button>
                                                            <button
                                                                onClick={() => handleComment(post._id)}
                                                                disabled={!commentContent.trim()}
                                                                className="px-6 py-2 text-sm font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                                            >
                                                                Post Comment
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Display Comments */}
                                        {post.comments && post.comments.length > 0 && (
                                            <div className="mt-4 pt-4 border-t border-slate-200 space-y-3">
                                                {post.comments.map((comment: any, cidx: number) => (
                                                    <div key={cidx} className="flex gap-3">
                                                        <div className="w-8 h-8 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                                                            <img 
                                                                src={getAvatarById(comment.userId?.avatar)?.imageUrl || getAvatarById('boy_1')?.imageUrl} 
                                                                alt={comment.userId?.name || 'User'} 
                                                                className="w-full h-full object-cover" 
                                                            />
                                                        </div>
                                                        <div className="flex-1 bg-slate-50 rounded-xl p-3">
                                                            <p className="font-semibold text-sm text-slate-900">{comment.userId?.name || 'User'}</p>
                                                            <p className="text-slate-700 text-sm mt-1">{comment.content}</p>
                                                            <p className="text-xs text-slate-500 mt-1">{formatTimeAgo(comment.createdAt)}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Right: Sidebar */}
                <div className="space-y-6">
                    {/* Enhanced Stats Card */}
                    <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-pink-600 to-rose-600 p-6 rounded-2xl text-white shadow-2xl animate-in fade-in slide-in-from-right">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-300/20 rounded-full blur-xl"></div>
                        <div className="relative">
                            <div className="flex items-center gap-2 mb-4">
                                <Award className="w-6 h-6" />
                                <h3 className="text-xl font-bold">Your Impact</h3>
                            </div>
                            <div className="space-y-4">
                                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                                    <p className="text-purple-100 text-sm mb-1">🏆 Global Rank</p>
                                    <p className="text-4xl font-bold">
                                        {currentUserRank > 0 ? `#${currentUserRank}` : 'Unranked'}
                                    </p>
                                    <div className="mt-2 flex items-center gap-1 text-xs text-purple-100">
                                        <TrendingUp className="w-3 h-3" />
                                        <span>
                                            {userStats?.stats?.totalPoints > 0 
                                                ? `${userStats.stats.totalPoints.toLocaleString()} points` 
                                                : 'Start your journey!'}
                                        </span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                                        <p className="text-purple-100 text-xs mb-1">🔥 Streak</p>
                                        <p className="text-2xl font-bold">{userStats?.stats?.currentStreak || 0}</p>
                                    </div>
                                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                                        <p className="text-purple-100 text-xs mb-1">📝 Posts</p>
                                        <p className="text-2xl font-bold">{currentUserPostsCount}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Enhanced Leaderboard */}
                    <div className="bg-white p-6 rounded-2xl border-2 border-slate-200 shadow-lg animate-in fade-in slide-in-from-right delay-200">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="bg-gradient-to-br from-amber-500 to-orange-500 p-2 rounded-lg">
                                    <TrendingUp className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">Top Champions</h3>
                                    <p className="text-xs text-slate-500">Leading the pack 🏆</p>
                                </div>
                            </div>
                            {leaderboard.length >= 5 && (
                                <button className="text-xs font-semibold text-purple-600 hover:text-purple-700 transition">
                                    View All
                                </button>
                            )}
                        </div>

                        <div className="space-y-2">
                            {leaderboard.length > 0 ? (
                                <>
                                    {leaderboard.map((user, idx) => (
                                        <div
                                            key={user.rank}
                                            className={`group flex items-center gap-3 p-4 rounded-xl transition-all duration-300 animate-in fade-in slide-in-from-right ${
                                                user.isCurrentUser 
                                                    ? 'bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-400 shadow-lg shadow-purple-500/20' 
                                                    : 'hover:bg-gradient-to-r hover:from-slate-50 hover:to-slate-100 border-2 border-transparent hover:border-slate-200'
                                            }`}
                                            style={{ animationDelay: `${idx * 100}ms` }}
                                        >
                                            <div className={`relative w-10 h-10 flex items-center justify-center rounded-full font-bold text-sm shadow-lg transition-transform group-hover:scale-110 ${
                                                user.rank === 1 ? 'bg-gradient-to-br from-amber-400 to-yellow-500 text-white' :
                                                user.rank === 2 ? 'bg-gradient-to-br from-slate-300 to-slate-400 text-white' :
                                                user.rank === 3 ? 'bg-gradient-to-br from-orange-400 to-orange-500 text-white' :
                                                'bg-gradient-to-br from-slate-200 to-slate-300 text-slate-700'
                                            }`}>
                                                {user.rank === 1 && <span className="absolute -top-1 -right-1 text-xl">👑</span>}
                                                {user.rank === 2 && <span className="absolute -top-1 -right-1 text-lg">🥈</span>}
                                                {user.rank === 3 && <span className="absolute -top-1 -right-1 text-lg">🥉</span>}
                                                {user.rank}
                                            </div>

                                            <div className="relative w-11 h-11 rounded-full flex items-center justify-center bg-gradient-to-br from-purple-100 to-pink-100 overflow-hidden border-2 border-slate-200 group-hover:border-purple-400 transition-colors shadow-sm">
                                                {user.avatar ? (
                                                    <img
                                                        src={getAvatarById(user.avatar)?.imageUrl}
                                                        alt={user.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <span className="font-bold text-purple-500 text-lg">{user.name.charAt(0).toUpperCase()}</span>
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <p className={`font-semibold truncate ${user.isCurrentUser ? 'text-purple-600' : 'text-slate-900 group-hover:text-purple-600'} transition-colors`}>
                                                    {user.name} {user.isCurrentUser && <span className="text-purple-500">(You)</span>}
                                                </p>
                                                <p className="text-xs text-slate-500 flex items-center gap-1">
                                                    {user.streak > 0 ? (
                                                        <>
                                                            <span className="text-orange-500">🔥</span>
                                                            <span className="font-medium">{user.streak} day streak</span>
                                                        </>
                                                    ) : (
                                                        <span className="text-slate-400">No streak yet</span>
                                                    )}
                                                </p>
                                            </div>

                                            <div className="text-right">
                                                <p className={`font-bold transition-colors ${user.isCurrentUser ? 'text-purple-600' : 'text-slate-900 group-hover:text-purple-600'}`}>
                                                    {user.points.toLocaleString()}
                                                </p>
                                                <p className="text-xs text-slate-500">points</p>
                                            </div>
                                        </div>
                                    ))}
                                    
                                    {/* Motivational Message */}
                                    {leaderboard.length > 0 && (
                                        <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border-2 border-purple-100">
                                            <p className="text-sm text-center text-slate-600">
                                                <span className="font-semibold text-purple-600">Keep going!</span> Every activity counts towards your rank 💪
                                            </p>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="text-center py-12">
                                    <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-slate-200 border-t-purple-600 mb-4"></div>
                                    <p className="text-slate-500 text-sm">Loading champions...</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Share Modal */}
            {sharingPostId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
                    {/* Backdrop */}
                    <div 
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setSharingPostId(null)}
                    ></div>
                    
                    {/* Modal with Scroll */}
                    <div className="relative bg-white rounded-3xl max-w-md w-full shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-8 duration-500 max-h-[90vh] flex flex-col">
                        {/* Close button */}
                        <button
                            onClick={() => setSharingPostId(null)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors z-10"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        {/* Scrollable Content */}
                        <div className="overflow-y-auto p-8">
                            {/* Header */}
                            <div className="text-center mb-6">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-2xl mb-4 shadow-lg">
                                <Share2 className="w-8 h-8 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-2">Share This Post</h2>
                            <p className="text-slate-600 text-sm">Spread the wellness vibes with your network</p>
                            </div>

                            {/* Share Options */}
                            <div className="space-y-3">
                                {/* Repost to Community */}
                                <button
                                    onClick={async () => {
                                        const post = posts.find(p => p._id === sharingPostId);
                                        if (!post) return;
                                        try {
                                            const response = await fetch('/api/social/posts', {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({
                                                    content: `🔁 Reposting from @${post.userId?.name}:\n\n${post.content}\n\n#PeakPulse #Community`,
                                                    category: 'repost'
                                                })
                                            });
                                            if (response.ok) {
                                                setSharingPostId(null);
                                                fetchPosts();
                                            }
                                        } catch (error) {
                                            console.error('Failed to repost:', error);
                                        }
                                    }}
                                    className="w-full flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 border-2 border-purple-200 hover:border-purple-300 transition-all duration-300 group"
                                >
                                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                    </div>
                                    <div className="flex-1 text-left">
                                        <p className="font-semibold text-slate-900">Repost to Your Feed</p>
                                        <p className="text-xs text-slate-500">Share this in your community feed</p>
                                    </div>
                                </button>
                            {/* Copy Link */}
                            <button
                                onClick={() => handleShare(sharingPostId, 'copy')}
                                className="w-full flex items-center gap-4 p-4 rounded-xl bg-slate-50 hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 border-2 border-slate-200 hover:border-slate-300 transition-all duration-300 group"
                            >
                                <div className="w-12 h-12 bg-slate-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div className="flex-1 text-left">
                                    <p className="font-semibold text-slate-900">Copy Link</p>
                                    <p className="text-xs text-slate-500">Share anywhere you want</p>
                                </div>
                            </button>

                            {/* Twitter */}
                            <button
                                onClick={() => handleShare(sharingPostId, 'twitter')}
                                className="w-full flex items-center gap-4 p-4 rounded-xl bg-sky-50 hover:bg-gradient-to-r hover:from-sky-100 hover:to-sky-50 border-2 border-sky-200 hover:border-sky-300 transition-all duration-300 group"
                            >
                                <div className="w-12 h-12 bg-sky-400 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                                    </svg>
                                </div>
                                <div className="flex-1 text-left">
                                    <p className="font-semibold text-slate-900">Share on Twitter</p>
                                    <p className="text-xs text-slate-500">Tweet this achievement</p>
                                </div>
                            </button>

                            {/* Facebook */}
                            <button
                                onClick={() => handleShare(sharingPostId, 'facebook')}
                                className="w-full flex items-center gap-4 p-4 rounded-xl bg-blue-50 hover:bg-gradient-to-r hover:from-blue-100 hover:to-blue-50 border-2 border-blue-200 hover:border-blue-300 transition-all duration-300 group"
                            >
                                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                    </svg>
                                </div>
                                <div className="flex-1 text-left">
                                    <p className="font-semibold text-slate-900">Share on Facebook</p>
                                    <p className="text-xs text-slate-500">Post to your timeline</p>
                                </div>
                            </button>

                            {/* WhatsApp */}
                            <button
                                onClick={() => handleShare(sharingPostId, 'whatsapp')}
                                className="w-full flex items-center gap-4 p-4 rounded-xl bg-green-50 hover:bg-gradient-to-r hover:from-green-100 hover:to-green-50 border-2 border-green-200 hover:border-green-300 transition-all duration-300 group"
                            >
                                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                                    </svg>
                                </div>
                                <div className="flex-1 text-left">
                                    <p className="font-semibold text-slate-900">Share on WhatsApp</p>
                                    <p className="text-xs text-slate-500">Send to your contacts</p>
                                </div>
                            </button>

                            {/* LinkedIn */}
                            <button
                                onClick={() => handleShare(sharingPostId, 'linkedin')}
                                className="w-full flex items-center gap-4 p-4 rounded-xl bg-indigo-50 hover:bg-gradient-to-r hover:from-indigo-100 hover:to-indigo-50 border-2 border-indigo-200 hover:border-indigo-300 transition-all duration-300 group"
                            >
                                <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                                    </svg>
                                </div>
                                <div className="flex-1 text-left">
                                    <p className="font-semibold text-slate-900">Share on LinkedIn</p>
                                    <p className="text-xs text-slate-500">Share with professionals</p>
                                </div>
                            </button>
                        </div>

                        {/* Success Message */}
                        {shareSuccess && (
                            <div className="mt-4 p-3 bg-green-50 border-2 border-green-200 rounded-xl animate-in fade-in slide-in-from-top-2">
                                <p className="text-green-700 text-sm font-semibold text-center flex items-center justify-center gap-2">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    Link copied to clipboard!
                                </p>
                            </div>
                        )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
