'use client';

import { useState, useEffect } from 'react';
import { mlClient, type ChallengeRecommendation, type UserProfile } from '@/lib/ml-client';

interface RecommendationCardProps {
    userProfile: UserProfile;
}

export default function RecommendationCard({ userProfile }: RecommendationCardProps) {
    const [recommendations, setRecommendations] = useState<ChallengeRecommendation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchRecommendations();
    }, [userProfile.user_id]);

    const fetchRecommendations = async () => {
        try {
            setLoading(true);
            setError(null);
            const recs = await mlClient.getRecommendations(userProfile);
            setRecommendations(recs);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load recommendations');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-20 bg-gray-100 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                <h3 className="text-red-800 font-semibold mb-2">⚠️ Error Loading Recommendations</h3>
                <p className="text-red-600 text-sm">{error}</p>
                <button
                    onClick={fetchRecommendations}
                    className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                    Retry
                </button>
            </div>
        );
    }

    const getDifficultyColor = (level: number) => {
        if (level <= 2) return 'bg-green-100 text-green-800';
        if (level <= 3) return 'bg-yellow-100 text-yellow-800';
        return 'bg-red-100 text-red-800';
    };

    const getConfidenceColor = (score: number) => {
        if (score >= 0.8) return 'text-green-600';
        if (score >= 0.6) return 'text-yellow-600';
        return 'text-gray-600';
    };

    return (
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                        <span className="mr-2">🎯</span>
                        Recommended For You
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">AI-powered challenge suggestions</p>
                </div>
                <button
                    onClick={fetchRecommendations}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all transform hover:scale-105"
                >
                    🔄 Refresh
                </button>
            </div>

            <div className="space-y-4">
                {recommendations.map((rec, index) => (
                    <div
                        key={rec.challenge_id}
                        className="bg-white rounded-lg p-5 shadow-md hover:shadow-xl transition-all transform hover:scale-[1.02] cursor-pointer border-2 border-transparent hover:border-purple-300"
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-2xl">{index === 0 ? '🌟' : index === 1 ? '⭐' : '✨'}</span>
                                    <h3 className="text-lg font-bold text-gray-900">{rec.challenge_name}</h3>
                                </div>
                                <p className="text-sm text-gray-600 mb-3 italic">{rec.reasoning}</p>
                            </div>
                            <div className={`ml-4 px-3 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(rec.difficulty_level)}`}>
                                Level {rec.difficulty_level}/5
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1">
                                    <span>⏱️</span>
                                    <span className="text-gray-700">{rec.estimated_completion_time} min</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <span>🎲</span>
                                    <span className={`font-semibold ${getConfidenceColor(rec.confidence_score)}`}>
                                        {(rec.confidence_score * 100).toFixed(0)}% match
                                    </span>
                                </div>
                            </div>
                            <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all font-medium">
                                Start Challenge
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {recommendations.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                    <p className="text-4xl mb-3">🔍</p>
                    <p>No recommendations available right now.</p>
                    <p className="text-sm mt-2">Complete more activities to get personalized suggestions!</p>
                </div>
            )}
        </div>
    );
}
