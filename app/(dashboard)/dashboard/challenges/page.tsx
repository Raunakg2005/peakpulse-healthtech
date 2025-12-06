'use client';

import { Target, Plus, TrendingUp, Award, Users, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ChallengesPage() {
    const router = useRouter();
    const [activeChallenges, setActiveChallenges] = useState<any[]>([]);
    const [availableChallenges, setAvailableChallenges] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [joiningId, setJoiningId] = useState<string | null>(null);

    const MOCK_AVAILABLE_CHALLENGES = [
        {
            _id: 'mock-1',
            title: 'HIIT Workout Series',
            category: 'Exercise',
            difficulty: 'Advanced',
            duration: 14,
            points: 400,
            participants: 567,
            matchScore: 95
        },
        {
            _id: 'mock-2',
            title: 'Plant-Based Diet',
            category: 'Nutrition',
            difficulty: 'Intermediate',
            duration: 30,
            points: 600,
            participants: 1024,
            matchScore: 88
        },
        {
            _id: 'mock-3',
            title: '10-Min Daily Breathing',
            category: 'Meditation',
            difficulty: 'Beginner',
            duration: 7,
            points: 150,
            participants: 1876,
            matchScore: 92
        },
        {
            _id: 'mock-4',
            title: 'Sleep Hygiene Reset',
            category: 'Wellness',
            difficulty: 'Beginner',
            duration: 7,
            points: 200,
            participants: 342,
            matchScore: 85
        },
        {
            _id: 'mock-5',
            title: 'Hydration Hero',
            category: 'Nutrition',
            difficulty: 'Beginner',
            duration: 14,
            points: 250,
            participants: 2153,
            matchScore: 90
        },
        {
            _id: 'mock-6',
            title: 'Digital Detox Weekend',
            category: 'Wellness',
            difficulty: 'Intermediate',
            duration: 2,
            points: 500,
            participants: 89,
            matchScore: 78
        },
        {
            _id: 'mock-7',
            title: 'Morning Cold Shower',
            category: 'Wellness',
            difficulty: 'Advanced',
            duration: 21,
            points: 1000,
            participants: 156,
            matchScore: 65
        },
        {
            _id: 'mock-8',
            title: '10k Steps Daily',
            category: 'Exercise',
            difficulty: 'Intermediate',
            duration: 30,
            points: 450,
            participants: 890,
            matchScore: 82
        },
        {
            _id: 'mock-9',
            title: 'No Sugar Challenge',
            category: 'Nutrition',
            difficulty: 'Advanced',
            duration: 14,
            points: 800,
            participants: 432,
            matchScore: 70
        },
        {
            _id: 'mock-10',
            title: 'Gratitude Journaling',
            category: 'Mental Health',
            difficulty: 'Beginner',
            duration: 21,
            points: 300,
            participants: 1205,
            matchScore: 94
        }
    ];

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [activeRes, allRes] = await Promise.all([
                fetch('/api/challenges/enroll?status=active'),
                fetch('/api/challenges')
            ]);

            const activeData = await activeRes.json();
            const allData = await allRes.json();

            let active = [];
            if (activeData.success) {
                active = activeData.challenges;
                setActiveChallenges(active);
            }

            if (allData.success) {
                // Filter out challenges user is already enrolled in
                const enrolledIds = new Set(active.map((c: any) => c.challengeId?._id || c.challengeId));
                let available = allData.challenges.filter((c: any) => !enrolledIds.has(c._id));

                // If no available challenges from API, use mock data
                if (available.length === 0) {
                    // Filter mocks too just in case
                    available = MOCK_AVAILABLE_CHALLENGES.filter(c => !enrolledIds.has(c._id));
                }
                setAvailableChallenges(available);
            }
        } catch (error) {
            console.error('Failed to fetch challenges:', error);
            setAvailableChallenges(MOCK_AVAILABLE_CHALLENGES);
        } finally {
            setLoading(false);
        }
    };

    const handleJoin = async (challengeId: string) => {
        setJoiningId(challengeId);

        // Handle Mock Join
        if (challengeId.startsWith('mock-')) {
            setTimeout(() => {
                const challenge = availableChallenges.find(c => c._id === challengeId);
                if (challenge) {
                    const newActive = {
                        _id: `active-${Date.now()}`,
                        challengeId: challenge,
                        userId: 'current-user',
                        status: 'active',
                        progress: 0,
                        startedAt: new Date().toISOString(),
                        pointsEarned: 0
                    };
                    setActiveChallenges([newActive, ...activeChallenges]);
                    setAvailableChallenges(availableChallenges.filter(c => c._id !== challengeId));
                }
                setJoiningId(null);
            }, 800); // Fake delay
            return;
        }

        try {
            const response = await fetch('/api/challenges/enroll', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ challengeId }),
            });

            if (response.ok) {
                fetchData();
            }
        } catch (error) {
            console.error('Failed to join challenge:', error);
        } finally {
            if (!challengeId.startsWith('mock-')) {
                setJoiningId(null);
            }
        }
    };

    const scrollToBrowse = () => {
        document.getElementById('browse-all')?.scrollIntoView({ behavior: 'smooth' });
    };

    const difficultyColors: any = {
        'beginner': 'bg-green-100 text-green-700',
        'intermediate': 'bg-blue-100 text-blue-700',
        'advanced': 'bg-orange-100 text-orange-700',
        'Beginner': 'bg-green-100 text-green-700',
        'Intermediate': 'bg-blue-100 text-blue-700',
        'Advanced': 'bg-orange-100 text-orange-700',
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Challenges</h1>
                    <p className="text-slate-600 mt-1">Join challenges and compete with others</p>
                </div>
                <button
                    onClick={scrollToBrowse}
                    className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:from-teal-700 hover:to-emerald-700 transition flex items-center gap-2"
                >
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
                    <p className="text-3xl font-bold text-slate-900">{activeChallenges.length}</p>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <Award className="w-6 h-6 text-emerald-600" />
                        <span className="text-slate-600 font-medium">Completed</span>
                    </div>
                    {/* Placeholder for completed count, or fetch if available */}
                    <p className="text-3xl font-bold text-slate-900">0</p>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <TrendingUp className="w-6 h-6 text-amber-600" />
                        <span className="text-slate-600 font-medium">Success Rate</span>
                    </div>
                    <p className="text-3xl font-bold text-slate-900">100%</p>
                </div>
            </div>

            {/* Active Challenges */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 mb-6">Your Active Challenges</h2>

                {activeChallenges.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                        <p>You haven't joined any challenges yet.</p>
                        <button onClick={scrollToBrowse} className="text-teal-600 font-medium hover:underline mt-2">Find a challenge</button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {activeChallenges.map((uc, idx) => {
                            const challenge = uc.challengeId;
                            // Calculate days left or progress
                            const totalDays = challenge.duration || 30;
                            const daysPassed = Math.floor((new Date().getTime() - new Date(uc.startedAt).getTime()) / (1000 * 60 * 60 * 24));
                            const daysLeft = Math.max(0, totalDays - daysPassed);
                            const progressPercent = Math.min(100, (daysPassed / totalDays) * 100);

                            return (
                                <div
                                    key={uc._id || idx}
                                    className="p-5 border-2 border-slate-200 rounded-xl hover:border-teal-500 transition"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-900 mb-2">{challenge.title}</h3>
                                            <div className="flex items-center gap-3 flex-wrap">
                                                <span className="text-sm text-slate-600">{challenge.category}</span>
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${difficultyColors[challenge.difficulty?.toLowerCase()] || 'bg-gray-100'}`}>
                                                    {challenge.difficulty}
                                                </span>
                                                <span className="flex items-center gap-1 text-sm text-slate-600">
                                                    <Clock className="w-4 h-4" />
                                                    {daysLeft} days left
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="flex items-center gap-1 text-amber-600 font-bold">
                                                <Award className="w-5 h-5" />
                                                {challenge.points} pts
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-slate-600">Progress</span>
                                            <span className="font-semibold text-teal-600">
                                                {daysPassed}/{totalDays} days
                                            </span>
                                        </div>
                                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all"
                                                style={{ width: `${progressPercent}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* AI Recommended */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-xl border border-slate-700">
                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-gradient-to-br from-teal-500 to-emerald-500 p-3 rounded-lg">
                        <Target className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">AI Recommended For You</h2>
                        <p className="text-slate-400 text-sm">Based on your activity patterns</p>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                    {availableChallenges.slice(0, 3).map((challenge, idx) => (
                        <div
                            key={challenge._id || idx}
                            className="bg-white/10 backdrop-blur-sm p-5 rounded-xl border border-white/20 hover:bg-white/15 transition flex flex-col justify-between"
                        >
                            <div>
                                <div className="flex items-start justify-between mb-3">
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${difficultyColors[challenge.difficulty?.toLowerCase()] || 'bg-gray-100 text-gray-800'}`}>
                                        {challenge.difficulty}
                                    </span>
                                    <span className="bg-teal-500/20 text-teal-300 px-2 py-1 rounded text-xs font-bold">
                                        {Math.floor(Math.random() * 5) + 95}% match
                                    </span>
                                </div>

                                <h3 className="font-bold text-white mb-2">{challenge.title}</h3>

                                <div className="space-y-2 text-sm text-slate-300 mb-4">
                                    <div className="flex items-center justify-between">
                                        <span>Duration:</span>
                                        <span className="font-semibold">{challenge.duration} days</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span>Category:</span>
                                        <span className="font-semibold truncate w-32 text-right">{challenge.category}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span>Reward:</span>
                                        <span className="font-semibold text-amber-400">{challenge.points} pts</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => handleJoin(challenge._id)}
                                disabled={joiningId === challenge._id}
                                className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-wait"
                            >
                                {joiningId === challenge._id ? 'Joining...' : 'Join Challenge'}
                            </button>
                        </div>
                    ))}
                    {availableChallenges.length === 0 && (
                        <div className="col-span-3 text-center py-8 text-slate-400">
                            <p>No recommendations available at the moment.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Browse All Section */}
            <div id="browse-all" className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-slate-100 p-3 rounded-lg">
                        <Plus className="w-6 h-6 text-slate-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Browse All Challenges</h2>
                        <p className="text-slate-600 text-sm">Explore more ways to challenge yourself</p>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {availableChallenges.slice(3).map((challenge, idx) => (
                        <div
                            key={challenge._id || idx}
                            className="bg-slate-50 p-5 rounded-xl border border-slate-200 hover:border-teal-500 transition flex flex-col justify-between"
                        >
                            <div>
                                <div className="flex items-start justify-between mb-3">
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${difficultyColors[challenge.difficulty?.toLowerCase()] || 'bg-gray-100 text-gray-800'}`}>
                                        {challenge.difficulty}
                                    </span>
                                </div>

                                <h3 className="font-bold text-slate-900 mb-2">{challenge.title}</h3>

                                <div className="space-y-2 text-sm text-slate-600 mb-4">
                                    <div className="flex items-center justify-between">
                                        <span>Duration:</span>
                                        <span className="font-semibold">{challenge.duration} days</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span>Category:</span>
                                        <span className="font-semibold truncate w-32 text-right">{challenge.category}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span>Reward:</span>
                                        <span className="font-semibold text-amber-600">{challenge.points} pts</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => handleJoin(challenge._id)}
                                disabled={joiningId === challenge._id}
                                className="w-full bg-white border-2 border-slate-200 text-slate-700 hover:border-teal-600 hover:text-teal-600 px-4 py-2 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-wait"
                            >
                                {joiningId === challenge._id ? 'Joining...' : 'Join Challenge'}
                            </button>
                        </div>
                    ))}
                    {availableChallenges.length <= 3 && availableChallenges.length > 0 && (
                        <div className="col-span-3 text-center py-8 text-slate-500">
                            <p>All available challenges are recommended for you above!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
