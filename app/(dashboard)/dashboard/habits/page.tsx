import { Activity, Plus, Calendar, TrendingUp } from 'lucide-react';

export default function HabitsPage() {
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
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Habit Tracking</h1>
                    <p className="text-slate-600 mt-1">Track your daily activities and build healthy habits</p>
                </div>
                <button className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:from-teal-700 hover:to-emerald-700 transition flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Log Activity
                </button>
            </div>

            {/* Overview Cards */}
            <div className="grid md:grid-cols-3 gap-6">
                {habitCategories.map((category) => {
                    const Icon = category.icon;
                    const colors = colorClasses[category.color as keyof typeof colorClasses];

                    return (
                        <div
                            key={category.name}
                            className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className={`${colors.bg} p-3 rounded-lg`}>
                                    <Icon className={`w-6 h-6 ${colors.text}`} />
                                </div>
                                <span className={`${colors.badge} px-3 py-1 rounded-full text-sm font-semibold`}>
                                    {category.streak} day streak 🔥
                                </span>
                            </div>

                            <h3 className="text-xl font-bold text-slate-900 mb-2">{category.name}</h3>

                            <div className="space-y-2 mb-4">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-600">Weekly Progress</span>
                                    <span className={`font-semibold ${colors.text}`}>
                                        {category.completed}/{category.weeklyGoal}
                                    </span>
                                </div>
                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full ${colors.button} transition-all`}
                                        style={{ width: `${(category.completed / category.weeklyGoal) * 100}%` }}
                                    />
                                </div>
                            </div>

                            <button className={`w-full ${colors.button} text-white px-4 py-2 rounded-lg font-medium transition`}>
                                View Details
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* Recent Activities */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-slate-900">Recent Activities</h2>
                    <button className="text-teal-600 hover:text-teal-700 font-medium flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        View Calendar
                    </button>
                </div>

                <div className="space-y-4">
                    {habitCategories.flatMap(category =>
                        category.activities.slice(0, 2).map((activity, idx) => {
                            const Icon = category.icon;
                            const colors = colorClasses[category.color as keyof typeof colorClasses];

                            return (
                                <div
                                    key={`${category.name}-${idx}`}
                                    className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`${colors.bg} p-3 rounded-lg`}>
                                            <Icon className={`w-5 h-5 ${colors.text}`} />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-slate-900">{activity.name}</h3>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className="text-sm text-slate-600">{category.name}</span>
                                                <span className="text-sm text-slate-400">•</span>
                                                <span className="text-sm text-slate-600">{activity.time}</span>
                                                {activity.calories > 0 && (
                                                    <>
                                                        <span className="text-sm text-slate-400">•</span>
                                                        <span className="text-sm text-slate-600">{activity.calories} cal</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-sm text-slate-500">{activity.date}</span>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Weekly Insights */}
            <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-teal-50 to-emerald-50 p-6 rounded-xl border border-teal-200">
                    <div className="flex items-center gap-3 mb-4">
                        <TrendingUp className="w-6 h-6 text-teal-600" />
                        <h3 className="text-lg font-bold text-slate-900">This Week's Progress</h3>
                    </div>
                    <p className="text-3xl font-bold text-teal-600 mb-2">64%</p>
                    <p className="text-slate-600">You're doing great! Keep it up to reach your weekly goals.</p>
                </div>

                <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-xl border border-amber-200">
                    <div className="flex items-center gap-3 mb-4">
                        <Activity className="w-6 h-6 text-amber-600" />
                        <h3 className="text-lg font-bold text-slate-900">Longest Streak</h3>
                    </div>
                    <p className="text-3xl font-bold text-amber-600 mb-2">23 days</p>
                    <p className="text-slate-600">Your meditation streak is on fire! 🔥</p>
                </div>
            </div>
        </div>
    );
}
