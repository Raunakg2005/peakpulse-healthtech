'use client';

import { useState, useEffect } from 'react';
import { Activity, Plus, Calendar, TrendingUp, X, Flame, Target, Zap, ChevronRight, Award, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import CalorieTracker from '@/components/CalorieTracker';
import WaterTracker from '@/components/WaterTracker';

export default function HabitsPage() {
    const router = useRouter();
    const [showCalorieTracker, setShowCalorieTracker] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [recentActivities, setRecentActivities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);

    const fetchActivities = async () => {
        try {
            // Fetch from calories API (where CalorieTracker logs activities)
            const caloriesResponse = await fetch('/api/calories');
            if (caloriesResponse.ok) {
                const caloriesData = await caloriesResponse.json();
                // Activities from calories endpoint
                const activities = caloriesData.activities || [];
                setRecentActivities(activities);
            }
        } catch (error) {
            console.error('Failed to fetch activities:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchActivities();
    }, []);

    const handleActivityLogged = () => {
        setShowCalorieTracker(false);
        fetchActivities(); // Refresh activities
    };

    // Map activity names to emojis
    const getActivityEmoji = (activityName: string) => {
        const emojiMap: { [key: string]: string } = {
            'Running': '🏃',
            'Cycling': '🚴',
            'Swimming': '🏊',
            'Walking': '🚶',
            'Yoga': '🧘',
            'Weight Training': '🏋️',
            'Dancing': '💃',
            'Hiking': '⛰️',
            'HIIT': '⚡',
            'Pilates': '🤸'
        };
        return emojiMap[activityName] || '💪';
    };
    const habitCategories = [
        {
            name: 'Exercise',
            icon: Activity,
            color: 'teal',
            streak: 12,
            weeklyGoal: 5,
            completed: 3,
            activities: [
                { name: 'Morning Run', time: '30 min', calories: 250, date: 'Today' },
                { name: 'Yoga', time: '45 min', calories: 150, date: 'Yesterday' },
                { name: 'Weight Training', time: '60 min', calories: 350, date: '2 days ago' },
            ]
        },
        {
            name: 'Meditation',
            icon: Activity,
            color: 'emerald',
            streak: 23,
            weeklyGoal: 7,
            completed: 5,
            activities: [
                { name: 'Morning Meditation', time: '15 min', calories: 0, date: 'Today' },
                { name: 'Breathing Exercise', time: '10 min', calories: 0, date: 'Today' },
                { name: 'Evening Mindfulness', time: '20 min', calories: 0, date: 'Yesterday' },
            ]
        },
        {
            name: 'Nutrition',
            icon: Activity,
            color: 'amber',
            streak: 8,
            weeklyGoal: 7,
            completed: 6,
            activities: [
                { name: 'Healthy Breakfast', time: 'Oatmeal + Fruits', calories: 350, date: 'Today' },
                { name: 'Protein Lunch', time: 'Chicken + Veggies', calories: 450, date: 'Today' },
                { name: 'Light Dinner', time: 'Salad + Fish', calories: 400, date: 'Yesterday' },
            ]
        }
    ];

    const colorClasses = {
        teal: {
            bg: 'bg-teal-50',
            text: 'text-teal-600',
            border: 'border-teal-200',
            button: 'bg-teal-600 hover:bg-teal-700',
            badge: 'bg-teal-100 text-teal-700',
        },
        emerald: {
            bg: 'bg-emerald-50',
            text: 'text-emerald-600',
            border: 'border-emerald-200',
            button: 'bg-emerald-600 hover:bg-emerald-700',
            badge: 'bg-emerald-100 text-emerald-700',
        },
        amber: {
            bg: 'bg-amber-50',
            text: 'text-amber-600',
            border: 'border-amber-200',
            button: 'bg-amber-600 hover:bg-amber-700',
            badge: 'bg-amber-100 text-amber-700',
        },
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header with Gradient */}
            <div className="relative overflow-hidden bg-gradient-to-br from-teal-600 via-emerald-600 to-teal-700 rounded-2xl p-6 md:p-8 shadow-xl">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl"></div>
                
                <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl border border-white/30">
                            <Activity className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-white mb-1">Habit Tracking</h1>
                            <p className="text-white/90">Build consistency, achieve greatness 🚀</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => setShowCalorieTracker(!showCalorieTracker)}
                        className="bg-white text-teal-600 px-6 py-3 rounded-xl font-semibold hover:bg-white/90 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-105 group w-full md:w-auto justify-center"
                    >
                        <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                        Log Activity
                    </button>
                </div>
            </div>

            {/* Calorie Tracker Modal with Animation */}
            {showCalorieTracker && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative shadow-2xl animate-in zoom-in-95 duration-300">
                        <button
                            onClick={() => setShowCalorieTracker(false)}
                            className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-lg transition-all duration-200 z-10 hover:rotate-90"
                        >
                            <X className="w-5 h-5 text-slate-600" />
                        </button>
                        <CalorieTracker onActivityLogged={handleActivityLogged} />
                    </div>
                </div>
            )}

            {/* Category Details Modal */}
            {selectedCategory && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-slate-900">{selectedCategory} Details</h2>
                            <button
                                onClick={() => setSelectedCategory(null)}
                                className="p-2 hover:bg-slate-100 rounded-lg transition"
                            >
                                <X className="w-5 h-5 text-slate-600" />
                            </button>
                        </div>
                        
                        {habitCategories
                            .filter(cat => cat.name === selectedCategory)
                            .map(category => {
                                const colors = colorClasses[category.color as keyof typeof colorClasses];
                                return (
                                    <div key={category.name} className="space-y-6">
                                        {/* Stats */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className={`${colors.bg} p-4 rounded-lg border ${colors.border}`}>
                                                <p className="text-sm text-slate-600 mb-1">Current Streak</p>
                                                <p className={`text-3xl font-bold ${colors.text}`}>{category.streak} days 🔥</p>
                                            </div>
                                            <div className={`${colors.bg} p-4 rounded-lg border ${colors.border}`}>
                                                <p className="text-sm text-slate-600 mb-1">Weekly Progress</p>
                                                <p className={`text-3xl font-bold ${colors.text}`}>{category.completed}/{category.weeklyGoal}</p>
                                            </div>
                                        </div>

                                        {/* Activities List */}
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-900 mb-4">Recent Activities</h3>
                                            <div className="space-y-3">
                                                {category.activities.map((activity, idx) => (
                                                    <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition">
                                                        <div>
                                                            <p className="font-semibold text-slate-900">{activity.name}</p>
                                                            <div className="flex items-center gap-2 text-sm text-slate-600 mt-1">
                                                                <span>{activity.time}</span>
                                                                {activity.calories > 0 && (
                                                                    <>
                                                                        <span>•</span>
                                                                        <span>{activity.calories} cal</span>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <span className="text-sm text-slate-500">{activity.date}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                </div>
            )}

            {/* Overview Cards with Enhanced Design */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {habitCategories.map((category, idx) => {
                    const Icon = category.icon;
                    const colors = colorClasses[category.color as keyof typeof colorClasses];
                    const progress = (category.completed / category.weeklyGoal) * 100;

                    return (
                        <div
                            key={category.name}
                            onMouseEnter={() => setHoveredCard(category.name)}
                            onMouseLeave={() => setHoveredCard(null)}
                            className="group bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer animate-in fade-in-50 slide-in-from-bottom-4"
                            style={{ animationDelay: `${idx * 100}ms` }}
                        >
                            {/* Header with Streak Badge */}
                            <div className="flex items-center justify-between mb-4">
                                <div className={`${colors.bg} p-3 rounded-xl group-hover:scale-110 transition-transform duration-300 relative`}>
                                    <Icon className={`w-6 h-6 ${colors.text} transition-transform duration-300 ${hoveredCard === category.name ? 'rotate-12' : ''}`} />
                                    <div className={`absolute -top-1 -right-1 w-3 h-3 ${colors.button} rounded-full animate-pulse`}></div>
                                </div>
                                <div className={`${colors.badge} px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 group-hover:scale-105 transition-transform`}>
                                    <Flame className="w-3.5 h-3.5" />
                                    {category.streak} days
                                </div>
                            </div>

                            {/* Category Name */}
                            <h3 className="text-xl font-bold text-slate-900 mb-1 group-hover:text-teal-600 transition-colors">
                                {category.name}
                            </h3>
                            <p className="text-sm text-slate-500 mb-4">
                                {progress >= 100 ? '🎉 Goal achieved!' : `${Math.round(progress)}% complete`}
                            </p>

                            {/* Progress Section */}
                            <div className="space-y-2 mb-5">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-600 font-medium">Weekly Goal</span>
                                    <span className={`font-bold ${colors.text} flex items-center gap-1`}>
                                        <Target className="w-3.5 h-3.5" />
                                        {category.completed}/{category.weeklyGoal}
                                    </span>
                                </div>
                                <div className="relative h-3 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full ${colors.button} rounded-full transition-all duration-1000 ease-out relative overflow-hidden`}
                                        style={{ width: `${Math.min(progress, 100)}%` }}
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                                    </div>
                                </div>
                            </div>

                            {/* Action Button */}
                            <button 
                                onClick={() => setSelectedCategory(category.name)}
                                className={`w-full ${colors.button} text-white px-4 py-2.5 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg group/btn flex items-center justify-center gap-2`}
                            >
                                View Details
                                <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* Water Tracker Section */}
            <WaterTracker onUpdate={fetchActivities} />

            {/* Recent Activities with Enhanced Design */}
            <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-shadow duration-300">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-br from-teal-500 to-emerald-500 p-2.5 rounded-xl">
                            <Zap className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl md:text-2xl font-bold text-slate-900">Recent Activities</h2>
                            <p className="text-sm text-slate-500">Your latest achievements</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => router.push('/dashboard/calendar')}
                        className="text-teal-600 hover:text-teal-700 font-semibold flex items-center gap-2 hover:gap-3 transition-all duration-300 group px-4 py-2 rounded-xl hover:bg-teal-50"
                    >
                        <Calendar className="w-5 h-5" />
                        View Calendar
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center h-32">
                        <div className="relative">
                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200"></div>
                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-600 border-t-transparent absolute inset-0"></div>
                        </div>
                    </div>
                ) : recentActivities.length > 0 ? (
                    <div className="space-y-3">
                        {recentActivities.slice(0, 6).map((activity: any, idx: number) => {
                            const activityName = activity.name || activity.type || 'Activity';
                            const emoji = getActivityEmoji(activityName);
                            const colors = colorClasses.teal;

                            return (
                                <div
                                    key={activity._id || idx}
                                    className="group flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border border-slate-200 rounded-xl hover:border-teal-300 hover:bg-gradient-to-r hover:from-teal-50/50 hover:to-emerald-50/50 transition-all duration-300 hover:shadow-md animate-in fade-in-50 slide-in-from-left"
                                    style={{ animationDelay: `${idx * 50}ms` }}
                                >
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="relative bg-gradient-to-br from-teal-50 to-emerald-50 p-3 rounded-xl group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 border-2 border-teal-200">
                                            <span className="text-2xl" role="img" aria-label={activityName}>{emoji}</span>
                                            <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-slate-900 group-hover:text-teal-600 transition-colors truncate">
                                                {activityName}
                                            </h3>
                                            <div className="flex flex-wrap items-center gap-2 mt-1">
                                                {activity.duration && (
                                                    <span className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                                                        <Clock className="w-3 h-3" />
                                                        {activity.duration} min
                                                    </span>
                                                )}
                                                {activity.calories > 0 && (
                                                    <span className="inline-flex items-center gap-1 text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-medium">
                                                        <Flame className="w-3 h-3" />
                                                        {activity.calories} cal
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 sm:text-right">
                                        <span className="text-sm text-slate-500 font-medium">
                                            {new Date(activity.timestamp || activity.completedAt || activity.createdAt).toLocaleDateString('en-US', { 
                                                month: 'short', 
                                                day: 'numeric' 
                                            })}
                                        </span>
                                        <Award className="w-4 h-4 text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-48 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border-2 border-dashed border-slate-300">
                        <div className="text-center p-6">
                            <div className="bg-white p-4 rounded-full inline-block mb-4 shadow-lg">
                                <Activity className="w-12 h-12 text-slate-400 animate-bounce" />
                            </div>
                            <p className="text-slate-600 font-semibold mb-1">No activities yet</p>
                            <p className="text-slate-400 text-sm">Start logging to see your progress!</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Weekly Insights with Enhanced Design */}
            <div className="grid sm:grid-cols-2 gap-4 md:gap-6">
                <div className="group relative overflow-hidden bg-gradient-to-br from-teal-50 via-emerald-50 to-teal-50 p-6 md:p-8 rounded-2xl border border-teal-200 hover:border-teal-300 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-teal-200/30 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-teal-100 p-3 rounded-xl group-hover:scale-110 transition-transform duration-300">
                                <TrendingUp className="w-6 h-6 text-teal-600" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">Weekly Progress</h3>
                        </div>
                        <p className="text-4xl md:text-5xl font-bold text-teal-600 mb-2 group-hover:scale-110 transition-transform duration-300">64%</p>
                        <p className="text-slate-600 font-medium">You're crushing it! Keep the momentum going 💪</p>
                    </div>
                </div>

                <div className="group relative overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50 p-6 md:p-8 rounded-2xl border border-amber-200 hover:border-amber-300 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/30 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-amber-100 p-3 rounded-xl group-hover:scale-110 transition-transform duration-300">
                                <Flame className="w-6 h-6 text-amber-600 group-hover:animate-pulse" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">Longest Streak</h3>
                        </div>
                        <p className="text-4xl md:text-5xl font-bold text-amber-600 mb-2 group-hover:scale-110 transition-transform duration-300">23 days</p>
                        <p className="text-slate-600 font-medium">Absolutely on fire! 🔥 Keep the streak alive</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
