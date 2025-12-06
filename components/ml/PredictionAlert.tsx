'use client';

import { useState, useEffect } from 'react';
import { mlClient, type DropoutPrediction, type StreakPrediction, type UserProfile } from '@/lib/ml-client';

interface PredictionAlertProps {
    userProfile: UserProfile;
}

export default function PredictionAlert({ userProfile }: PredictionAlertProps) {
    const [dropoutPred, setDropoutPred] = useState<DropoutPrediction | null>(null);
    const [streakPred, setStreakPred] = useState<StreakPrediction | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPredictions();
    }, [userProfile.user_id]);

    const fetchPredictions = async () => {
        try {
            setLoading(true);
            const [dropout, streak] = await Promise.all([
                mlClient.predictDropout(userProfile),
                mlClient.predictStreak(userProfile),
            ]);
            setDropoutPred(dropout);
            setStreakPred(streak);
        } catch (err) {
            console.error('Error fetching predictions:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-20 bg-gray-100 rounded"></div>
            </div>
        );
    }

    const getRiskColor = (level: string) => {
        switch (level) {
            case 'high':
                return 'bg-red-50 border-red-200 text-red-800';
            case 'medium':
                return 'bg-yellow-50 border-yellow-200 text-yellow-800';
            case 'low':
                return 'bg-green-50 border-green-200 text-green-800';
            default:
                return 'bg-gray-50 border-gray-200 text-gray-800';
        }
    };

    const getRiskIcon = (level: string) => {
        switch (level) {
            case 'high':
                return '⚠️';
            case 'medium':
                return '⚡';
            case 'low':
                return '✅';
            default:
                return 'ℹ️';
        }
    };

    const showDropoutAlert = dropoutPred && dropoutPred.risk_level !== 'low';
    const showStreakAlert = streakPred && streakPred.streak_break_probability > 0.5;

    if (!showDropoutAlert && !showStreakAlert) {
        return (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl shadow-md p-6 border-2 border-green-200">
                <div className="flex items-center gap-3">
                    <span className="text-4xl">🎉</span>
                    <div>
                        <h3 className="font-bold text-green-900 text-lg">You're Doing Great!</h3>
                        <p className="text-green-700 text-sm">Keep up the excellent work. Your engagement is strong!</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {showDropoutAlert && dropoutPred && (
                <div className={`rounded-xl shadow-lg p-6 border-2 ${getRiskColor(dropoutPred.risk_level)}`}>
                    <div className="flex items-start gap-3 mb-4">
                        <span className="text-3xl">{getRiskIcon(dropoutPred.risk_level)}</span>
                        <div className="flex-1">
                            <h3 className="font-bold text-lg mb-1">
                                Engagement Alert - {dropoutPred.risk_level.toUpperCase()} Risk
                            </h3>
                            <p className="text-sm opacity-90">
                                Based on your recent activity, we detected you might need some support.
                            </p>
                        </div>
                    </div>

                    <div className="bg-white bg-opacity-50 rounded-lg p-4 mb-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Dropout Probability</span>
                            <span className="font-bold text-lg">
                                {(dropoutPred.dropout_probability * 100).toFixed(0)}%
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                            <div
                                className={`h-3 rounded-full transition-all ${dropoutPred.risk_level === 'high'
                                        ? 'bg-red-500'
                                        : dropoutPred.risk_level === 'medium'
                                            ? 'bg-yellow-500'
                                            : 'bg-green-500'
                                    }`}
                                style={{ width: `${dropoutPred.dropout_probability * 100}%` }}
                            ></div>
                        </div>
                        <p className="text-xs mt-2 opacity-75">
                            Estimated time: {dropoutPred.days_until_predicted_dropout} days
                        </p>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                            <span>💡</span>
                            Recommended Actions
                        </h4>
                        <ul className="space-y-2">
                            {dropoutPred.recommended_interventions.map((intervention, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm">
                                    <span className="mt-0.5">•</span>
                                    <span>{intervention}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}

            {showStreakAlert && streakPred && (
                <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl shadow-lg p-6 border-2 border-orange-200">
                    <div className="flex items-start gap-3 mb-4">
                        <span className="text-3xl">🔥</span>
                        <div className="flex-1">
                            <h3 className="font-bold text-lg text-orange-900 mb-1">Streak Alert!</h3>
                            <p className="text-sm text-orange-700">
                                Your {streakPred.current_streak}-day streak might be at risk.
                            </p>
                        </div>
                    </div>

                    <div className="bg-white bg-opacity-50 rounded-lg p-4 mb-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-orange-900">Streak Break Risk</span>
                            <span className="font-bold text-lg text-orange-900">
                                {(streakPred.streak_break_probability * 100).toFixed(0)}%
                            </span>
                        </div>
                        <div className="w-full bg-orange-200 rounded-full h-3 overflow-hidden">
                            <div
                                className="h-3 bg-gradient-to-r from-orange-400 to-red-500 rounded-full transition-all"
                                style={{ width: `${streakPred.streak_break_probability * 100}%` }}
                            ></div>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2 text-orange-900">
                            <span>🎯</span>
                            Keep Your Streak Alive
                        </h4>
                        <ul className="space-y-2">
                            {streakPred.recommended_actions.map((action, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm text-orange-800">
                                    <span className="mt-0.5">•</span>
                                    <span>{action}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
}
