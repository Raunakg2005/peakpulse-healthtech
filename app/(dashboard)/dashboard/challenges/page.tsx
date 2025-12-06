'use client';

import { Target, Plus, TrendingUp, Award, Users, Clock, X, Calendar, Trophy, Zap, Star, Search, Filter, Medal, Flame, CheckCircle2, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ChallengesPage() {
    const router = useRouter();
    const [activeChallenges, setActiveChallenges] = useState<any[]>([]);
    const [availableChallenges, setAvailableChallenges] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [joiningId, setJoiningId] = useState<string | null>(null);
    const [selectedChallenge, setSelectedChallenge] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [filterDifficulty, setFilterDifficulty] = useState('all');
    const [showFilters, setShowFilters] = useState(false);
    const [aiRecommendations, setAiRecommendations] = useState<any[]>([]);
    const [recommendationMethod, setRecommendationMethod] = useState<string>('loading');

    // Helper function to format challenge data
    const formatChallenge = (challenge: any) => {
        const difficultyMap: any = { 1: 'Beginner', 2: 'Beginner', 3: 'Intermediate', 4: 'Advanced', 5: 'Advanced' };
        const categoryMap: any = {
            'fitness': 'Fitness',
            'meditation': 'Meditation',
            'nutrition': 'Nutrition',
            'social': 'Social'
        };
        
        // Map duration string to days
        const durationDays: any = {
            'daily': 7,
            'weekly': 7,
            'monthly': 30
        };
        
        return {
            ...challenge,
            difficulty: difficultyMap[challenge.difficulty] || 'Intermediate',
            category: categoryMap[challenge.category] || challenge.category,
            duration: durationDays[challenge.duration] || 7,
            participants: Math.floor(Math.random() * 2000) + 100 // Random for now
        };
    };

    const MOCK_AVAILABLE_CHALLENGES_REMOVE_ME = [
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
            const [activeRes, allRes, recsRes] = await Promise.all([
                fetch('/api/challenges/enroll?status=active'),
                fetch('/api/challenges'),
                fetch('/api/challenges/recommendations')
            ]);

            const activeData = await activeRes.json();
            const allData = await allRes.json();

            let active = [];
            if (activeData.success) {
                // Fetch progress for each active challenge
                const activeChallengesWithProgress = await Promise.all(
                    activeData.challenges.map(async (uc: any) => {
                        try {
                            const progressRes = await fetch(`/api/challenges/progress?challengeId=${uc.challengeId._id || uc.challengeId}`);
                            const progressData = await progressRes.json();
                            return {
                                ...uc,
                                challengeId: formatChallenge(uc.challengeId),
                                progress: progressData.success ? progressData.progress : uc.progress || 0,
                                progressDetails: progressData.details || null
                            };
                        } catch (error) {
                            return {
                                ...uc,
                                challengeId: formatChallenge(uc.challengeId),
                                progress: uc.progress || 0
                            };
                        }
                    })
                );
                active = activeChallengesWithProgress;
                setActiveChallenges(active);
            }

            if (allData.success) {
                // Filter out challenges user is already enrolled in
                const enrolledIds = new Set(active.map((c: any) => c.challengeId?._id || c.challengeId));
                const available = allData.challenges
                    .filter((c: any) => !enrolledIds.has(c._id))
                    .map(formatChallenge);
                setAvailableChallenges(available);
            } else {
                // If no challenges in database, show message
                setAvailableChallenges([]);
            }

            // Process AI recommendations
            if (recsRes.ok) {
                const recsData = await recsRes.json();
                if (recsData.success && recsData.recommendations) {
                    const formattedRecs = recsData.recommendations.map((c: any) => ({
                        ...formatChallenge(c),
                        matchScore: c.matchScore || 85
                    }));
                    setAiRecommendations(formattedRecs);
                    setRecommendationMethod(recsData.method || 'rule-based');
                }
            }
        } catch (error) {
            console.error('Failed to fetch challenges:', error);
            setAvailableChallenges([]);
        } finally {
            setLoading(false);
        }
    };

    const handleJoin = async (challengeId: string) => {
        setJoiningId(challengeId);

        try {
            const response = await fetch('/api/challenges/enroll', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ challengeId }),
            });

            if (response.ok) {
                await fetchData(); // Refresh data from database
            } else {
                const error = await response.json();
                console.error('Failed to join challenge:', error);
                alert(error.error || 'Failed to join challenge');
            }
        } catch (error) {
            console.error('Failed to join challenge:', error);
            alert('Failed to join challenge. Please try again.');
        } finally {
            setJoiningId(null);
        }
    };

    const scrollToBrowse = () => {
        document.getElementById('browse-all')?.scrollIntoView({ behavior: 'smooth' });
    };

    const openChallengeDetails = (challenge: any, isActive: boolean = false) => {
        setSelectedChallenge({ ...challenge, isActive });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setTimeout(() => setSelectedChallenge(null), 300);
    };

    const difficultyColors: any = {
        'beginner': 'bg-green-100 text-green-700 border-green-300',
        'intermediate': 'bg-blue-100 text-blue-700 border-blue-300',
        'advanced': 'bg-orange-100 text-orange-700 border-orange-300',
        'Beginner': 'bg-green-100 text-green-700 border-green-300',
        'Intermediate': 'bg-blue-100 text-blue-700 border-blue-300',
        'Advanced': 'bg-orange-100 text-orange-700 border-orange-300',
    };

    const categoryIcons: any = {
        'Fitness': '💪',
        'Meditation': '🧘',
        'Nutrition': '🥗',
        'Social': '👥',
        'Mental Health': '🧠',
        'Wellness': '✨'
    };

    // Filter challenges based on search and filters
    const filteredChallenges = availableChallenges.filter(challenge => {
        const matchesSearch = challenge.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             challenge.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'all' || challenge.category === filterCategory;
        const matchesDifficulty = filterDifficulty === 'all' || challenge.difficulty.toLowerCase() === filterDifficulty;
        return matchesSearch && matchesCategory && matchesDifficulty;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Hero Header */}
            <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 rounded-2xl p-8 shadow-2xl">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400/20 rounded-full blur-2xl"></div>
                
                <div className="relative z-10">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                                    <Trophy className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-4xl font-extrabold text-white mb-2">Challenges</h1>
                                    <p className="text-purple-100 text-lg">Push your limits, earn rewards, compete with others</p>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={scrollToBrowse}
                            className="hidden md:flex bg-white text-purple-600 px-6 py-3 rounded-xl font-bold hover:bg-purple-50 transition-all duration-300 items-center gap-2 shadow-lg hover:shadow-xl hover:scale-105"
                        >
                            <Plus className="w-5 h-5" />
                            Browse All
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid md:grid-cols-3 gap-6">
                <div className="group relative overflow-hidden bg-gradient-to-br from-teal-500 to-emerald-600 p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 animate-in fade-in-50 slide-in-from-left" style={{ animationDelay: '0ms' }}>
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/0 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-teal-100 uppercase tracking-wider mb-2">Active Challenges</p>
                            <p className="text-4xl font-extrabold text-white mb-1">{activeChallenges.length}</p>
                            <div className="h-1 w-12 bg-white/50 rounded-full group-hover:w-20 transition-all duration-300"></div>
                        </div>
                        <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm group-hover:rotate-12 group-hover:scale-110 transition-transform duration-300">
                            <Target className="w-8 h-8 text-white" />
                        </div>
                    </div>
                </div>

                <div className="group relative overflow-hidden bg-gradient-to-br from-purple-500 to-pink-600 p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 animate-in fade-in-50 slide-in-from-bottom" style={{ animationDelay: '100ms' }}>
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/0 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-purple-100 uppercase tracking-wider mb-2">Completed</p>
                            <p className="text-4xl font-extrabold text-white mb-1">0</p>
                            <div className="h-1 w-12 bg-white/50 rounded-full group-hover:w-20 transition-all duration-300"></div>
                        </div>
                        <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm group-hover:rotate-12 group-hover:scale-110 transition-transform duration-300">
                            <CheckCircle2 className="w-8 h-8 text-white" />
                        </div>
                    </div>
                </div>

                <div className="group relative overflow-hidden bg-gradient-to-br from-amber-500 to-orange-600 p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 animate-in fade-in-50 slide-in-from-right" style={{ animationDelay: '200ms' }}>
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/0 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-amber-100 uppercase tracking-wider mb-2">Success Rate</p>
                            <p className="text-4xl font-extrabold text-white mb-1">100%</p>
                            <div className="h-1 w-12 bg-white/50 rounded-full group-hover:w-20 transition-all duration-300"></div>
                        </div>
                        <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm group-hover:rotate-12 group-hover:scale-110 transition-transform duration-300">
                            <TrendingUp className="w-8 h-8 text-white" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Active Challenges */}
            <div className="bg-white p-6 rounded-2xl border-2 border-slate-200 shadow-lg">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-br from-teal-100 to-emerald-100 p-3 rounded-xl border-2 border-teal-200">
                            <Flame className="w-6 h-6 text-teal-600" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-extrabold text-slate-900">Your Active Challenges</h2>
                            <p className="text-sm text-slate-500">Keep the momentum going!</p>
                        </div>
                    </div>
                    {activeChallenges.length > 0 && (
                        <span className="bg-teal-100 text-teal-700 px-4 py-2 rounded-full text-sm font-bold">
                            {activeChallenges.length} Active
                        </span>
                    )}
                </div>

                {activeChallenges.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="bg-slate-50 p-8 rounded-2xl border-2 border-dashed border-slate-300 inline-block">
                            <Target className="w-16 h-16 text-slate-300 mx-auto mb-4 animate-pulse" />
                            <p className="text-slate-600 font-semibold mb-2">No active challenges yet</p>
                            <p className="text-slate-500 text-sm mb-4">Start your journey today!</p>
                            <button 
                                onClick={scrollToBrowse} 
                                className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:from-teal-700 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                            >
                                Browse Challenges
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {activeChallenges.map((uc, idx) => {
                            const challenge = uc.challengeId;
                            
                            // Use fetched progress data if available, otherwise fallback to time-based calculation
                            const progressPercent = uc.progress || 0;
                            
                            // Calculate days left
                            const totalDays = challenge.duration || 30;
                            const daysPassed = Math.floor((new Date().getTime() - new Date(uc.startedAt).getTime()) / (1000 * 60 * 60 * 24));
                            const daysLeft = Math.max(0, totalDays - daysPassed);
                            
                            // Determine progress text based on challenge type
                            let progressText = '';
                            if (uc.progressDetails) {
                                const details = uc.progressDetails;
                                // For hydration challenges, show days completed (not glasses)
                                if (details.daysTracked !== undefined && details.totalDays !== undefined) {
                                    // Days-based challenge (including hydration)
                                    progressText = `${details.daysTracked}/${details.totalDays} days`;
                                } else if (details.activitiesCount !== undefined && details.targetCount !== undefined) {
                                    // Activity count challenge
                                    progressText = `${details.activitiesCount}/${details.targetCount} activities`;
                                } else if (details.totalGlasses !== undefined && details.targetGlasses !== undefined) {
                                    // Pure glass tracking (if needed)
                                    progressText = `${details.totalGlasses}/${details.targetGlasses} glasses`;
                                }
                            }
                            
                            // Fallback to time-based calculation if no progress details
                            if (!progressText) {
                                progressText = `${daysPassed}/${totalDays} days`;
                            }

                            return (
                                <div
                                    key={uc._id || idx}
                                    onClick={() => openChallengeDetails(challenge, true)}
                                    className="group p-5 bg-gradient-to-r from-slate-50 to-slate-100 border-2 border-slate-200 rounded-xl hover:border-teal-500 hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-[1.02] animate-in fade-in-50 slide-in-from-left"
                                    style={{ animationDelay: `${idx * 50}ms` }}
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-teal-600 transition-colors">{challenge.title}</h3>
                                            <div className="flex items-center gap-3 flex-wrap">
                                                <span className="inline-flex items-center gap-1 text-sm font-semibold text-slate-600">
                                                    <span className="text-lg">{categoryIcons[challenge.category] || '🎯'}</span>
                                                    {challenge.category}
                                                </span>
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${difficultyColors[challenge.difficulty?.toLowerCase()] || 'bg-gray-100'}`}>
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
                                                {progressText}
                                            </span>
                                        </div>
                                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all"
                                                style={{ width: `${Math.min(progressPercent, 100)}%` }}
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
            <div className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 p-6 md:p-8 rounded-2xl shadow-2xl">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-yellow-300/20 rounded-full blur-2xl"></div>
                
                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl shadow-lg border border-white/30">
                                <Zap className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h2 className="text-2xl font-extrabold text-white drop-shadow-lg">AI Recommended For You</h2>
                                    {recommendationMethod === 'ml' && (
                                        <span className="bg-white/30 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full font-bold border border-white/40 animate-pulse">
                                            🤖 ML-Powered
                                        </span>
                                    )}
                                </div>
                                <p className="text-white/90 text-sm drop-shadow">Based on your activity patterns and preferences</p>
                            </div>
                        </div>
                    </div>

                    {recommendationMethod === 'loading' ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="relative">
                                <div className="animate-spin rounded-full h-12 w-12 border-4 border-white/40 border-t-white"></div>
                            </div>
                        </div>
                    ) : aiRecommendations.length === 0 ? (
                        <div className="text-center py-12">
                            <Target className="w-16 h-16 text-white/60 mx-auto mb-4 opacity-50" />
                            <p className="text-white font-semibold drop-shadow">No recommendations available</p>
                            <p className="text-white/80 text-sm drop-shadow">Complete some activities to get personalized suggestions</p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-3 gap-4">
                            {aiRecommendations.map((challenge, idx) => (
                                <div
                                    key={challenge._id || idx}
                                    onClick={() => openChallengeDetails(challenge, false)}
                                    className="group relative bg-white/95 backdrop-blur-sm p-5 rounded-2xl border-2 border-white shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col justify-between cursor-pointer hover:scale-105 animate-in fade-in-50 zoom-in-95"
                                    style={{ animationDelay: `${idx * 100}ms` }}
                                >
                                    {/* Glow Effect */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-100/0 to-orange-100/0 group-hover:from-yellow-100/50 group-hover:to-orange-100/50 rounded-2xl transition-all duration-300"></div>
                                    
                                    <div className="relative z-10">
                                        <div className="flex items-start justify-between mb-3">
                                            <span className={`px-3 py-1.5 rounded-full text-xs font-bold border ${difficultyColors[challenge.difficulty?.toLowerCase()] || 'bg-gray-100 text-gray-800'}`}>
                                                {challenge.difficulty}
                                            </span>
                                            <div className="flex items-center gap-1 bg-gradient-to-r from-amber-500 to-orange-600 px-3 py-1.5 rounded-full shadow-md">
                                                <Star className="w-3 h-3 text-white fill-white" />
                                                <span className="text-white text-xs font-bold">
                                                    {challenge.matchScore || 85}% match
                                                </span>
                                            </div>
                                        </div>

                                        <div className="mb-3">
                                            <span className="text-3xl mb-2 inline-block">{categoryIcons[challenge.category] || '🎯'}</span>
                                            <h3 className="font-bold text-slate-900 text-lg mb-1 group-hover:text-orange-600 transition-colors">{challenge.title}</h3>
                                            <p className="text-slate-600 text-xs font-medium">{challenge.category}</p>
                                        </div>

                                        <div className="space-y-2 mb-4">
                                            <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-200">
                                                <span className="text-slate-600 text-xs flex items-center gap-1">
                                                    <Clock className="w-3 h-3 text-blue-600" />
                                                    Duration:
                                                </span>
                                                <span className="font-bold text-slate-900 text-xs">{challenge.duration} days</span>
                                            </div>
                                            <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-200">
                                                <span className="text-slate-600 text-xs flex items-center gap-1">
                                                    <Users className="w-3 h-3 text-emerald-600" />
                                                    Participants:
                                                </span>
                                                <span className="font-bold text-slate-900 text-xs">{challenge.participants || 0}</span>
                                            </div>
                                            <div className="flex items-center justify-between p-2 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
                                                <span className="text-amber-700 text-xs flex items-center gap-1">
                                                    <Trophy className="w-3 h-3 text-amber-600" />
                                                    Reward:
                                                </span>
                                                <span className="font-bold text-amber-900 text-xs">{challenge.points} pts</span>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleJoin(challenge._id);
                                        }}
                                        disabled={joiningId === challenge._id}
                                        className="relative z-10 w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-4 py-3 rounded-xl font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-wait shadow-lg hover:shadow-xl"
                                    >
                                        {joiningId === challenge._id ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                Joining...
                                            </span>
                                        ) : (
                                            <span className="flex items-center justify-center gap-2">
                                                <Zap className="w-4 h-4" />
                                                Join Challenge
                                            </span>
                                        )}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Search and Filter Section */}
            <div id="browse-all" className="bg-white p-6 rounded-2xl border-2 border-slate-200 shadow-lg">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-br from-indigo-100 to-purple-100 p-3 rounded-xl border-2 border-indigo-200">
                            <Search className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-extrabold text-slate-900">Browse All Challenges</h2>
                            <p className="text-slate-500 text-sm">Explore and filter {availableChallenges.length} available challenges</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl font-semibold text-slate-700 transition-colors"
                    >
                        <Filter className="w-4 h-4" />
                        Filters
                        <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                    </button>
                </div>

                {/* Search Bar */}
                <div className="mb-4">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search challenges by name or description..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        />
                    </div>
                </div>

                {/* Filters */}
                {showFilters && (
                    <div className="grid md:grid-cols-2 gap-4 mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200 animate-in fade-in-50 slide-in-from-top">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Category</label>
                            <select
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                                className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                            >
                                <option value="all">All Categories</option>
                                <option value="Fitness">💪 Fitness</option>
                                <option value="Meditation">🧘 Meditation</option>
                                <option value="Nutrition">🥗 Nutrition</option>
                                <option value="Social">👥 Social</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Difficulty</label>
                            <select
                                value={filterDifficulty}
                                onChange={(e) => setFilterDifficulty(e.target.value)}
                                className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                            >
                                <option value="all">All Difficulties</option>
                                <option value="beginner">🟢 Beginner</option>
                                <option value="intermediate">🔵 Intermediate</option>
                                <option value="advanced">🟠 Advanced</option>
                            </select>
                        </div>
                    </div>
                )}

                {/* Results Info */}
                {searchTerm && (
                    <div className="mb-4 p-3 bg-purple-50 border-2 border-purple-200 rounded-xl">
                        <p className="text-sm text-purple-700 font-semibold">
                            Found {filteredChallenges.length} challenge{filteredChallenges.length !== 1 ? 's' : ''} matching "{searchTerm}"
                        </p>
                    </div>
                )}

                <div className="grid md:grid-cols-3 gap-6">
                    {filteredChallenges.slice(3).map((challenge, idx) => (
                        <div
                            key={challenge._id || idx}
                            onClick={() => openChallengeDetails(challenge, false)}
                            className="group bg-white p-5 rounded-xl border-2 border-slate-200 hover:border-purple-400 hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer hover:scale-105 animate-in fade-in-50 zoom-in-95"
                            style={{ animationDelay: `${idx * 50}ms` }}
                        >
                            <div>
                                <div className="flex items-start justify-between mb-3">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${difficultyColors[challenge.difficulty?.toLowerCase()] || 'bg-gray-100 text-gray-800'}`}>
                                        {challenge.difficulty}
                                    </span>
                                    <span className="text-2xl">{categoryIcons[challenge.category] || '🎯'}</span>
                                </div>

                                <h3 className="font-bold text-slate-900 mb-3 group-hover:text-purple-600 transition-colors text-lg">{challenge.title}</h3>

                                <div className="space-y-2 text-sm mb-4">
                                    <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                                        <span className="text-slate-600 flex items-center gap-1">
                                            <Calendar className="w-4 h-4 text-blue-600" />
                                            Duration:
                                        </span>
                                        <span className="font-bold text-blue-700">{challenge.duration} days</span>
                                    </div>
                                    <div className="flex items-center justify-between p-2 bg-purple-50 rounded-lg">
                                        <span className="text-slate-600 flex items-center gap-1">
                                            <Users className="w-4 h-4 text-purple-600" />
                                            Joined:
                                        </span>
                                        <span className="font-bold text-purple-700">{challenge.participants || 0}</span>
                                    </div>
                                    <div className="flex items-center justify-between p-2 bg-amber-50 rounded-lg">
                                        <span className="text-slate-600 flex items-center gap-1">
                                            <Medal className="w-4 h-4 text-amber-600" />
                                            Reward:
                                        </span>
                                        <span className="font-bold text-amber-700">{challenge.points} pts</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleJoin(challenge._id);
                                }}
                                disabled={joiningId === challenge._id}
                                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-4 py-3 rounded-xl font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-wait shadow-md hover:shadow-lg group-hover:scale-105"
                            >
                                {joiningId === challenge._id ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Joining...
                                    </span>
                                ) : (
                                    <span className="flex items-center justify-center gap-2">
                                        <Plus className="w-4 h-4" />
                                        Join Challenge
                                    </span>
                                )}
                            </button>
                        </div>
                    ))}
                    {filteredChallenges.length === 0 && (
                        <div className="col-span-3 text-center py-12">
                            <div className="bg-slate-50 p-8 rounded-2xl border-2 border-dashed border-slate-300 inline-block">
                                <Search className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                                <p className="text-slate-600 font-semibold mb-2">No challenges found</p>
                                <p className="text-slate-500 text-sm">Try adjusting your filters or search terms</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Challenge Details Modal */}
            {isModalOpen && selectedChallenge && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
                    onClick={closeModal}
                >
                    <div
                        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="sticky top-0 bg-gradient-to-br from-purple-600 to-indigo-600 text-white p-6 rounded-t-2xl">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                            selectedChallenge.difficulty?.toLowerCase() === 'beginner' 
                                                ? 'bg-green-400 text-green-900' 
                                                : selectedChallenge.difficulty?.toLowerCase() === 'intermediate'
                                                ? 'bg-blue-400 text-blue-900'
                                                : 'bg-orange-400 text-orange-900'
                                        }`}>
                                            {selectedChallenge.difficulty}
                                        </span>
                                        {selectedChallenge.isActive && (
                                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-400 text-emerald-900 animate-pulse">
                                                Active
                                            </span>
                                        )}
                                    </div>
                                    <h2 className="text-2xl font-extrabold mb-2">{selectedChallenge.title}</h2>
                                    <p className="text-purple-100 text-sm">{selectedChallenge.category}</p>
                                </div>
                                <button
                                    onClick={closeModal}
                                    className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-6">
                            {/* Key Stats */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                                    <Calendar className="w-6 h-6 text-blue-600 mb-2" />
                                    <p className="text-xs text-blue-700 font-semibold mb-1">Duration</p>
                                    <p className="text-2xl font-bold text-blue-900">{selectedChallenge.duration}</p>
                                    <p className="text-xs text-blue-600">days</p>
                                </div>
                                <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-4 rounded-xl border border-amber-200">
                                    <Trophy className="w-6 h-6 text-amber-600 mb-2" />
                                    <p className="text-xs text-amber-700 font-semibold mb-1">Reward</p>
                                    <p className="text-2xl font-bold text-amber-900">{selectedChallenge.points}</p>
                                    <p className="text-xs text-amber-600">points</p>
                                </div>
                                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 rounded-xl border border-emerald-200">
                                    <Users className="w-6 h-6 text-emerald-600 mb-2" />
                                    <p className="text-xs text-emerald-700 font-semibold mb-1">Participants</p>
                                    <p className="text-2xl font-bold text-emerald-900">{selectedChallenge.participants || '1.2k'}</p>
                                    <p className="text-xs text-emerald-600">active</p>
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                                    <Star className="w-5 h-5 text-purple-600" />
                                    About This Challenge
                                </h3>
                                <p className="text-slate-700 leading-relaxed">
                                    {selectedChallenge.description || `Join ${selectedChallenge.title} and push your limits! This ${selectedChallenge.duration}-day challenge is designed for ${selectedChallenge.difficulty.toLowerCase()} level participants. Complete daily tasks, track your progress, and earn ${selectedChallenge.points} points upon completion.`}
                                </p>
                            </div>

                            {/* Benefits */}
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                                    <Zap className="w-5 h-5 text-purple-600" />
                                    What You'll Gain
                                </h3>
                                <ul className="space-y-2">
                                    <li className="flex items-start gap-3">
                                        <div className="bg-purple-100 p-1.5 rounded-full mt-0.5">
                                            <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                                        </div>
                                        <span className="text-slate-700">Build consistent healthy habits</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="bg-purple-100 p-1.5 rounded-full mt-0.5">
                                            <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                                        </div>
                                        <span className="text-slate-700">Track progress with detailed analytics</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="bg-purple-100 p-1.5 rounded-full mt-0.5">
                                            <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                                        </div>
                                        <span className="text-slate-700">Compete with community members</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="bg-purple-100 p-1.5 rounded-full mt-0.5">
                                            <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                                        </div>
                                        <span className="text-slate-700">Earn points and unlock achievements</span>
                                    </li>
                                </ul>
                            </div>

                            {/* Action Button */}
                            {!selectedChallenge.isActive && (
                                <button
                                    onClick={() => {
                                        handleJoin(selectedChallenge._id);
                                        closeModal();
                                    }}
                                    disabled={joiningId === selectedChallenge._id}
                                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-4 rounded-xl font-bold text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-wait shadow-lg hover:shadow-xl hover:scale-105"
                                >
                                    {joiningId === selectedChallenge._id ? 'Joining...' : 'Join Challenge'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
