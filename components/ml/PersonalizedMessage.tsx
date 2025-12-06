'use client';

import { useState, useEffect } from 'react';
import { mlClient, type MotivationMessage, type UserProfile } from '@/lib/ml-client';

interface PersonalizedMessageProps {
    userProfile: UserProfile;
}

export default function PersonalizedMessage({ userProfile }: PersonalizedMessageProps) {
    const [message, setMessage] = useState<MotivationMessage | null>(null);
    const [loading, setLoading] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Auto-generate message on mount
        generateNewMessage();
    }, [userProfile.user_id]);

    const generateNewMessage = async () => {
        try {
            setLoading(true);
            const msg = await mlClient.generateMotivation(userProfile);
            setMessage(msg);
            setIsVisible(true);

            // Animation effect
            setTimeout(() => setIsVisible(false), 100);
            setTimeout(() => setIsVisible(true), 150);
        } catch (err) {
            console.error('Error generating motivation:', err);
        } finally {
            setLoading(false);
        }
    };

    const getToneColor = (tone: string) => {
        switch (tone.toLowerCase()) {
            case 'celebratory':
                return 'from-purple-500 to-pink-500';
            case 'challenging':
                return 'from-orange-500 to-red-500';
            case 'supportive':
                return 'from-blue-500 to-cyan-500';
            case 'encouraging':
                return 'from-green-500 to-emerald-500';
            default:
                return 'from-gray-500 to-slate-500';
        }
    };

    const getToneIcon = (tone: string) => {
        switch (tone.toLowerCase()) {
            case 'celebratory':
                return '🎉';
            case 'challenging':
                return '💪';
            case 'supportive':
                return '🤗';
            case 'encouraging':
                return '🌟';
            default:
                return '💬';
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-3"></div>
                <div className="h-16 bg-gray-100 rounded"></div>
            </div>
        );
    }

    if (!message) return null;

    return (
        <div className={`transition-all duration-500 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
            <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-xl shadow-xl p-6 border border-purple-100">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">{getToneIcon(message.tone)}</span>
                        <div>
                            <h3 className="font-bold text-gray-900">Your Daily Motivation</h3>
                            <p className="text-xs text-gray-600 capitalize">
                                {message.tone} • {(message.personalization_score * 100).toFixed(0)}% personalized
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={generateNewMessage}
                        disabled={loading}
                        className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 disabled:opacity-50"
                    >
                        ✨ New Message
                    </button>
                </div>

                <div className={`relative bg-gradient-to-r ${getToneColor(message.tone)} p-6 rounded-lg shadow-lg`}>
                    <div className="absolute top-0 left-0 text-6xl opacity-20 text-white leading-none">
                        "
                    </div>
                    <p className="relative text-white text-lg font-medium leading-relaxed text-center italic px-4">
                        {message.message}
                    </p>
                    <div className="absolute bottom-2 right-4 text-6xl opacity-20 text-white leading-none">
                        "
                    </div>
                </div>

                {/* Personalization Score Indicator */}
                <div className="mt-4">
                    <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-600">AI Personalization Level</span>
                        <span className="font-semibold text-purple-600">
                            {(message.personalization_score * 100).toFixed(0)}%
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                            className="h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-1000"
                            style={{ width: `${message.personalization_score * 100}%` }}
                        ></div>
                    </div>
                </div>

                {/* Share buttons */}
                <div className="mt-4 flex gap-2 justify-center">
                    <button className="px-4 py-2 bg-white text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition flex items-center gap-2 shadow">
                        <span>📱</span>
                        Share
                    </button>
                    <button className="px-4 py-2 bg-white text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition flex items-center gap-2 shadow">
                        <span>❤️</span>
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
}
