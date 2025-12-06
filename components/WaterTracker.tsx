'use client';

import { useState, useEffect } from 'react';
import { Droplets, Plus, Minus, Trophy, TrendingUp } from 'lucide-react';

interface WaterTrackerProps {
    onUpdate?: () => void;
}

export default function WaterTracker({ onUpdate }: WaterTrackerProps) {
    const [glassesCount, setGlassesCount] = useState(0);
    const [goal, setGoal] = useState(8);
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);

    useEffect(() => {
        fetchWaterData();
    }, []);

    const fetchWaterData = async () => {
        try {
            const response = await fetch('/api/water');
            const data = await response.json();
            
            if (data.success) {
                setGlassesCount(data.totalGlasses);
                setGoal(data.goal);
            }
        } catch (error) {
            console.error('Failed to fetch water data:', error);
        } finally {
            setLoading(false);
        }
    };

    const addGlass = async () => {
        setAdding(true);
        try {
            const response = await fetch('/api/water', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ glasses: 1 })
            });

            if (response.ok) {
                setGlassesCount(prev => prev + 1);
                onUpdate?.();
            }
        } catch (error) {
            console.error('Failed to log water:', error);
        } finally {
            setAdding(false);
        }
    };

    const percentage = Math.min((glassesCount / goal) * 100, 100);

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-2xl border-2 border-blue-200 shadow-lg">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-blue-500 to-cyan-600 p-3 rounded-xl">
                        <Droplets className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="text-xl font-extrabold text-slate-900">Hydration Tracker</h3>
                        <p className="text-sm text-slate-600">Track your daily water intake</p>
                    </div>
                </div>
                {glassesCount >= goal && (
                    <Trophy className="w-8 h-8 text-amber-500 animate-bounce" />
                )}
            </div>

            {/* Progress Circle */}
            <div className="flex flex-col items-center my-6">
                <div className="relative w-40 h-40">
                    {/* Background Circle */}
                    <svg className="transform -rotate-90 w-40 h-40">
                        <circle
                            cx="80"
                            cy="80"
                            r="70"
                            stroke="currentColor"
                            strokeWidth="12"
                            fill="none"
                            className="text-blue-200"
                        />
                        {/* Progress Circle */}
                        <circle
                            cx="80"
                            cy="80"
                            r="70"
                            stroke="currentColor"
                            strokeWidth="12"
                            fill="none"
                            strokeDasharray={`${2 * Math.PI * 70}`}
                            strokeDashoffset={`${2 * Math.PI * 70 * (1 - percentage / 100)}`}
                            className="text-blue-600 transition-all duration-1000 ease-out"
                            strokeLinecap="round"
                        />
                    </svg>
                    {/* Center Content */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-4xl font-extrabold text-blue-600">{glassesCount}</span>
                        <span className="text-sm text-slate-600 font-semibold">of {goal} glasses</span>
                        <span className="text-xs text-slate-500 mt-1">{Math.round(percentage)}%</span>
                    </div>
                </div>
            </div>

            {/* Water Glasses Visualization */}
            <div className="flex justify-center gap-2 mb-6 flex-wrap">
                {[...Array(goal)].map((_, index) => (
                    <div
                        key={index}
                        className={`w-8 h-10 rounded-lg border-2 transition-all duration-300 ${
                            index < glassesCount
                                ? 'bg-blue-500 border-blue-600 shadow-md'
                                : 'bg-white border-blue-200'
                        }`}
                        style={{
                            animationDelay: `${index * 50}ms`
                        }}
                    >
                        <div className="w-full h-full flex items-end justify-center pb-1">
                            {index < glassesCount && (
                                <Droplets className="w-4 h-4 text-white animate-pulse" />
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Add Water Button */}
            <button
                onClick={addGlass}
                disabled={adding}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-6 py-4 rounded-xl font-bold text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-wait shadow-lg hover:shadow-xl hover:scale-105 flex items-center justify-center gap-2"
            >
                {adding ? (
                    <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Adding...
                    </>
                ) : (
                    <>
                        <Plus className="w-5 h-5" />
                        Add Glass (250ml)
                    </>
                )}
            </button>

            {/* Progress Message */}
            {glassesCount >= goal ? (
                <div className="mt-4 p-3 bg-emerald-100 border-2 border-emerald-300 rounded-xl text-center">
                    <p className="text-emerald-800 font-bold flex items-center justify-center gap-2">
                        <Trophy className="w-5 h-5" />
                        Goal achieved! Keep it up! 🎉
                    </p>
                </div>
            ) : glassesCount >= goal * 0.5 ? (
                <div className="mt-4 p-3 bg-blue-100 border-2 border-blue-300 rounded-xl text-center">
                    <p className="text-blue-800 font-semibold flex items-center justify-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        Halfway there! Keep going! 💪
                    </p>
                </div>
            ) : (
                <div className="mt-4 p-3 bg-amber-100 border-2 border-amber-300 rounded-xl text-center">
                    <p className="text-amber-800 font-semibold">
                        {goal - glassesCount} more glass{goal - glassesCount !== 1 ? 'es' : ''} to reach your goal! 🥤
                    </p>
                </div>
            )}
        </div>
    );
}
