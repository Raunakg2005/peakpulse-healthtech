import { Target, Plus, TrendingUp, Award, Users, Clock } from 'lucide-react';

export default function ChallengesPage() {
    const activeChallenges = [
        {
            title: '30-Day Yoga Challenge',
            category: 'Exercise',
            difficulty: 'Intermediate',
            progress: 18,
            total: 30,
            participants: 1243,
            reward: 500,
            daysLeft: 12,
            color: 'teal'
        },
        {
            title: 'Mindful Eating Week',
            category: 'Nutrition',
            difficulty: 'Beginner',
            progress: 5,
            total: 7,
            participants: 892,
            reward: 200,
            daysLeft: 2,
            color: 'emerald'
        },
        {
            title: 'Morning Meditation',
            category: 'Meditation',
            difficulty: 'Beginner',
            progress: 14,
            total: 21,
            participants: 2156,
            reward: 300,
            daysLeft: 7,
            color: 'amber'
        },
    ];

    const recommendedChallenges = [
        {
            title: 'HIIT Workout Series',
            category: 'Exercise',
            difficulty: 'Advanced',
            duration: '14 days',
            participants: 567,
            reward: 400,
            matchScore: 95,
            color: 'teal'
        },
        {
            title: 'Plant-Based Diet',
            category: 'Nutrition',
            difficulty: 'Intermediate',
            duration: '30 days',
            participants: 1024,
            reward: 600,
            matchScore: 88,
            color: 'emerald'
        },
        {
            title: '10-Min Daily Breathing',
            category: 'Meditation',
            difficulty: 'Beginner',
            duration: '7 days',
            participants: 1876,
            reward: 150,
            matchScore: 92,
            color: 'amber'
        },
    ];

    const difficultyColors = {
        'Beginner': 'bg-green-100 text-green-700',
        'Intermediate': 'bg-blue-100 text-blue-700',
        'Advanced': 'bg-orange-100 text-orange-700',
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Challenges</h1>
                    <p className="text-slate-600 mt-1">Join challenges and compete with others</p>
                </div>
                <button className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:from-teal-700 hover:to-emerald-700 transition flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Browse All
                </button>
            </div>

            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <Target className="w-6 h-6 text-teal-600" />
                        <span className="text-slate-600 font-medium">Active Challenges</span>
                    </div>
                    <p className="text-3xl font-bold text-slate-900">3</p>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <Award className="w-6 h-6 text-emerald-600" />
                        <span className="text-slate-600 font-medium">Completed</span>
                    </div>
                    <p className="text-3xl font-bold text-slate-900">12</p>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <TrendingUp className="w-6 h-6 text-amber-600" />
                        <span className="text-slate-600 font-medium">Success Rate</span>
                    </div>
                    <p className="text-3xl font-bold text-slate-900">86%</p>
                </div>
            </div>

            {/* Active Challenges */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 mb-6">Your Active Challenges</h2>

                <div className="space-y-4">
                    {activeChallenges.map((challenge, idx) => (
                        <div
                            key={idx}
                            className="p-5 border-2 border-slate-200 rounded-xl hover:border-teal-500 transition"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 mb-2">{challenge.title}</h3>
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <span className="text-sm text-slate-600">{challenge.category}</span>
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${difficultyColors[challenge.difficulty as keyof typeof difficultyColors]}`}>
                                            {challenge.difficulty}
                                        </span>
                                        <span className="flex items-center gap-1 text-sm text-slate-600">
                                            <Users className="w-4 h-4" />
                                            {challenge.participants.toLocaleString()}
                                        </span>
                                        <span className="flex items-center gap-1 text-sm text-slate-600">
                                            <Clock className="w-4 h-4" />
                                            {challenge.daysLeft} days left
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="flex items-center gap-1 text-amber-600 font-bold">
                                        <Award className="w-5 h-5" />
                                        {challenge.reward} pts
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-600">Progress</span>
                                    <span className="font-semibold text-teal-600">
                                        {challenge.progress}/{challenge.total} days
                                    </span>
                                </div>
                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all"
                                        style={{ width: `${(challenge.progress / challenge.total) * 100}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ML Recommended */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-xl border border-slate-700">
                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-gradient-to-br from-teal-500 to-emerald-500 p-3 rounded-lg">
                        <Target className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">AI Recommended For You</h2>
                        <p className="text-slate-400 text-sm">Based on your activity patterns (70.3% accurate)</p>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                    {recommendedChallenges.map((challenge, idx) => (
                        <div
                            key={idx}
                            className="bg-white/10 backdrop-blur-sm p-5 rounded-xl border border-white/20 hover:bg-white/15 transition"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${difficultyColors[challenge.difficulty as keyof typeof difficultyColors]}`}>
                                    {challenge.difficulty}
                                </span>
                                <span className="bg-teal-500/20 text-teal-300 px-2 py-1 rounded text-xs font-bold">
                                    {challenge.matchScore}% match
                                </span>
                            </div>

                            <h3 className="font-bold text-white mb-2">{challenge.title}</h3>

                            <div className="space-y-2 text-sm text-slate-300 mb-4">
                                <div className="flex items-center justify-between">
                                    <span>Duration:</span>
                                    <span className="font-semibold">{challenge.duration}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>Participants:</span>
                                    <span className="font-semibold">{challenge.participants}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>Reward:</span>
                                    <span className="font-semibold text-amber-400">{challenge.reward} pts</span>
                                </div>
                            </div>

                            <button className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition">
                                Join Challenge
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
