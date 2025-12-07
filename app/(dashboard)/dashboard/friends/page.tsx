'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Users, Search, UserPlus, Check, X, Trash2, Clock, Award, TrendingUp, Flame } from 'lucide-react';
import { getAvatarById } from '@/lib/avatars';

interface User {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
    status?: 'active' | 'non-active' | 'rest-day';
    stats: {
        totalPoints: number;
        currentStreak: number;
        level: number;
    };
    friendshipStatus?: {
        status: string;
        friendshipId: string;
        isSender: boolean;
    } | null;
}

interface Friendship {
    _id: string;
    friend: User;
    status: string;
    requestedBy: {
        _id: string;
        name: string;
    };
    isSender: boolean;
    createdAt: string;
}

export default function FriendsPage() {
    const { data: session } = useSession();
    const [activeTab, setActiveTab] = useState<'friends' | 'pending' | 'search'>('friends');
    const [friends, setFriends] = useState<Friendship[]>([]);
    const [pendingRequests, setPendingRequests] = useState<Friendship[]>([]);
    const [sentRequests, setSentRequests] = useState<Friendship[]>([]);
    const [searchResults, setSearchResults] = useState<User[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    useEffect(() => {
        fetchFriends();
        fetchPendingRequests();
        fetchSentRequests();
    }, []);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchQuery.trim().length >= 2) {
                searchUsers();
            } else {
                setSearchResults([]);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    const fetchFriends = async () => {
        try {
            const response = await fetch('/api/friends?type=friends');
            const data = await response.json();
            if (data.success) {
                setFriends(data.friendships);
            }
        } catch (error) {
            console.error('Failed to fetch friends:', error);
        }
    };

    const fetchPendingRequests = async () => {
        try {
            const response = await fetch('/api/friends?type=pending');
            const data = await response.json();
            if (data.success) {
                setPendingRequests(data.friendships);
            }
        } catch (error) {
            console.error('Failed to fetch pending requests:', error);
        }
    };

    const fetchSentRequests = async () => {
        try {
            const response = await fetch('/api/friends?type=sent');
            const data = await response.json();
            if (data.success) {
                setSentRequests(data.friendships);
            }
        } catch (error) {
            console.error('Failed to fetch sent requests:', error);
        }
    };

    const searchUsers = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}`);
            const data = await response.json();
            if (data.success) {
                setSearchResults(data.users);
            }
        } catch (error) {
            console.error('Failed to search users:', error);
        } finally {
            setLoading(false);
        }
    };

    const sendFriendRequest = async (friendId: string) => {
        setActionLoading(friendId);
        try {
            const response = await fetch('/api/friends', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ friendId })
            });
            const data = await response.json();
            if (data.success) {
                // Update search results to reflect the new status
                setSearchResults(prev => prev.map(user =>
                    user._id === friendId
                        ? { ...user, friendshipStatus: { status: 'pending', friendshipId: data.friendship._id, isSender: true } }
                        : user
                ));
                fetchSentRequests();
            } else {
                alert(data.error || 'Failed to send friend request');
            }
        } catch (error) {
            console.error('Failed to send friend request:', error);
            alert('Failed to send friend request');
        } finally {
            setActionLoading(null);
        }
    };

    const handleFriendRequest = async (friendshipId: string, action: 'accept' | 'reject') => {
        setActionLoading(friendshipId);
        try {
            const response = await fetch(`/api/friends/${friendshipId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action })
            });
            const data = await response.json();
            if (data.success) {
                fetchFriends();
                fetchPendingRequests();
            } else {
                alert(data.error || `Failed to ${action} friend request`);
            }
        } catch (error) {
            console.error(`Failed to ${action} friend request:`, error);
            alert(`Failed to ${action} friend request`);
        } finally {
            setActionLoading(null);
        }
    };

    const removeFriend = async (friendshipId: string) => {
        if (!confirm('Are you sure you want to remove this friend?')) return;

        setActionLoading(friendshipId);
        try {
            const response = await fetch(`/api/friends/${friendshipId}`, {
                method: 'DELETE'
            });
            const data = await response.json();
            if (data.success) {
                fetchFriends();
                fetchSentRequests();
            } else {
                alert(data.error || 'Failed to remove friend');
            }
        } catch (error) {
            console.error('Failed to remove friend:', error);
            alert('Failed to remove friend');
        } finally {
            setActionLoading(null);
        }
    };

    const renderFriendCard = (friendship: Friendship) => {
        const { friend } = friendship;
        return (
            <div
                key={friendship._id}
                className="group bg-white p-6 rounded-2xl border-2 border-slate-200 hover:border-purple-300 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
            >
                <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full blur-md opacity-0 group-hover:opacity-50 transition-opacity"></div>
                        <div className="relative w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center overflow-hidden border-2 border-slate-200 group-hover:border-purple-400 transition-colors">
                            <img
                                src={getAvatarById(friend.avatar)?.imageUrl || '/avatars/default.png'}
                                alt={friend.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-lg text-slate-900 truncate group-hover:text-purple-600 transition-colors">
                                {friend.name}
                            </h3>
                            {/* Status Badge */}
                            {friend.status && (
                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 whitespace-nowrap ${friend.status === 'active'
                                        ? 'bg-green-100 text-green-700'
                                        : friend.status === 'non-active'
                                            ? 'bg-orange-100 text-orange-700'
                                            : 'bg-blue-100 text-blue-700'
                                    }`}>
                                    {friend.status === 'active' && '💪'}
                                    {friend.status === 'non-active' && '⏸️'}
                                    {friend.status === 'rest-day' && '😴'}
                                    <span className="capitalize">{friend.status.replace('-', ' ')}</span>
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-slate-500 truncate">{friend.email}</p>

                        {/* Stats */}
                        <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center gap-1 text-sm">
                                <Flame className="w-4 h-4 text-orange-500" />
                                <span className="font-semibold text-slate-700">{friend.stats.currentStreak}</span>
                                <span className="text-slate-500">streak</span>
                            </div>
                            <div className="flex items-center gap-1 text-sm">
                                <Award className="w-4 h-4 text-purple-500" />
                                <span className="font-semibold text-slate-700">{friend.stats.totalPoints.toLocaleString()}</span>
                                <span className="text-slate-500">pts</span>
                            </div>
                            <div className="flex items-center gap-1 text-sm">
                                <TrendingUp className="w-4 h-4 text-blue-500" />
                                <span className="font-semibold text-slate-700">Lv {friend.stats.level}</span>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <button
                        onClick={() => removeFriend(friendship._id)}
                        disabled={actionLoading === friendship._id}
                        className="p-3 rounded-xl bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all disabled:opacity-50"
                        title="Remove friend"
                    >
                        {actionLoading === friendship._id ? (
                            <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <Trash2 className="w-5 h-5" />
                        )}
                    </button>
                </div>
            </div>
        );
    };

    const renderPendingRequest = (friendship: Friendship) => {
        const { friend, requestedBy } = friendship;
        return (
            <div
                key={friendship._id}
                className="group bg-white p-6 rounded-2xl border-2 border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300"
            >
                <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="relative w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center overflow-hidden border-2 border-purple-300">
                        <img
                            src={getAvatarById(friend.avatar)?.imageUrl || '/avatars/default.png'}
                            alt={friend.name}
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg text-slate-900 truncate">
                            {friend.name}
                        </h3>
                        <p className="text-sm text-slate-500 truncate">{friend.email}</p>
                        <p className="text-xs text-purple-600 mt-1 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Wants to be your friend
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => handleFriendRequest(friendship._id, 'accept')}
                            disabled={actionLoading === friendship._id}
                            className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 transition-all disabled:opacity-50 shadow-lg hover:shadow-xl"
                            title="Accept"
                        >
                            {actionLoading === friendship._id ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <Check className="w-5 h-5" />
                            )}
                        </button>
                        <button
                            onClick={() => handleFriendRequest(friendship._id, 'reject')}
                            disabled={actionLoading === friendship._id}
                            className="p-3 rounded-xl bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all disabled:opacity-50"
                            title="Reject"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const renderSentRequest = (friendship: Friendship) => {
        const { friend } = friendship;
        return (
            <div
                key={friendship._id}
                className="group bg-white p-6 rounded-2xl border-2 border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300"
            >
                <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="relative w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center overflow-hidden border-2 border-slate-300">
                        <img
                            src={getAvatarById(friend.avatar)?.imageUrl || '/avatars/default.png'}
                            alt={friend.name}
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg text-slate-900 truncate">
                            {friend.name}
                        </h3>
                        <p className="text-sm text-slate-500 truncate">{friend.email}</p>
                        <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Request pending
                        </p>
                    </div>

                    {/* Actions */}
                    <button
                        onClick={() => removeFriend(friendship._id)}
                        disabled={actionLoading === friendship._id}
                        className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all disabled:opacity-50 text-sm font-medium"
                    >
                        {actionLoading === friendship._id ? 'Canceling...' : 'Cancel Request'}
                    </button>
                </div>
            </div>
        );
    };

    const renderSearchResult = (user: User) => {
        const { friendshipStatus } = user;

        let buttonContent;
        let buttonClass = "px-4 py-2 rounded-xl font-medium transition-all disabled:opacity-50";
        let onClick = () => { };
        let disabled = false;

        if (friendshipStatus?.status === 'accepted') {
            buttonContent = (
                <>
                    <Check className="w-4 h-4" />
                    <span>Friends</span>
                </>
            );
            buttonClass += " bg-green-100 text-green-700 cursor-default";
            disabled = true;
        } else if (friendshipStatus?.status === 'pending') {
            if (friendshipStatus.isSender) {
                buttonContent = (
                    <>
                        <Clock className="w-4 h-4" />
                        <span>Pending</span>
                    </>
                );
                buttonClass += " bg-slate-100 text-slate-600 cursor-default";
                disabled = true;
            } else {
                buttonContent = (
                    <>
                        <Check className="w-4 h-4" />
                        <span>Accept</span>
                    </>
                );
                buttonClass += " bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 shadow-lg";
                onClick = () => handleFriendRequest(friendshipStatus.friendshipId, 'accept');
            }
        } else {
            buttonContent = (
                <>
                    <UserPlus className="w-4 h-4" />
                    <span>Add Friend</span>
                </>
            );
            buttonClass += " bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl";
            onClick = () => sendFriendRequest(user._id);
        }

        return (
            <div
                key={user._id}
                className="group bg-white p-6 rounded-2xl border-2 border-slate-200 hover:border-purple-300 shadow-lg hover:shadow-xl transition-all duration-300"
            >
                <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="relative w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center overflow-hidden border-2 border-slate-200 group-hover:border-purple-400 transition-colors">
                        <img
                            src={getAvatarById(user.avatar)?.imageUrl || '/avatars/default.png'}
                            alt={user.name}
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg text-slate-900 truncate group-hover:text-purple-600 transition-colors">
                            {user.name}
                        </h3>
                        <p className="text-sm text-slate-500 truncate">{user.email}</p>

                        {/* Stats */}
                        <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center gap-1 text-sm">
                                <Flame className="w-4 h-4 text-orange-500" />
                                <span className="font-semibold text-slate-700">{user.stats.currentStreak}</span>
                            </div>
                            <div className="flex items-center gap-1 text-sm">
                                <Award className="w-4 h-4 text-purple-500" />
                                <span className="font-semibold text-slate-700">{user.stats.totalPoints.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-1 text-sm">
                                <TrendingUp className="w-4 h-4 text-blue-500" />
                                <span className="font-semibold text-slate-700">Lv {user.stats.level}</span>
                            </div>
                        </div>
                    </div>

                    {/* Action Button */}
                    <button
                        onClick={onClick}
                        disabled={disabled || actionLoading === user._id}
                        className={`${buttonClass} flex items-center gap-2`}
                    >
                        {actionLoading === user._id ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            buttonContent
                        )}
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-pink-600 to-rose-600 rounded-2xl p-8 shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-300/20 rounded-full blur-2xl"></div>
                <div className="relative">
                    <div className="flex items-center gap-3 mb-2">
                        <Users className="w-8 h-8 text-white" />
                        <h1 className="text-4xl font-bold text-white">Friends</h1>
                    </div>
                    <p className="text-purple-50 text-lg">Connect with friends and track your progress together! 🤝</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 bg-white p-2 rounded-2xl border-2 border-slate-200 shadow-lg">
                <button
                    onClick={() => setActiveTab('friends')}
                    className={`flex-1 px-6 py-3 rounded-xl font-bold transition-all duration-300 ${activeTab === 'friends'
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                        : 'text-slate-600 hover:bg-slate-50'
                        }`}
                >
                    <div className="flex items-center justify-center gap-2">
                        <Users className="w-5 h-5" />
                        <span>My Friends</span>
                        {friends.length > 0 && (
                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${activeTab === 'friends' ? 'bg-white/20' : 'bg-purple-100 text-purple-600'
                                }`}>
                                {friends.length}
                            </span>
                        )}
                    </div>
                </button>
                <button
                    onClick={() => setActiveTab('pending')}
                    className={`flex-1 px-6 py-3 rounded-xl font-bold transition-all duration-300 ${activeTab === 'pending'
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                        : 'text-slate-600 hover:bg-slate-50'
                        }`}
                >
                    <div className="flex items-center justify-center gap-2">
                        <Clock className="w-5 h-5" />
                        <span>Requests</span>
                        {pendingRequests.length > 0 && (
                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${activeTab === 'pending' ? 'bg-white/20' : 'bg-red-100 text-red-600'
                                }`}>
                                {pendingRequests.length}
                            </span>
                        )}
                    </div>
                </button>
                <button
                    onClick={() => setActiveTab('search')}
                    className={`flex-1 px-6 py-3 rounded-xl font-bold transition-all duration-300 ${activeTab === 'search'
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                        : 'text-slate-600 hover:bg-slate-50'
                        }`}
                >
                    <div className="flex items-center justify-center gap-2">
                        <Search className="w-5 h-5" />
                        <span>Find Friends</span>
                    </div>
                </button>
            </div>

            {/* Content */}
            <div className="space-y-4">
                {activeTab === 'friends' && (
                    <>
                        {friends.length === 0 ? (
                            <div className="text-center py-16 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border-2 border-dashed border-slate-300">
                                <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                                <p className="text-lg font-semibold text-slate-600 mb-2">No friends yet</p>
                                <p className="text-slate-500 mb-4">Start connecting with other users!</p>
                                <button
                                    onClick={() => setActiveTab('search')}
                                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl"
                                >
                                    Find Friends
                                </button>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {friends.map(renderFriendCard)}
                            </div>
                        )}
                    </>
                )}

                {activeTab === 'pending' && (
                    <>
                        {pendingRequests.length === 0 && sentRequests.length === 0 ? (
                            <div className="text-center py-16 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border-2 border-dashed border-slate-300">
                                <Clock className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                                <p className="text-lg font-semibold text-slate-600 mb-2">No pending requests</p>
                                <p className="text-slate-500">You're all caught up!</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {pendingRequests.length > 0 && (
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                            Received Requests ({pendingRequests.length})
                                        </h2>
                                        <div className="grid gap-4">
                                            {pendingRequests.map(renderPendingRequest)}
                                        </div>
                                    </div>
                                )}

                                {sentRequests.length > 0 && (
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-900 mb-4">
                                            Sent Requests ({sentRequests.length})
                                        </h2>
                                        <div className="grid gap-4">
                                            {sentRequests.map(renderSentRequest)}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}

                {activeTab === 'search' && (
                    <>
                        {/* Search Bar */}
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-lg"
                            />
                            {loading && (
                                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                    <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            )}
                        </div>

                        {/* Search Results */}
                        {searchQuery.trim().length < 2 ? (
                            <div className="text-center py-16 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border-2 border-dashed border-slate-300">
                                <Search className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                                <p className="text-lg font-semibold text-slate-600 mb-2">Search for users</p>
                                <p className="text-slate-500">Type at least 2 characters to start searching</p>
                            </div>
                        ) : searchResults.length === 0 && !loading ? (
                            <div className="text-center py-16 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border-2 border-dashed border-slate-300">
                                <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                                <p className="text-lg font-semibold text-slate-600 mb-2">No users found</p>
                                <p className="text-slate-500">Try a different search term</p>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {searchResults.map(renderSearchResult)}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
