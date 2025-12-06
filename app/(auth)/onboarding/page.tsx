'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Activity, Target, Heart, Moon, Salad, Users } from 'lucide-react';

export default function OnboardingPage() {
    const router = useRouter();
    const { data: session } = useSession();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        // Step 1: Basic Info
        age: '',
        gender: '',
        height: '',
        heightUnit: 'cm',
        weight: '',
        weightUnit: 'kg',

        // Step 2: Health Goals
        primaryGoal: '',
        secondaryGoals: [] as string[],

        // Step 3: Current Habits
        exerciseFrequency: '',
        meditationExperience: '',
        sleepHours: '',
        activityLevel: '',

        // Step 4: Preferences
        preferredActivityTime: '',
        motivationStyle: '',
        challengeDifficulty: 'medium'
    });

    const goals = [
        { id: 'weight_loss', label: 'Weight Loss', icon: Activity },
        { id: 'muscle_gain', label: 'Build Muscle', icon: Target },
        { id: 'stress_reduction', label: 'Reduce Stress', icon: Heart },
        { id: 'better_sleep', label: 'Better Sleep', icon: Moon },
        { id: 'healthy_eating', label: 'Healthy Eating', icon: Salad },
        { id: 'social_wellness', label: 'Social Wellness', icon: Users }
    ];

    const handleSubmit = async () => {
        setLoading(true);

        try {
            const payload = {
                profile: {
                    age: formData.age ? parseInt(formData.age) : undefined,
                    gender: formData.gender || undefined,
                    height: formData.height ? parseFloat(formData.height) : undefined,
                    heightUnit: formData.heightUnit,
                    weight: formData.weight ? parseFloat(formData.weight) : undefined,
                    weightUnit: formData.weightUnit,
                    activityLevel: formData.activityLevel || undefined,
                    primaryGoal: formData.primaryGoal || undefined,
                    secondaryGoals: formData.secondaryGoals.length > 0 ? formData.secondaryGoals : undefined,
                    preferences: {
                        exerciseFrequency: formData.exerciseFrequency || undefined,
                        meditationExperience: formData.meditationExperience || undefined,
                        sleepHours: formData.sleepHours || undefined,
                        preferredActivityTime: formData.preferredActivityTime || undefined,
                        motivationStyle: formData.motivationStyle || undefined,
                        challengeDifficulty: formData.challengeDifficulty
                    }
                },
                onboardingCompleted: true
            };

            // Save onboarding data to user profile
            const res = await fetch('/api/user/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                router.push('/dashboard');
            } else {
                const errorData = await res.json();
                console.error('Failed to save onboarding data:', errorData);
            }
        } catch (error) {
            console.error('Onboarding error:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleSecondaryGoal = (goalId: string) => {
        setFormData(prev => ({
            ...prev,
            secondaryGoals: prev.secondaryGoals.includes(goalId)
                ? prev.secondaryGoals.filter(g => g !== goalId)
                : [...prev.secondaryGoals, goalId]
        }));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-emerald-50">
            <div className="max-w-3xl mx-auto px-4 py-12">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-slate-900 mb-2">
                        Welcome{session?.user?.name ? `, ${session.user.name.split(' ')[0]}` : ''}! 👋
                    </h1>
                    <p className="text-slate-600">Let's personalize your health journey</p>
                </div>

                {/* Progress Bar */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-700">Step {step} of 4</span>
                        <span className="text-sm text-slate-500">{Math.round((step / 4) * 100)}% complete</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                            className="bg-gradient-to-r from-teal-600 to-emerald-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${(step / 4) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Step Content */}
                <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
                    {/* Step 1: Basic Info */}
                    {step === 1 && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-slate-900 mb-4">Tell us about yourself</h2>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Age
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.age}
                                        onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                        placeholder="Your age"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Gender
                                    </label>
                                    <select
                                        value={formData.gender}
                                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                                    >
                                        <option value="">Select gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Height
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="number"
                                            value={formData.height}
                                            onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                                            className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                                            placeholder="170"
                                        />
                                        <select
                                            value={formData.heightUnit}
                                            onChange={(e) => setFormData({ ...formData, heightUnit: e.target.value })}
                                            className="px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                                        >
                                            <option value="cm">cm</option>
                                            <option value="ft">ft</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Weight
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="number"
                                            value={formData.weight}
                                            onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                                            className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                                            placeholder="70"
                                        />
                                        <select
                                            value={formData.weightUnit}
                                            onChange={(e) => setFormData({ ...formData, weightUnit: e.target.value })}
                                            className="px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                                        >
                                            <option value="kg">kg</option>
                                            <option value="lbs">lbs</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* BMI Display */}
                            {formData.height && formData.weight && (
                                <div className="bg-gradient-to-r from-teal-50 to-emerald-50 rounded-lg p-4 border border-teal-200">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-slate-600 mb-1">Your BMI</p>
                                            <p className="text-2xl font-bold text-slate-900">
                                                {(() => {
                                                    const heightInM = formData.heightUnit === 'cm'
                                                        ? parseFloat(formData.height) / 100
                                                        : parseFloat(formData.height) * 0.3048;
                                                    const weightInKg = formData.weightUnit === 'kg'
                                                        ? parseFloat(formData.weight)
                                                        : parseFloat(formData.weight) * 0.453592;
                                                    const bmi = weightInKg / (heightInM * heightInM);
                                                    return bmi.toFixed(1);
                                                })()}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium text-teal-700">
                                                {(() => {
                                                    const heightInM = formData.heightUnit === 'cm'
                                                        ? parseFloat(formData.height) / 100
                                                        : parseFloat(formData.height) * 0.3048;
                                                    const weightInKg = formData.weightUnit === 'kg'
                                                        ? parseFloat(formData.weight)
                                                        : parseFloat(formData.weight) * 0.453592;
                                                    const bmi = weightInKg / (heightInM * heightInM);
                                                    if (bmi < 18.5) return 'Underweight';
                                                    if (bmi < 25) return 'Normal';
                                                    if (bmi < 30) return 'Overweight';
                                                    return 'Obese';
                                                })()}
                                            </p>
                                            <p className="text-xs text-slate-500 mt-1">
                                                Daily calorie burn: ~{(() => {
                                                    const age = parseInt(formData.age) || 25;
                                                    const heightInCm = formData.heightUnit === 'cm'
                                                        ? parseFloat(formData.height)
                                                        : parseFloat(formData.height) * 30.48;
                                                    const weightInKg = formData.weightUnit === 'kg'
                                                        ? parseFloat(formData.weight)
                                                        : parseFloat(formData.weight) * 0.453592;

                                                    // Mifflin-St Jeor Equation for BMR
                                                    let bmr;
                                                    if (formData.gender === 'Male') {
                                                        bmr = 10 * weightInKg + 6.25 * heightInCm - 5 * age + 5;
                                                    } else {
                                                        bmr = 10 * weightInKg + 6.25 * heightInCm - 5 * age - 161;
                                                    }
                                                    // Multiply by activity factor (sedentary = 1.2)
                                                    return Math.round(bmr * 1.2);
                                                })()} kcal
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 2: Health Goals */}
                    {step === 2 && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-slate-900 mb-4">What are your health goals?</h2>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-3">
                                    Primary Goal
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    {goals.map((goal) => {
                                        const Icon = goal.icon;
                                        return (
                                            <button
                                                key={goal.id}
                                                onClick={() => setFormData({ ...formData, primaryGoal: goal.id })}
                                                className={`p-4 rounded-lg border-2 transition flex items-center gap-3 ${formData.primaryGoal === goal.id
                                                        ? 'border-teal-600 bg-teal-50'
                                                        : 'border-slate-200 hover:border-slate-300'
                                                    }`}
                                            >
                                                <Icon className={`w-5 h-5 ${formData.primaryGoal === goal.id ? 'text-teal-600' : 'text-slate-400'
                                                    }`} />
                                                <span className={`font-medium ${formData.primaryGoal === goal.id ? 'text-teal-700' : 'text-slate-700'
                                                    }`}>
                                                    {goal.label}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-3">
                                    Secondary Goals (optional - select up to 2)
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    {goals.filter(g => g.id !== formData.primaryGoal).map((goal) => {
                                        const Icon = goal.icon;
                                        const isSelected = formData.secondaryGoals.includes(goal.id);
                                        return (
                                            <button
                                                key={goal.id}
                                                onClick={() => toggleSecondaryGoal(goal.id)}
                                                disabled={!isSelected && formData.secondaryGoals.length >= 2}
                                                className={`p-3 rounded-lg border transition flex items-center gap-2 text-sm ${isSelected
                                                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                                                        : 'border-slate-200 hover:border-slate-300 disabled:opacity-50'
                                                    }`}
                                            >
                                                <Icon className="w-4 h-4" />
                                                {goal.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Current Habits */}
                    {step === 3 && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-slate-900 mb-4">Your current habits</h2>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    How often do you exercise?
                                </label>
                                <select
                                    value={formData.exerciseFrequency}
                                    onChange={(e) => setFormData({ ...formData, exerciseFrequency: e.target.value })}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                                >
                                    <option value="">Select frequency</option>
                                    <option value="never">Never</option>
                                    <option value="1-2_per_week">1-2 times per week</option>
                                    <option value="3-4_per_week">3-4 times per week</option>
                                    <option value="5+_per_week">5+ times per week</option>
                                    <option value="daily">Daily</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Meditation/Mindfulness experience
                                </label>
                                <select
                                    value={formData.meditationExperience}
                                    onChange={(e) => setFormData({ ...formData, meditationExperience: e.target.value })}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                                >
                                    <option value="">Select experience level</option>
                                    <option value="beginner">Complete beginner</option>
                                    <option value="some_experience">Some experience</option>
                                    <option value="regular_practice">Regular practice</option>
                                    <option value="advanced">Advanced practitioner</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Average sleep hours per night
                                </label>
                                <select
                                    value={formData.sleepHours}
                                    onChange={(e) => setFormData({ ...formData, sleepHours: e.target.value })}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                                >
                                    <option value="">Select hours</option>
                                    <option value="<5">Less than 5 hours</option>
                                    <option value="5-6">5-6 hours</option>
                                    <option value="7-8">7-8 hours</option>
                                    <option value="9+">9+ hours</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Daily activity level
                                </label>
                                <select
                                    value={formData.activityLevel}
                                    onChange={(e) => setFormData({ ...formData, activityLevel: e.target.value })}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                                >
                                    <option value="">Select activity level</option>
                                    <option value="sedentary">Sedentary (office job, little exercise)</option>
                                    <option value="lightly_active">Lightly Active (light exercise 1-3 days/week)</option>
                                    <option value="moderately_active">Moderately Active (moderate exercise 3-5 days/week)</option>
                                    <option value="very_active">Very Active (hard exercise 6-7 days/week)</option>
                                    <option value="extra_active">Extra Active (athlete, physical job)</option>
                                </select>
                            </div>

                            {/* Calorie Info Display */}
                            {formData.height && formData.weight && formData.age && formData.gender && formData.activityLevel && (
                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                                    <p className="text-sm font-medium text-slate-700 mb-3">📊 Your Daily Calorie Needs</p>
                                    <div className="grid grid-cols-3 gap-3 text-center">
                                        <div>
                                            <p className="text-xs text-slate-600 mb-1">Maintenance</p>
                                            <p className="text-lg font-bold text-slate-900">
                                                {(() => {
                                                    const age = parseInt(formData.age);
                                                    const heightInCm = formData.heightUnit === 'cm'
                                                        ? parseFloat(formData.height)
                                                        : parseFloat(formData.height) * 30.48;
                                                    const weightInKg = formData.weightUnit === 'kg'
                                                        ? parseFloat(formData.weight)
                                                        : parseFloat(formData.weight) * 0.453592;

                                                    let bmr;
                                                    if (formData.gender === 'Male') {
                                                        bmr = 10 * weightInKg + 6.25 * heightInCm - 5 * age + 5;
                                                    } else {
                                                        bmr = 10 * weightInKg + 6.25 * heightInCm - 5 * age - 161;
                                                    }

                                                    const activityFactors: any = {
                                                        sedentary: 1.2,
                                                        lightly_active: 1.375,
                                                        moderately_active: 1.55,
                                                        very_active: 1.725,
                                                        extra_active: 1.9
                                                    };

                                                    return Math.round(bmr * activityFactors[formData.activityLevel]);
                                                })()}
                                            </p>
                                            <p className="text-xs text-slate-500">kcal/day</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-600 mb-1">Weight Loss</p>
                                            <p className="text-lg font-bold text-green-600">
                                                {(() => {
                                                    const age = parseInt(formData.age);
                                                    const heightInCm = formData.heightUnit === 'cm'
                                                        ? parseFloat(formData.height)
                                                        : parseFloat(formData.height) * 30.48;
                                                    const weightInKg = formData.weightUnit === 'kg'
                                                        ? parseFloat(formData.weight)
                                                        : parseFloat(formData.weight) * 0.453592;

                                                    let bmr;
                                                    if (formData.gender === 'Male') {
                                                        bmr = 10 * weightInKg + 6.25 * heightInCm - 5 * age + 5;
                                                    } else {
                                                        bmr = 10 * weightInKg + 6.25 * heightInCm - 5 * age - 161;
                                                    }

                                                    const activityFactors: any = {
                                                        sedentary: 1.2,
                                                        lightly_active: 1.375,
                                                        moderately_active: 1.55,
                                                        very_active: 1.725,
                                                        extra_active: 1.9
                                                    };

                                                    return Math.round((bmr * activityFactors[formData.activityLevel]) - 500);
                                                })()}
                                            </p>
                                            <p className="text-xs text-slate-500">-500 kcal</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-600 mb-1">Weight Gain</p>
                                            <p className="text-lg font-bold text-orange-600">
                                                {(() => {
                                                    const age = parseInt(formData.age);
                                                    const heightInCm = formData.heightUnit === 'cm'
                                                        ? parseFloat(formData.height)
                                                        : parseFloat(formData.height) * 30.48;
                                                    const weightInKg = formData.weightUnit === 'kg'
                                                        ? parseFloat(formData.weight)
                                                        : parseFloat(formData.weight) * 0.453592;

                                                    let bmr;
                                                    if (formData.gender === 'Male') {
                                                        bmr = 10 * weightInKg + 6.25 * heightInCm - 5 * age + 5;
                                                    } else {
                                                        bmr = 10 * weightInKg + 6.25 * heightInCm - 5 * age - 161;
                                                    }

                                                    const activityFactors: any = {
                                                        sedentary: 1.2,
                                                        lightly_active: 1.375,
                                                        moderately_active: 1.55,
                                                        very_active: 1.725,
                                                        extra_active: 1.9
                                                    };

                                                    return Math.round((bmr * activityFactors[formData.activityLevel]) + 500);
                                                })()}
                                            </p>
                                            <p className="text-xs text-slate-500">+500 kcal</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 4: Preferences */}
                    {step === 4 && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-slate-900 mb-4">Personalize your experience</h2>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Preferred time for activities
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    {['Morning', 'Afternoon', 'Evening', 'Night'].map((time) => (
                                        <button
                                            key={time}
                                            onClick={() => setFormData({ ...formData, preferredActivityTime: time.toLowerCase() })}
                                            className={`px-4 py-3 rounded-lg border-2 transition ${formData.preferredActivityTime === time.toLowerCase()
                                                    ? 'border-teal-600 bg-teal-50 text-teal-700 font-medium'
                                                    : 'border-slate-200 hover:border-slate-300'
                                                }`}
                                        >
                                            {time}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Motivation style
                                </label>
                                <div className="space-y-2">
                                    {[
                                        { value: 'encouraging', label: 'Encouraging & Supportive', desc: 'Positive reinforcement' },
                                        { value: 'challenging', label: 'Direct & Challenging', desc: 'Push me to do better' },
                                        { value: 'data_driven', label: 'Data-Driven', desc: 'Show me the numbers' }
                                    ].map((style) => (
                                        <button
                                            key={style.value}
                                            onClick={() => setFormData({ ...formData, motivationStyle: style.value })}
                                            className={`w-full p-4 rounded-lg border-2 transition text-left ${formData.motivationStyle === style.value
                                                    ? 'border-teal-600 bg-teal-50'
                                                    : 'border-slate-200 hover:border-slate-300'
                                                }`}
                                        >
                                            <div className="font-medium text-slate-900">{style.label}</div>
                                            <div className="text-sm text-slate-500">{style.desc}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Challenge difficulty
                                </label>
                                <div className="grid grid-cols-3 gap-3">
                                    {[
                                        { value: 'easy', label: 'Easy', desc: 'Start slow' },
                                        { value: 'medium', label: 'Medium', desc: 'Balanced' },
                                        { value: 'hard', label: 'Hard', desc: 'Challenge me' }
                                    ].map((difficulty) => (
                                        <button
                                            key={difficulty.value}
                                            onClick={() => setFormData({ ...formData, challengeDifficulty: difficulty.value })}
                                            className={`p-3 rounded-lg border-2 transition ${formData.challengeDifficulty === difficulty.value
                                                    ? 'border-teal-600 bg-teal-50'
                                                    : 'border-slate-200 hover:border-slate-300'
                                                }`}
                                        >
                                            <div className={`font-medium ${formData.challengeDifficulty === difficulty.value ? 'text-teal-700' : 'text-slate-900'
                                                }`}>
                                                {difficulty.label}
                                            </div>
                                            <div className="text-xs text-slate-500">{difficulty.desc}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between">
                    {step > 1 && (
                        <button
                            onClick={() => setStep(step - 1)}
                            className="px-6 py-3 border-2 border-slate-300 rounded-lg font-medium text-slate-700 hover:bg-slate-50 transition"
                        >
                            Back
                        </button>
                    )}

                    <button
                        onClick={() => {
                            if (step < 4) {
                                setStep(step + 1);
                            } else {
                                handleSubmit();
                            }
                        }}
                        disabled={loading}
                        className="ml-auto px-8 py-3 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-lg font-medium hover:from-teal-700 hover:to-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Saving...' : step === 4 ? 'Complete Setup' : 'Continue'}
                    </button>
                </div>

                {/* Skip Option */}
                <div className="text-center mt-6">
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="text-sm text-slate-500 hover:text-slate-700 transition"
                    >
                        Skip for now →
                    </button>
                </div>
            </div>
        </div>
    );
}
