'use client';

import { useState, useEffect } from 'react';
import AchievementNotification from './AchievementNotification';

interface CalorieData {
    totalBurned: number;
    bmr: number;
    activityCalories: number;
    calorieGoal: number;
    activities: Array<{
        name: string;
        duration: number;
        calories: number;
        timestamp: Date;
    }>;
}

interface Notification {
    type: 'badge' | 'levelUp' | 'points';
    badge?: any;
    levelUp?: { oldLevel: number; newLevel: number };
    points?: number;
}

export default function CalorieTracker() {
    const [calorieData, setCalorieData] = useState<CalorieData | null>(null);
    const [loading, setLoading] = useState(true);
    const [showAddActivity, setShowAddActivity] = useState(false);
    const [newActivity, setNewActivity] = useState({
        name: '',
        duration: '',
        intensity: 'moderate'
    });
    const [notifications, setNotifications] = useState<Notification[]>([]);

    useEffect(() => {
        fetchCalorieData();
    }, []);

    const fetchCalorieData = async () => {
        try {
            const response = await fetch('/api/calories');
            const data = await response.json();
            setCalorieData(data);
        } catch (error) {
            console.error('Failed to fetch calorie data:', error);
        } finally {
            setLoading(false);
        }
    };

    const addActivity = async () => {
        try {
            const response = await fetch('/api/calories/activity', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newActivity)
            });

            if (response.ok) {
                const result = await response.json();

                // Handle gamification notifications
                if (result.gamification) {
                    const newNotifications: Notification[] = [];

                    // Add points notification
                    if (result.gamification.pointsEarned) {
                        newNotifications.push({
                            type: 'points',
                            points: result.gamification.pointsEarned
                        });
                    }

                    // Add level up notification
                    if (result.gamification.leveledUp) {
                        newNotifications.push({
                            type: 'levelUp',
                            levelUp: {
                                oldLevel: result.gamification.oldLevel,
                                newLevel: result.gamification.newLevel
                            }
                        });
                    }

                    // Add badge notifications
                    if (result.gamification.newBadges && result.gamification.newBadges.length > 0) {
                        result.gamification.newBadges.forEach((badge: any) => {
                            newNotifications.push({
                                type: 'badge',
                                badge
                            });
                        });
                    }

                    setNotifications(newNotifications);
                }

                setNewActivity({ name: '', duration: '', intensity: 'moderate' });
                setShowAddActivity(false);
                fetchCalorieData();
            } else {
                const errorData = await response.json();
                alert(`Failed to log activity: ${errorData.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Failed to add activity:', error);
            alert('Failed to connect to server. Please try again.');
        }
    };

    const removeNotification = (index: number) => {
        setNotifications(prev => prev.filter((_, i) => i !== index));
    };

    if (loading) {
        return (
            <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-6 bg-slate-200 rounded w-1/3"></div>
                    <div className="h-32 bg-slate-200 rounded"></div>
                </div>
            </div>
        );
    }

    if (!calorieData) return null;

    const progressPercentage = Math.min((calorieData.totalBurned / calorieData.calorieGoal) * 100, 100);

    const activityTypes = [
        { name: 'Running', icon: '🏃', met: 9.8 },
        { name: 'Cycling', icon: '🚴', met: 7.5 },
        { name: 'Swimming', icon: '🏊', met: 8.0 },
        { name: 'Walking', icon: '🚶', met: 3.8 },
        { name: 'Yoga', icon: '🧘', met: 2.5 },
        { name: 'Weight Training', icon: '🏋️', met: 6.0 },
        { name: 'Dancing', icon: '💃', met: 5.0 },
        { name: 'Hiking', icon: '⛰️', met: 6.5 },
        { name: 'HIIT', icon: '⚡', met: 12.0 },
        { name: 'Pilates', icon: '🤸', met: 3.0 }
    ];

    return (
        <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-slate-900">🔥 Calorie Tracker</h3>
                <button
                    onClick={() => setShowAddActivity(!showAddActivity)}
                    className="px-4 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-lg hover:from-teal-700 hover:to-emerald-700 transition font-medium"
                >
                    + Log Activity
                </button>
            </div>

            {/* Main Calorie Display */}
            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6 mb-6 border border-orange-200">
                <div className="grid md:grid-cols-3 gap-6">
                    <div>
                        <p className="text-sm text-slate-600 mb-1">Resting Burn (BMR)</p>
                        <p className="text-3xl font-bold text-slate-500">{calorieData.bmr}</p>
                        <p className="text-xs text-slate-500">kcal/day (base)</p>
                    </div>
                    <div>
                        <p className="text-sm text-slate-600 mb-1">Active Burn</p>
                        <p className="text-3xl font-bold text-orange-600">+{calorieData.activityCalories}</p>
                        <p className="text-xs text-slate-500">kcal from exercise</p>
                    </div>
                    <div>
                        <p className="text-sm text-slate-600 mb-1">Total Daily Burn</p>
                        <p className="text-3xl font-bold text-red-600">{calorieData.totalBurned}</p>
                        <p className="text-xs text-slate-500">Resting + Active</p>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-6">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-slate-700">Daily Goal Progress</span>
                        <span className="text-sm font-bold text-slate-900">
                            {progressPercentage.toFixed(0)}%
                        </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all duration-500"
                            style={{ width: `${progressPercentage}%` }}
                        ></div>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                        Goal: {calorieData.calorieGoal} kcal/day
                    </p>
                </div>
            </div>

            {/* Add Activity Form */}
            {showAddActivity && (
                <div className="bg-slate-50 rounded-xl p-6 mb-6 border border-slate-200">
                    <h4 className="font-bold text-slate-900 mb-4">Log New Activity</h4>

                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Activity Type
                            </label>
                            <select
                                value={newActivity.name}
                                onChange={(e) => setNewActivity({ ...newActivity, name: e.target.value })}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                            >
                                <option value="">Select activity</option>
                                {activityTypes.map((activity) => (
                                    <option key={activity.name} value={activity.name}>
                                        {activity.icon} {activity.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Duration (minutes)
                            </label>
                            <input
                                type="number"
                                value={newActivity.duration}
                                onChange={(e) => setNewActivity({ ...newActivity, duration: e.target.value })}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                                placeholder="30"
                            />
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Intensity Level
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            {['light', 'moderate', 'vigorous'].map((intensity) => (
                                <button
                                    key={intensity}
                                    onClick={() => setNewActivity({ ...newActivity, intensity })}
                                    className={`px-4 py-2 rounded-lg border-2 capitalize transition ${newActivity.intensity === intensity
                                        ? 'border-teal-600 bg-teal-50 text-teal-700 font-medium'
                                        : 'border-slate-200 hover:border-slate-300'
                                        }`}
                                >
                                    {intensity}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Estimated Calories */}
                    {newActivity.name && newActivity.duration && (
                        <div className="bg-teal-50 border border-teal-200 rounded-lg p-3 mb-4">
                            <p className="text-sm text-slate-700">
                                Estimated calories: <span className="font-bold text-teal-700">
                                    ~{(() => {
                                        const activity = activityTypes.find(a => a.name === newActivity.name);
                                        if (!activity) return 0;
                                        const intensityMultiplier = newActivity.intensity === 'light' ? 0.7 :
                                            newActivity.intensity === 'vigorous' ? 1.3 : 1.0;
                                        // Assuming average weight of 70kg for estimation
                                        return Math.round(activity.met * 70 * (parseInt(newActivity.duration) / 60) * intensityMultiplier);
                                    })()}
                                </span> kcal
                            </p>
                        </div>
                    )}

                    <div className="flex gap-3">
                        <button
                            onClick={addActivity}
                            disabled={!newActivity.name || !newActivity.duration}
                            className="flex-1 px-4 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-lg hover:from-teal-700 hover:to-emerald-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Log Activity
                        </button>
                        <button
                            onClick={() => setShowAddActivity(false)}
                            className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Recent Activities */}
            <div>
                <h4 className="font-bold text-slate-900 mb-3">Today's Activities</h4>
                {calorieData.activities.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                        <p className="text-4xl mb-2">🏃‍♂️</p>
                        <p>No activities logged yet today</p>
                        <p className="text-sm">Start tracking your workouts!</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {calorieData.activities.map((activity, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200 hover:shadow-md transition"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="text-2xl">
                                        {activityTypes.find(a => a.name === activity.name)?.icon || '🏃'}
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-900">{activity.name}</p>
                                        <p className="text-sm text-slate-600">
                                            {activity.duration} minutes • {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-bold text-orange-600">{activity.calories}</p>
                                    <p className="text-xs text-slate-500">kcal</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Achievement Notifications */}
            {notifications.map((notification, index) => (
                <AchievementNotification
                    key={index}
                    notification={notification}
                    onClose={() => removeNotification(index)}
                />
            ))}
        </div>
    );
}
