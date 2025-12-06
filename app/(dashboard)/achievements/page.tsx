'use client';

import { useState, useEffect } from 'react';
import { Trophy, Medal, Star, TrendingUp, Award } from 'lucide-react';
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

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
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
            {/* Header */}
            <div className="text-center">
                <h1 className="text-4xl font-bold text-slate-900 mb-2">Achievements & Badges</h1>
                <p className="text-slate-600">Collect badges and track your progress</p>
            </div>

            {/* Stats Overview */}
            <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-2xl p-6 border border-teal-200">
                    <div className="flex items-center gap-3 mb-2">
                        <Trophy className="w-8 h-8 text-teal-600" />
                        <h3 className="text-lg font-semibold text-slate-900">Badges Earned</h3>
                    </div>
                    <p className="text-4xl font-bold text-teal-700">{badges.stats.totalBadges}</p>
                    <p className="text-sm text-slate-600 mt-1">out of {badges.stats.totalPossible}</p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
                    <div className="flex items-center gap-3 mb-2">
                        <Medal className="w-8 h-8 text-purple-600" />
                        <h3 className="text-lg font-semibold text-slate-900">Completion</h3>
                    </div>
                    <p className="text-4xl font-bold text-purple-700">{badges.stats.completionRate}%</p>
                    <p className="text-sm text-slate-600 mt-1">collection progress</p>
                </div>

                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200">
                    <div className="flex items-center gap-3 mb-2">
                        <Star className="w-8 h-8 text-amber-600" />
                        <h3 className="text-lg font-semibold text-slate-900">In Progress</h3>
                    </div>
                    <p className="text-4xl font-bold text-amber-700">
                        {badges.available.filter((b: any) => b.progress > 0 && b.progress < 100).length}
                    </p>
                    <p className="text-sm text-slate-600 mt-1">badges to unlock</p>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {categories.map((category) => (
                    <button
                        key={category}
                        onClick={() => setFilter(category)}
                        className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition ${
                            filter === category
                                ? 'bg-teal-600 text-white'
                                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                        }`}
                    >
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                    </button>
                ))}
            </div>

            {/* Earned Badges */}
            {filteredEarned.length > 0 && (
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <Award className="w-6 h-6 text-teal-600" />
                        Unlocked Badges
                    </h2>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredEarned.map((badge: Badge) => {
                            const styles = RARITY_STYLES[badge.rarity];
                            return (
                                <div
                                    key={badge.id}
                                    className={`${styles.bg} ${styles.border} border-2 rounded-2xl p-6 shadow-lg hover:shadow-xl transition relative overflow-hidden`}
                                >
                                    {/* Rarity indicator */}
                                    <div className={`absolute top-2 right-2 px-2 py-1 ${styles.bg} ${styles.border} border rounded-full`}>
                                        <span className={`text-xs font-bold ${styles.text} uppercase`}>
                                            {badge.rarity}
                                        </span>
                                    </div>

                                    {/* Badge Icon */}
                                    <div className="text-6xl mb-3 animate-bounce-slow">
                                        {badge.icon}
                                    </div>

                                    {/* Badge Info */}
                                    <h3 className="font-bold text-lg text-slate-900 mb-1">
                                        {badge.name}
                                    </h3>
                                    <p className="text-sm text-slate-600 mb-3">
                                        {badge.description}
                                    </p>

                                    {/* Points */}
                                    {badge.points > 0 && (
                                        <div className="flex items-center gap-1 text-teal-600 font-semibold">
                                            <Star className="w-4 h-4 fill-teal-600" />
                                            <span>{badge.points} pts</span>
                                        </div>
                                    )}

                                    {/* Unlocked indicator */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/20 pointer-events-none"></div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Available Badges (Locked) */}
            <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-6 h-6 text-slate-600" />
                    Locked Badges
                </h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredAvailable.map((item: any) => {
                        const badge = item.badge as Badge;
                        const styles = RARITY_STYLES[badge.rarity];
                        return (
                            <div
                                key={badge.id}
                                className={`bg-slate-50 border-2 border-slate-200 rounded-2xl p-6 shadow hover:shadow-md transition relative overflow-hidden ${
                                    item.progress > 0 ? 'border-teal-300' : ''
                                }`}
                            >
                                {/* Progress indicator */}
                                {item.progress > 0 && (
                                    <div className="absolute top-0 left-0 right-0 h-1 bg-slate-200">
                                        <div
                                            className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-500"
                                            style={{ width: `${item.progress}%` }}
                                        ></div>
                                    </div>
                                )}

                                {/* Rarity indicator */}
                                <div className={`absolute top-2 right-2 px-2 py-1 bg-slate-200 border border-slate-300 rounded-full`}>
                                    <span className={`text-xs font-bold text-slate-600 uppercase`}>
                                        {badge.rarity}
                                    </span>
                                </div>

                                {/* Badge Icon (grayed out) */}
                                <div className="text-6xl mb-3 opacity-30 grayscale">
                                    {badge.icon}
                                </div>

                                {/* Badge Info */}
                                <h3 className="font-bold text-lg text-slate-700 mb-1">
                                    {badge.name}
                                </h3>
                                <p className="text-sm text-slate-500 mb-3">
                                    {badge.description}
                                </p>

                                {/* Progress */}
                                {item.progress > 0 && (
                                    <div className="mb-2">
                                        <div className="flex justify-between text-xs text-slate-600 mb-1">
                                            <span>Progress</span>
                                            <span className="font-semibold">{item.progress}%</span>
                                        </div>
                                    </div>
                                )}

                                {/* Points */}
                                {badge.points > 0 && (
                                    <div className="flex items-center gap-1 text-slate-400 font-semibold">
                                        <Star className="w-4 h-4" />
                                        <span>{badge.points} pts</span>
                                    </div>
                                )}

                                {/* Locked overlay */}
                                <div className="absolute inset-0 bg-gradient-to-br from-slate-100/50 to-slate-200/50 pointer-events-none"></div>
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
        </div>
    );
}
