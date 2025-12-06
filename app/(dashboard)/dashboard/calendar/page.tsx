'use client';

import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Activity, Flame, TrendingUp, Target, Zap } from 'lucide-react';

export default function CalendarPage() {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [activities, setActivities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [hoveredDate, setHoveredDate] = useState<string | null>(null);

    const fetchActivities = async () => {
        try {
            // Fetch all activities from both endpoints
            const [caloriesRes, activitiesRes] = await Promise.all([
                fetch('/api/calories').catch(() => null),
                fetch('/api/activities').catch(() => null)
            ]);

            const allActivities = [];

            if (caloriesRes?.ok) {
                const data = await caloriesRes.json();
                if (data.activities) {
                    allActivities.push(...data.activities);
                }
            }

            if (activitiesRes?.ok) {
                const data = await activitiesRes.json();
                if (data.activities) {
                    allActivities.push(...data.activities);
                }
            }

            setActivities(allActivities);
        } catch (error) {
            console.error('Failed to fetch activities:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchActivities();
    }, []);

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        return { daysInMonth, startingDayOfWeek, year, month };
    };

    const getActivitiesForDate = (date: Date) => {
        return activities.filter(activity => {
            const activityDate = new Date(activity.timestamp || activity.completedAt || activity.createdAt);
            return activityDate.toDateString() === date.toDateString();
        });
    };

    const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentMonth);

    const previousMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
    };

    const nextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
    };

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const selectedDateActivities = getActivitiesForDate(selectedDate);

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

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header with Gradient */}
            <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-700 rounded-2xl p-6 md:p-8 shadow-xl">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl"></div>
                
                <div className="relative z-10 flex items-center gap-4">
                    <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl border border-white/30">
                        <CalendarIcon className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-white mb-1">Activity Calendar</h1>
                        <p className="text-white/90">Your journey to success, one day at a time 📅</p>
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-4 md:gap-6">
                {/* Calendar */}
                <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
                    {/* Month Navigation */}
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
                        <div className="flex items-center gap-3">
                            <div className="bg-gradient-to-br from-purple-500 to-indigo-500 p-2 rounded-lg">
                                <CalendarIcon className="w-5 h-5 text-white" />
                            </div>
                            <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                                {monthNames[month]} {year}
                            </h2>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={previousMonth}
                                className="p-2 hover:bg-purple-50 rounded-xl transition-all duration-300 hover:scale-110 group"
                            >
                                <ChevronLeft className="w-5 h-5 text-slate-600 group-hover:text-purple-600" />
                            </button>
                            <button
                                onClick={nextMonth}
                                className="p-2 hover:bg-purple-50 rounded-xl transition-all duration-300 hover:scale-110 group"
                            >
                                <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-purple-600" />
                            </button>
                        </div>
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-2 md:gap-3">
                        {/* Day Names */}
                        {dayNames.map(day => (
                            <div key={day} className="text-center font-bold text-slate-500 text-xs md:text-sm py-2 md:py-3">
                                {day}
                            </div>
                        ))}

                        {/* Empty cells for days before month starts */}
                        {Array.from({ length: startingDayOfWeek }).map((_, idx) => (
                            <div key={`empty-${idx}`} className="aspect-square" />
                        ))}

                        {/* Calendar days */}
                        {Array.from({ length: daysInMonth }).map((_, idx) => {
                            const day = idx + 1;
                            const date = new Date(year, month, day);
                            const dateString = date.toDateString();
                            const isSelected = dateString === selectedDate.toDateString();
                            const isToday = dateString === new Date().toDateString();
                            const dayActivities = getActivitiesForDate(date);
                            const hasActivities = dayActivities.length > 0;
                            const isHovered = hoveredDate === dateString;

                            return (
                                <button
                                    key={day}
                                    onClick={() => setSelectedDate(date)}
                                    onMouseEnter={() => setHoveredDate(dateString)}
                                    onMouseLeave={() => setHoveredDate(null)}
                                    className={`group aspect-square p-2 rounded-xl transition-all duration-300 relative ${
                                        isSelected
                                            ? 'bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-lg scale-105'
                                            : isToday
                                            ? 'bg-purple-50 text-purple-600 border-2 border-purple-600 font-bold'
                                            : hasActivities
                                            ? 'bg-gradient-to-br from-emerald-50 to-teal-50 text-slate-900 hover:from-emerald-100 hover:to-teal-100 hover:shadow-md hover:scale-105 border border-emerald-200'
                                            : 'hover:bg-slate-50 text-slate-700 hover:scale-105 hover:shadow-md'
                                    }`}
                                >
                                    <span className={`font-semibold text-sm md:text-base ${isSelected || isToday ? 'text-current' : ''}`}>
                                        {day}
                                    </span>
                                    {hasActivities && (
                                        <>
                                            <div className={`absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-0.5`}>
                                                {dayActivities.slice(0, 3).map((_, i) => (
                                                    <div
                                                        key={i}
                                                        className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                                                            isSelected ? 'bg-white' : 'bg-emerald-600'
                                                        } ${isHovered ? 'scale-125' : ''}`}
                                                    />
                                                ))}
                                            </div>
                                            {isHovered && !isSelected && (
                                                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded-lg whitespace-nowrap z-10">
                                                    {dayActivities.length} {dayActivities.length === 1 ? 'activity' : 'activities'}
                                                </div>
                                            )}
                                        </>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Selected Day Activities */}
                <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200">
                        <div className="bg-gradient-to-br from-purple-500 to-indigo-500 p-3 rounded-xl relative">
                            <CalendarIcon className="w-6 h-6 text-white" />
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                        </div>
                        <div>
                            <h3 className="font-bold text-xl text-slate-900">
                                {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </h3>
                            <p className="text-sm text-slate-600 font-medium">
                                {selectedDate.toLocaleDateString('en-US', { weekday: 'long' })}
                            </p>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="relative">
                                <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200"></div>
                                <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent absolute inset-0"></div>
                            </div>
                        </div>
                    ) : selectedDateActivities.length > 0 ? (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 mb-4">
                                <Zap className="w-4 h-4 text-emerald-600" />
                                <p className="text-sm font-bold text-slate-600">
                                    {selectedDateActivities.length} {selectedDateActivities.length === 1 ? 'Activity' : 'Activities'}
                                </p>
                            </div>
                            {selectedDateActivities.map((activity, idx) => {
                                const activityName = activity.name || activity.type || 'Activity';
                                const emoji = getActivityEmoji(activityName);
                                return (
                                    <div
                                        key={activity._id || idx}
                                        className="group p-4 bg-gradient-to-r from-purple-50 via-indigo-50 to-purple-50 rounded-xl border border-purple-200 hover:border-purple-300 transition-all duration-300 hover:shadow-md hover:scale-105 animate-in fade-in-50 slide-in-from-right"
                                        style={{ animationDelay: `${idx * 50}ms` }}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="bg-white p-2.5 rounded-xl border-2 border-purple-200 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                                                <span className="text-2xl" role="img" aria-label={activityName}>{emoji}</span>
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-bold text-slate-900 group-hover:text-purple-600 transition-colors">
                                                    {activityName}
                                                </h4>
                                                <div className="flex flex-wrap gap-2 mt-2 text-xs">
                                                    {activity.duration && (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full font-semibold">
                                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                            {activity.duration} min
                                                        </span>
                                                    )}
                                                    {activity.calories > 0 && (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-100 text-orange-700 rounded-full font-semibold">
                                                            <Flame className="w-3 h-3" />
                                                            {activity.calories} cal
                                                        </span>
                                                    )}
                                                    {activity.points && (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 text-amber-700 rounded-full font-semibold">
                                                            <Target className="w-3 h-3" />
                                                            +{activity.points} pts
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="bg-slate-50 p-6 rounded-2xl border-2 border-dashed border-slate-300 inline-block">
                                <Activity className="w-12 h-12 text-slate-300 mx-auto mb-3 animate-bounce" />
                                <p className="text-slate-600 font-semibold mb-1">No activities</p>
                                <p className="text-slate-400 text-sm">Start your journey today!</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Activity Summary */}
            <div className="grid md:grid-cols-3 gap-6">
                <div className="group relative overflow-hidden p-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 animate-in fade-in-50 slide-in-from-bottom" style={{ animationDelay: '0ms' }}>
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/0 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-blue-100 uppercase tracking-wider mb-2">Total Activities</p>
                            <p className="text-4xl font-extrabold text-white mb-1">{activities.length}</p>
                            <div className="h-1 w-12 bg-white/50 rounded-full group-hover:w-20 transition-all duration-300"></div>
                        </div>
                        <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm group-hover:rotate-12 group-hover:scale-110 transition-transform duration-300">
                            <Activity className="w-8 h-8 text-white" />
                        </div>
                    </div>
                </div>

                <div className="group relative overflow-hidden p-6 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 animate-in fade-in-50 slide-in-from-bottom" style={{ animationDelay: '100ms' }}>
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/0 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-orange-100 uppercase tracking-wider mb-2">This Month</p>
                            <p className="text-4xl font-extrabold text-white mb-1">
                                {activities.filter(a => {
                                    const date = new Date(a.timestamp || a.completedAt || a.createdAt);
                                    return date.getMonth() === month && date.getFullYear() === year;
                                }).length}
                            </p>
                            <div className="h-1 w-12 bg-white/50 rounded-full group-hover:w-20 transition-all duration-300"></div>
                        </div>
                        <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm group-hover:rotate-12 group-hover:scale-110 transition-transform duration-300">
                            <Flame className="w-8 h-8 text-white" />
                        </div>
                    </div>
                </div>

                <div className="group relative overflow-hidden p-6 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 animate-in fade-in-50 slide-in-from-bottom" style={{ animationDelay: '200ms' }}>
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/0 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-emerald-100 uppercase tracking-wider mb-2">Active Days</p>
                            <p className="text-4xl font-extrabold text-white mb-1">
                                {new Set(activities.map(a => {
                                    const date = new Date(a.timestamp || a.completedAt || a.createdAt);
                                    return date.toDateString();
                                })).size}
                            </p>
                            <div className="h-1 w-12 bg-white/50 rounded-full group-hover:w-20 transition-all duration-300"></div>
                        </div>
                        <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm group-hover:rotate-12 group-hover:scale-110 transition-transform duration-300">
                            <TrendingUp className="w-8 h-8 text-white" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
