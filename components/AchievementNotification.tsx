'use client';

import { useEffect, useState } from 'react';
import { Trophy, Zap, X } from 'lucide-react';
import { RARITY_STYLES } from '@/lib/gamification';

interface AchievementNotificationProps {
    notification: {
        type: 'badge' | 'levelUp' | 'points';
        badge?: {
            id: string;
            name: string;
            description: string;
            icon: string;
            rarity: 'common' | 'rare' | 'epic' | 'legendary';
            points: number;
        };
        levelUp?: {
            oldLevel: number;
            newLevel: number;
        };
        points?: number;
    };
    onClose: () => void;
}

export default function AchievementNotification({ notification, onClose }: AchievementNotificationProps) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        // Animate in
        setTimeout(() => setVisible(true), 100);
        
        // Auto-close after 5 seconds
        const timer = setTimeout(() => {
            setVisible(false);
            setTimeout(onClose, 300);
        }, 5000);

        return () => clearTimeout(timer);
    }, [onClose]);

    const handleClose = () => {
        setVisible(false);
        setTimeout(onClose, 300);
    };

    if (notification.type === 'badge' && notification.badge) {
        const badge = notification.badge;
        const styles = RARITY_STYLES[badge.rarity];
        
        return (
            <div
                className={`fixed top-4 right-4 z-50 transition-all duration-300 ${
                    visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
                }`}
            >
                <div className={`${styles.bg} ${styles.border} border-2 rounded-2xl p-6 shadow-2xl max-w-sm backdrop-blur-sm`}>
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <Trophy className={`w-5 h-5 ${styles.text}`} />
                            <span className={`font-bold ${styles.text} uppercase text-sm`}>
                                New Badge Unlocked!
                            </span>
                        </div>
                        <button
                            onClick={handleClose}
                            className="text-slate-400 hover:text-slate-600 transition"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-5xl animate-bounce-slow">
                            {badge.icon}
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-lg text-slate-900 mb-1">
                                {badge.name}
                            </h3>
                            <p className="text-sm text-slate-600 mb-2">
                                {badge.description}
                            </p>
                            <div className="flex items-center gap-2">
                                <span className={`px-2 py-1 ${styles.bg} ${styles.border} border rounded-full text-xs font-bold ${styles.text} uppercase`}>
                                    {badge.rarity}
                                </span>
                                {badge.points > 0 && (
                                    <span className="flex items-center gap-1 text-teal-600 font-semibold text-sm">
                                        <Zap className="w-4 h-4 fill-teal-600" />
                                        +{badge.points} pts
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (notification.type === 'levelUp' && notification.levelUp) {
        return (
            <div
                className={`fixed top-4 right-4 z-50 transition-all duration-300 ${
                    visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
                }`}
            >
                <div className="bg-gradient-to-br from-purple-100 to-pink-100 border-2 border-purple-400 rounded-2xl p-6 shadow-2xl max-w-sm backdrop-blur-sm">
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <Zap className="w-5 h-5 text-purple-600 fill-purple-600" />
                            <span className="font-bold text-purple-600 uppercase text-sm">
                                Level Up!
                            </span>
                        </div>
                        <button
                            onClick={handleClose}
                            className="text-slate-400 hover:text-slate-600 transition"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="text-center">
                        <p className="text-3xl font-bold text-purple-700 mb-2">
                            Level {notification.levelUp.newLevel}
                        </p>
                        <p className="text-slate-600">
                            You leveled up from level {notification.levelUp.oldLevel}!
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (notification.type === 'points' && notification.points) {
        return (
            <div
                className={`fixed top-4 right-4 z-50 transition-all duration-300 ${
                    visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
                }`}
            >
                <div className="bg-gradient-to-br from-teal-50 to-emerald-50 border-2 border-teal-400 rounded-2xl p-4 shadow-2xl max-w-xs backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                        <Zap className="w-8 h-8 text-teal-600 fill-teal-600 animate-bounce" />
                        <div>
                            <p className="font-bold text-teal-900">+{notification.points} Points!</p>
                            <p className="text-xs text-teal-600">Keep up the great work!</p>
                        </div>
                        <button
                            onClick={handleClose}
                            className="ml-auto text-slate-400 hover:text-slate-600 transition"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return null;
}
