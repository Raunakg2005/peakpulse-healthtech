'use client';

import { useState, useEffect } from 'react';
import { Trophy, Medal, Star, TrendingUp, Award, Share2 } from 'lucide-react';
import { RARITY_STYLES } from '@/lib/gamification';

interface Badge {
    id: string;
    name: string;
    description: string;
    icon: string;
    category: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    points: number;
}

export default function AchievementsPage() {
    const [badges, setBadges] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>('all');
    const [showCelebration, setShowCelebration] = useState(false);
    const [celebrationBadge, setCelebrationBadge] = useState<Badge | null>(null);
    const [sharingBadge, setSharingBadge] = useState<Badge | null>(null);
    const [shareSuccess, setShareSuccess] = useState(false);

    useEffect(() => {
        fetchBadges();
    }, []);

    const fetchBadges = async () => {
        try {
            const response = await fetch('/api/gamification');
            const data = await response.json();
            setBadges(data);
        } catch (error) {
            console.error('Failed to fetch badges:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleShare = (badge: Badge, method: string) => {
        const shareText = `🎉 I just unlocked the "${badge.name}" badge on PeakPulse! ${badge.icon} ${badge.description}`;
        const shareUrl = window.location.origin + '/achievements';

        switch (method) {
            case 'copy':
                navigator.clipboard.writeText(shareText);
                setShareSuccess(true);
                setTimeout(() => setShareSuccess(false), 2000);
                break;
            case 'twitter':
                window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
                break;
            case 'facebook':
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`, '_blank');
                break;
            case 'linkedin':
                window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank');
                break;
            case 'whatsapp':
                window.open(`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`, '_blank');
                break;
        }
        setSharingBadge(null);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
                    <Trophy className="w-16 h-16 text-teal-600 animate-bounce relative" />
                </div>
                <p className="text-slate-600 mt-4 animate-pulse">Loading achievements...</p>
            </div>
        );
    }

    const categories = ['all', 'streak', 'activity', 'challenge', 'social', 'milestone'];
    
    const filteredEarned = filter === 'all' 
        ? badges.earned 
        : badges.earned.filter((b: Badge) => b.category === filter);
    
    const filteredAvailable = filter === 'all'
        ? badges.available
        : badges.available.filter((item: any) => item.badge.category === filter);

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
            {/* Enhanced Header */}
            <div className="relative overflow-hidden bg-gradient-to-br from-amber-600 via-orange-600 to-rose-600 rounded-3xl p-12 shadow-2xl animate-in fade-in slide-in-from-top duration-700">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-2xl animate-pulse delay-500"></div>
                
                <div className="relative text-center">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="relative">
                            <div className="absolute inset-0 bg-white rounded-2xl blur-lg opacity-50 animate-pulse"></div>
                            <div className="relative bg-white/20 backdrop-blur-sm p-4 rounded-2xl border border-white/30">
                                <Trophy className="w-12 h-12 text-white animate-bounce" />
                            </div>
                        </div>
                    </div>
                    <h1 className="text-5xl font-bold text-white mb-3 animate-in fade-in slide-in-from-bottom duration-500">Achievements & Badges</h1>
                    <p className="text-white/90 text-lg animate-in fade-in slide-in-from-bottom duration-500 delay-100">Collect badges and track your progress on the journey to peak wellness</p>
                </div>
            </div>

            {/* Enhanced Stats Overview */}
            <div className="grid md:grid-cols-3 gap-6">
                <div className="group bg-gradient-to-br from-teal-50 to-emerald-50 rounded-2xl p-6 border-2 border-teal-200 hover:border-teal-400 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-1 animate-in fade-in slide-in-from-left duration-500">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="relative">
                            <div className="absolute inset-0 bg-teal-500 rounded-xl blur-md opacity-0 group-hover:opacity-50 transition-opacity"></div>
                            <div className="relative bg-gradient-to-br from-teal-500 to-emerald-500 p-3 rounded-xl shadow-lg">
                                <Trophy className="w-8 h-8 text-white" />
                            </div>
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900">Badges Earned</h3>
                    </div>
                    <p className="text-5xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent mb-1">{badges.stats.totalBadges}</p>
                    <p className="text-sm text-slate-600">out of {badges.stats.totalPossible} available</p>
                    <div className="mt-3 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full transition-all duration-1000" style={{ width: `${(badges.stats.totalBadges / badges.stats.totalPossible) * 100}%` }}></div>
                    </div>
                </div>

                <div className="group bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-200 hover:border-purple-400 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-1 animate-in fade-in slide-in-from-bottom duration-500 delay-100">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="relative">
                            <div className="absolute inset-0 bg-purple-500 rounded-xl blur-md opacity-0 group-hover:opacity-50 transition-opacity"></div>
                            <div className="relative bg-gradient-to-br from-purple-500 to-pink-500 p-3 rounded-xl shadow-lg">
                                <Medal className="w-8 h-8 text-white" />
                            </div>
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900">Completion</h3>
                    </div>
                    <p className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-1">{badges.stats.completionRate}%</p>
                    <p className="text-sm text-slate-600">collection progress</p>
                    <div className="mt-3 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-1000" style={{ width: `${badges.stats.completionRate}%` }}></div>
                    </div>
                </div>

                <div className="group bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border-2 border-amber-200 hover:border-amber-400 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-1 animate-in fade-in slide-in-from-right duration-500 delay-200">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="relative">
                            <div className="absolute inset-0 bg-amber-500 rounded-xl blur-md opacity-0 group-hover:opacity-50 transition-opacity"></div>
                            <div className="relative bg-gradient-to-br from-amber-500 to-orange-500 p-3 rounded-xl shadow-lg">
                                <Star className="w-8 h-8 text-white" />
                            </div>
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900">In Progress</h3>
                    </div>
                    <p className="text-5xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-1">
                        {badges.available.filter((b: any) => b.progress > 0 && b.progress < 100).length}
                    </p>
                    <p className="text-sm text-slate-600">badges to unlock</p>
                    <div className="mt-3 flex items-center gap-1">
                        <Star className="w-4 h-4 text-amber-500 animate-pulse" />
                        <Star className="w-4 h-4 text-amber-500 animate-pulse delay-100" />
                        <Star className="w-4 h-4 text-amber-500 animate-pulse delay-200" />
                    </div>
                </div>
            </div>

            {/* Enhanced Filter Tabs */}
            <div className="flex gap-3 overflow-x-auto pb-2">
                {categories.map((category) => (
                    <button
                        key={category}
                        onClick={() => setFilter(category)}
                        className={`relative px-6 py-3 rounded-xl font-semibold whitespace-nowrap transition-all duration-300 ${
                            filter === category
                                ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-lg scale-105'
                                : 'bg-white text-slate-600 hover:bg-slate-50 hover:scale-105 border-2 border-slate-200 hover:border-teal-300'
                        }`}
                    >
                        {filter === category && (
                            <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-emerald-400 rounded-xl blur-lg opacity-30 animate-pulse -z-10"></div>
                        )}
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                    </button>
                ))}
            </div>

            {/* Enhanced Earned Badges */}
            {filteredEarned.length > 0 && (
                <div className="animate-in fade-in slide-in-from-bottom duration-500">
                    <h2 className="text-3xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                        <div className="relative">
                            <div className="absolute inset-0 bg-teal-500 rounded-xl blur-md opacity-50 animate-pulse"></div>
                            <div className="relative bg-gradient-to-br from-teal-500 to-emerald-500 p-2 rounded-xl">
                                <Award className="w-7 h-7 text-white" />
                            </div>
                        </div>
                        Unlocked Badges
                        <span className="ml-2 px-3 py-1 bg-teal-100 text-teal-700 text-sm font-bold rounded-full">{filteredEarned.length}</span>
                    </h2>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredEarned.map((badge: Badge, idx: number) => {
                            const styles = RARITY_STYLES[badge.rarity];
                            return (
                                <div
                                    key={badge.id}
                                    className={`group relative ${styles.bg} ${styles.border} border-2 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-2 cursor-pointer overflow-hidden animate-in fade-in slide-in-from-bottom-4`}
                                    style={{ animationDelay: `${idx * 50}ms` }}
                                    onClick={() => {
                                        setCelebrationBadge(badge);
                                        setShowCelebration(true);
                                    }}
                                >
                                    {/* Glow effect */}
                                    <div className={`absolute inset-0 ${styles.bg} rounded-2xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500`}></div>
                                    
                                    {/* Rarity indicator */}
                                    <div className={`absolute top-3 right-3 px-3 py-1.5 ${styles.bg} ${styles.border} border-2 rounded-full shadow-lg z-10`}>
                                        <span className={`text-xs font-bold ${styles.text} uppercase tracking-wide`}>
                                            {badge.rarity}
                                        </span>
                                    </div>

                                    {/* Badge Icon with enhanced animation */}
                                    <div className="relative mb-4">
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-amber-400 rounded-full blur-2xl animate-pulse"></div>
                                        </div>
                                        <div className="text-7xl transform group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300 relative">
                                            {badge.icon}
                                        </div>
                                    </div>

                                    {/* Badge Info */}
                                    <h3 className="font-bold text-xl text-slate-900 mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-teal-600 group-hover:to-emerald-600 transition-all duration-300 relative z-10">
                                        {badge.name}
                                    </h3>
                                    <p className="text-sm text-slate-600 mb-4 leading-relaxed relative z-10">
                                        {badge.description}
                                    </p>

                                    {/* Points with shine effect */}
                                    <div className="relative z-10 flex items-center justify-between gap-2">
                                        {badge.points > 0 && (
                                            <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-amber-100 to-yellow-100 rounded-lg border border-amber-200">
                                                <Star className="w-5 h-5 fill-amber-500 text-amber-500 animate-pulse" />
                                                <span className="font-bold text-amber-700">{badge.points} pts</span>
                                            </div>
                                        )}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSharingBadge(badge);
                                            }}
                                            className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-teal-100 to-emerald-100 hover:from-teal-200 hover:to-emerald-200 text-teal-700 rounded-lg border border-teal-200 hover:border-teal-300 transition-all duration-300 hover:scale-105 shadow-sm hover:shadow-md"
                                        >
                                            <Share2 className="w-4 h-4" />
                                            <span className="text-sm font-semibold">Share</span>
                                        </button>
                                    </div>

                                    {/* Unlocked shine effect */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/10 to-white/30 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                    
                                    {/* Corner sparkle */}
                                    <div className="absolute top-0 left-0 w-16 h-16 bg-gradient-to-br from-white/40 to-transparent rounded-tl-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Enhanced Available Badges (Locked) */}
            <div className="animate-in fade-in slide-in-from-bottom duration-500 delay-300">
                <h2 className="text-3xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                    <div className="relative">
                        <div className="absolute inset-0 bg-slate-400 rounded-xl blur-md opacity-30"></div>
                        <div className="relative bg-gradient-to-br from-slate-500 to-slate-600 p-2 rounded-xl">
                            <TrendingUp className="w-7 h-7 text-white" />
                        </div>
                    </div>
                    Locked Badges
                    <span className="ml-2 px-3 py-1 bg-slate-100 text-slate-700 text-sm font-bold rounded-full">{filteredAvailable.length}</span>
                </h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredAvailable.map((item: any, idx: number) => {
                        const badge = item.badge as Badge;
                        const styles = RARITY_STYLES[badge.rarity];
                        const inProgress = item.progress > 0;
                        return (
                            <div
                                key={badge.id}
                                className={`group relative bg-slate-50 border-2 rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 overflow-hidden animate-in fade-in slide-in-from-bottom-4 ${
                                    inProgress ? 'border-teal-400 bg-gradient-to-br from-teal-50/50 to-emerald-50/50' : 'border-slate-200 hover:border-slate-300'
                                }`}
                                style={{ animationDelay: `${idx * 50}ms` }}
                            >
                                {/* Enhanced Progress indicator */}
                                {inProgress && (
                                    <div className="absolute top-0 left-0 right-0 h-2 bg-slate-200 rounded-t-2xl overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-teal-500 via-emerald-500 to-cyan-500 transition-all duration-1000 animate-pulse"
                                            style={{ width: `${item.progress}%` }}
                                        ></div>
                                    </div>
                                )}

                                {/* Rarity indicator */}
                                <div className={`absolute top-3 right-3 px-3 py-1.5 bg-slate-200 border-2 border-slate-300 rounded-full shadow-md z-10`}>
                                    <span className={`text-xs font-bold text-slate-600 uppercase tracking-wide`}>
                                        {badge.rarity}
                                    </span>
                                </div>

                                {/* Lock icon overlay for locked badges */}
                                {!inProgress && (
                                    <div className="absolute top-3 left-3 bg-slate-700 text-white p-2 rounded-lg shadow-lg z-10">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                )}

                                {/* Badge Icon (grayed out with hover effect) */}
                                <div className="relative mb-4">
                                    <div className={`text-7xl mb-2 transition-all duration-300 ${
                                        inProgress ? 'opacity-50 grayscale-[50%] group-hover:opacity-70' : 'opacity-30 grayscale group-hover:opacity-40'
                                    }`}>
                                        {badge.icon}
                                    </div>
                                </div>

                                {/* Badge Info */}
                                <h3 className={`font-bold text-xl mb-2 relative z-10 ${
                                    inProgress ? 'text-slate-800' : 'text-slate-600'
                                }`}>
                                    {badge.name}
                                </h3>
                                <p className="text-sm text-slate-500 mb-4 leading-relaxed relative z-10">
                                    {badge.description}
                                </p>

                                {/* Progress with animated bar */}
                                {inProgress && (
                                    <div className="mb-4 relative z-10">
                                        <div className="flex justify-between items-center text-sm mb-2">
                                            <span className="text-teal-600 font-semibold flex items-center gap-1">
                                                <TrendingUp className="w-4 h-4" />
                                                Progress
                                            </span>
                                            <span className="font-bold text-teal-700">{item.progress}%</span>
                                        </div>
                                        <div className="h-2.5 bg-slate-200 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full transition-all duration-1000"
                                                style={{ width: `${item.progress}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                )}

                                {/* Points */}
                                {badge.points > 0 && (
                                    <div className="relative z-10 flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-lg border border-slate-200">
                                        <Star className={`w-5 h-5 ${
                                            inProgress ? 'text-slate-400 fill-slate-400' : 'text-slate-300 fill-slate-300'
                                        }`} />
                                        <span className={`font-bold ${
                                            inProgress ? 'text-slate-600' : 'text-slate-400'
                                        }`}>{badge.points} pts</span>
                                    </div>
                                )}

                                {/* Locked overlay */}
                                <div className={`absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-300 ${
                                    inProgress ? 'bg-gradient-to-br from-transparent to-teal-100/30 opacity-50' : 'bg-gradient-to-br from-slate-100/60 to-slate-200/60 opacity-80 group-hover:opacity-70'
                                }`}></div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Empty State */}
            {filteredEarned.length === 0 && filteredAvailable.length === 0 && (
                <div className="text-center py-12">
                    <Trophy className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500">No badges found in this category</p>
                </div>
            )}

            {/* Celebration Modal */}
            {showCelebration && celebrationBadge && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
                    {/* Backdrop */}
                    <div 
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setShowCelebration(false)}
                    ></div>
                    
                    {/* Modal */}
                    <div className="relative bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-8 duration-500">
                        {/* Confetti effect */}
                        <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
                            <div className="absolute top-10 left-10 w-3 h-3 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="absolute top-20 right-20 w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '100ms' }}></div>
                            <div className="absolute top-32 left-1/4 w-2.5 h-2.5 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></div>
                            <div className="absolute top-16 right-1/3 w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                            <div className="absolute top-24 left-1/2 w-3 h-3 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '400ms' }}></div>
                            <div className="absolute top-40 right-16 w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '500ms' }}></div>
                        </div>

                        {/* Close button */}
                        <button
                            onClick={() => setShowCelebration(false)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        {/* Celebration content */}
                        <div className="text-center">
                            {/* Trophy animation */}
                            <div className="relative inline-block mb-6">
                                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400 rounded-full blur-2xl opacity-60 animate-pulse"></div>
                                <div className="relative bg-gradient-to-br from-amber-100 to-yellow-100 p-6 rounded-full border-4 border-amber-300 shadow-xl">
                                    <div className="text-8xl animate-bounce">
                                        {celebrationBadge.icon}
                                    </div>
                                </div>
                            </div>

                            {/* Congratulations message */}
                            <h2 className="text-4xl font-bold bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 bg-clip-text text-transparent mb-3 animate-in slide-in-from-bottom duration-500 delay-200">
                                🎉 Congratulations! 🎉
                            </h2>
                            
                            <p className="text-xl text-slate-600 mb-4 animate-in fade-in duration-500 delay-300">
                                You've unlocked the
                            </p>

                            {/* Badge name */}
                            <div className={`${RARITY_STYLES[celebrationBadge.rarity].bg} ${RARITY_STYLES[celebrationBadge.rarity].border} border-2 rounded-2xl p-6 mb-4 animate-in zoom-in-95 duration-500 delay-400`}>
                                <h3 className="text-2xl font-bold text-slate-900 mb-2">
                                    {celebrationBadge.name}
                                </h3>
                                <p className="text-slate-600 mb-3">
                                    {celebrationBadge.description}
                                </p>
                                <div className="flex items-center justify-center gap-2">
                                    <span className={`px-3 py-1 ${RARITY_STYLES[celebrationBadge.rarity].bg} ${RARITY_STYLES[celebrationBadge.rarity].border} border rounded-full`}>
                                        <span className={`text-sm font-bold ${RARITY_STYLES[celebrationBadge.rarity].text} uppercase`}>
                                            {celebrationBadge.rarity}
                                        </span>
                                    </span>
                                    {celebrationBadge.points > 0 && (
                                        <span className="px-3 py-1 bg-amber-100 border-2 border-amber-300 rounded-full flex items-center gap-1">
                                            <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                                            <span className="text-sm font-bold text-amber-700">{celebrationBadge.points} pts</span>
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Keep going message */}
                            <p className="text-slate-500 text-sm mb-6 animate-in fade-in duration-500 delay-500">
                                Keep up the amazing work! More badges await you on your journey to peak wellness. 💪
                            </p>

                            {/* Action button */}
                            <button
                                onClick={() => setShowCelebration(false)}
                                className="w-full py-4 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                            >
                                Awesome! Let's Continue
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Share Badge Modal */}
            {sharingBadge && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
                    {/* Backdrop */}
                    <div 
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setSharingBadge(null)}
                    ></div>
                    
                    {/* Modal with Scroll */}
                    <div className="relative bg-white rounded-3xl max-w-md w-full shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-8 duration-500 max-h-[90vh] flex flex-col">
                        {/* Close button */}
                        <button
                            onClick={() => setSharingBadge(null)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors z-10"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        {/* Scrollable Content */}
                        <div className="overflow-y-auto p-8">
                            {/* Header with Badge */}
                            <div className="text-center mb-6">
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-100 to-yellow-100 rounded-2xl mb-4 shadow-lg border-2 border-amber-200">
                                <div className="text-5xl">{sharingBadge.icon}</div>
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-2">Share Your Achievement!</h2>
                            <p className="text-slate-600 text-sm mb-3">Let the world know about your <span className="font-semibold text-amber-600">{sharingBadge.name}</span> badge</p>
                            <div className={`inline-block px-3 py-1 ${RARITY_STYLES[sharingBadge.rarity].bg} ${RARITY_STYLES[sharingBadge.rarity].border} border-2 rounded-full`}>
                                <span className={`text-xs font-bold ${RARITY_STYLES[sharingBadge.rarity].text} uppercase`}>
                                    {sharingBadge.rarity}
                                </span>
                            </div>
                            </div>

                            {/* Share Options */}
                            <div className="space-y-3">
                                {/* Share to Community */}
                                <button
                                    onClick={async () => {
                                        try {
                                            const response = await fetch('/api/social/posts', {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({
                                                    content: `🎉 Just unlocked the "${sharingBadge.name}" badge! ${sharingBadge.icon}\n\n${sharingBadge.description}\n\n#PeakPulse #Achievement #Wellness`,
                                                    category: 'achievement'
                                                })
                                            });
                                            if (response.ok) {
                                                setSharingBadge(null);
                                                window.location.href = '/dashboard/social';
                                            }
                                        } catch (error) {
                                            console.error('Failed to share to community:', error);
                                        }
                                    }}
                                    className="w-full flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 border-2 border-purple-200 hover:border-purple-300 transition-all duration-300 group"
                                >
                                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1 text-left">
                                        <p className="font-semibold text-slate-900">Share to Community</p>
                                        <p className="text-xs text-slate-500">Post this achievement to your feed</p>
                                    </div>
                                </button>
                            {/* Copy Text */}
                            <button
                                onClick={() => handleShare(sharingBadge, 'copy')}
                                className="w-full flex items-center gap-4 p-4 rounded-xl bg-slate-50 hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 border-2 border-slate-200 hover:border-slate-300 transition-all duration-300 group"
                            >
                                <div className="w-12 h-12 bg-slate-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div className="flex-1 text-left">
                                    <p className="font-semibold text-slate-900">Copy Message</p>
                                    <p className="text-xs text-slate-500">Share anywhere you want</p>
                                </div>
                            </button>

                            {/* Twitter */}
                            <button
                                onClick={() => handleShare(sharingBadge, 'twitter')}
                                className="w-full flex items-center gap-4 p-4 rounded-xl bg-sky-50 hover:bg-gradient-to-r hover:from-sky-100 hover:to-sky-50 border-2 border-sky-200 hover:border-sky-300 transition-all duration-300 group"
                            >
                                <div className="w-12 h-12 bg-sky-400 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                                    </svg>
                                </div>
                                <div className="flex-1 text-left">
                                    <p className="font-semibold text-slate-900">Share on Twitter</p>
                                    <p className="text-xs text-slate-500">Tweet your achievement</p>
                                </div>
                            </button>

                            {/* Facebook */}
                            <button
                                onClick={() => handleShare(sharingBadge, 'facebook')}
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
                                onClick={() => handleShare(sharingBadge, 'whatsapp')}
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
                                onClick={() => handleShare(sharingBadge, 'linkedin')}
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
                                    Message copied to clipboard!
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
