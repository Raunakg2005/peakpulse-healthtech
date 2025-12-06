'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { User, Mail, Calendar, Scale, Ruler, Activity, Target, Save, Edit2 } from 'lucide-react';

export default function ProfilePage() {
    const { data: session } = useSession();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editing, setEditing] = useState(false);
    const [userData, setUserData] = useState<any>(null);
    const [formData, setFormData] = useState({
        name: '',
        age: '',
        gender: '',
        height: '',
        heightUnit: 'cm',
        weight: '',
        weightUnit: 'kg',
        activityLevel: '',
        primaryGoal: '',
        secondaryGoals: [] as string[],
        exerciseFrequency: '',
        meditationExperience: '',
        sleepHours: '',
        preferredActivityTime: '',
        motivationStyle: '',
        challengeDifficulty: ''
    });

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        try {
            const response = await fetch('/api/user/profile');
            const data = await response.json();
            const user = data.user || data; // Handle both response formats
            setUserData(user);
            
            // Populate form data
            setFormData({
                name: user.name || '',
                age: user.profile?.age?.toString() || '',
                gender: user.profile?.gender || '',
                height: user.profile?.height?.toString() || '',
                heightUnit: user.profile?.heightUnit || 'cm',
                weight: user.profile?.weight?.toString() || '',
                weightUnit: user.profile?.weightUnit || 'kg',
                activityLevel: user.profile?.activityLevel || '',
                primaryGoal: user.profile?.primaryGoal || '',
                secondaryGoals: user.profile?.secondaryGoals || [],
                exerciseFrequency: user.profile?.preferences?.exerciseFrequency || '',
                meditationExperience: user.profile?.preferences?.meditationExperience || '',
                sleepHours: user.profile?.preferences?.sleepHours || '',
                preferredActivityTime: user.profile?.preferences?.preferredActivityTime || '',
                motivationStyle: user.profile?.preferences?.motivationStyle || '',
                challengeDifficulty: user.profile?.preferences?.challengeDifficulty || ''
            });
        } catch (error) {
            console.error('Failed to fetch profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const response = await fetch('/api/user/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    profile: {
                        age: parseInt(formData.age),
                        gender: formData.gender,
                        height: parseFloat(formData.height),
                        heightUnit: formData.heightUnit,
                        weight: parseFloat(formData.weight),
                        weightUnit: formData.weightUnit,
                        activityLevel: formData.activityLevel,
                        primaryGoal: formData.primaryGoal,
                        secondaryGoals: formData.secondaryGoals,
                        preferences: {
                            exerciseFrequency: formData.exerciseFrequency,
                            meditationExperience: formData.meditationExperience,
                            sleepHours: formData.sleepHours,
                            preferredActivityTime: formData.preferredActivityTime,
                            motivationStyle: formData.motivationStyle,
                            challengeDifficulty: formData.challengeDifficulty
                        }
                    }
                })
            });

            if (response.ok) {
                await fetchUserProfile();
                setEditing(false);
            }
        } catch (error) {
            console.error('Failed to save profile:', error);
        } finally {
            setSaving(false);
        }
    };

    const calculateBMI = () => {
        if (!formData.height || !formData.weight) return null;
        
        const heightInM = formData.heightUnit === 'cm' 
            ? parseFloat(formData.height) / 100 
            : parseFloat(formData.height) * 0.3048;
        const weightInKg = formData.weightUnit === 'kg'
            ? parseFloat(formData.weight)
            : parseFloat(formData.weight) * 0.453592;
        
        return (weightInKg / (heightInM * heightInM)).toFixed(1);
    };

    const getBMICategory = (bmi: number) => {
        if (bmi < 18.5) return { label: 'Underweight', color: 'text-blue-600' };
        if (bmi < 25) return { label: 'Normal', color: 'text-green-600' };
        if (bmi < 30) return { label: 'Overweight', color: 'text-orange-600' };
        return { label: 'Obese', color: 'text-red-600' };
    };

    const calculateCalories = () => {
        if (!formData.height || !formData.weight || !formData.age || !formData.gender) return null;

        const heightInCm = formData.heightUnit === 'cm' 
            ? parseFloat(formData.height) 
            : parseFloat(formData.height) * 30.48;
        const weightInKg = formData.weightUnit === 'kg'
            ? parseFloat(formData.weight)
            : parseFloat(formData.weight) * 0.453592;
        const age = parseInt(formData.age);

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

        const maintenance = Math.round(bmr * (activityFactors[formData.activityLevel] || 1.2));
        
        return {
            bmr: Math.round(bmr),
            maintenance,
            weightLoss: maintenance - 500,
            weightGain: maintenance + 500
        };
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
            </div>
        );
    }

    const bmi = calculateBMI();
    const calories = calculateCalories();
    const bmiCategory = bmi ? getBMICategory(parseFloat(bmi)) : null;

    return (
        <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Profile</h1>
                    <p className="text-slate-600 mt-1">Manage your personal information and preferences</p>
                </div>
                <button
                    onClick={() => editing ? handleSave() : setEditing(true)}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-lg hover:from-teal-700 hover:to-emerald-700 transition font-medium disabled:opacity-50"
                >
                    {editing ? (
                        <>
                            <Save className="w-4 h-4" />
                            {saving ? 'Saving...' : 'Save Changes'}
                        </>
                    ) : (
                        <>
                            <Edit2 className="w-4 h-4" />
                            Edit Profile
                        </>
                    )}
                </button>
            </div>

            {/* Basic Information */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Basic Information</h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            <Mail className="w-4 h-4 inline mr-2" />
                            Email
                        </label>
                        <input
                            type="email"
                            value={session?.user?.email || ''}
                            disabled
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-slate-50"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            <User className="w-4 h-4 inline mr-2" />
                            Name
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            disabled={!editing}
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 disabled:bg-slate-50"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            <Calendar className="w-4 h-4 inline mr-2" />
                            Age
                        </label>
                        <input
                            type="number"
                            value={formData.age}
                            onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                            disabled={!editing}
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 disabled:bg-slate-50"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Gender
                        </label>
                        <select
                            value={formData.gender}
                            onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                            disabled={!editing}
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 disabled:bg-slate-50"
                        >
                            <option value="">Select gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Physical Stats */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Physical Stats</h2>
                
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            <Ruler className="w-4 h-4 inline mr-2" />
                            Height
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="number"
                                value={formData.height}
                                onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                                disabled={!editing}
                                className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 disabled:bg-slate-50"
                            />
                            <select
                                value={formData.heightUnit}
                                onChange={(e) => setFormData({ ...formData, heightUnit: e.target.value })}
                                disabled={!editing}
                                className="px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 disabled:bg-slate-50"
                            >
                                <option value="cm">cm</option>
                                <option value="ft">ft</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            <Scale className="w-4 h-4 inline mr-2" />
                            Weight
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="number"
                                value={formData.weight}
                                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                                disabled={!editing}
                                className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 disabled:bg-slate-50"
                            />
                            <select
                                value={formData.weightUnit}
                                onChange={(e) => setFormData({ ...formData, weightUnit: e.target.value })}
                                disabled={!editing}
                                className="px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 disabled:bg-slate-50"
                            >
                                <option value="kg">kg</option>
                                <option value="lbs">lbs</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* BMI & Calorie Display */}
                {bmi && calories && (
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-gradient-to-r from-teal-50 to-emerald-50 rounded-lg p-4 border border-teal-200">
                            <p className="text-sm text-slate-600 mb-1">Body Mass Index (BMI)</p>
                            <div className="flex items-baseline gap-2">
                                <p className="text-3xl font-bold text-slate-900">{bmi}</p>
                                <p className={`text-sm font-medium ${bmiCategory?.color}`}>
                                    {bmiCategory?.label}
                                </p>
                            </div>
                        </div>

                        <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-4 border border-orange-200">
                            <p className="text-sm text-slate-600 mb-1">Daily Calorie Needs</p>
                            <div className="flex items-baseline gap-2">
                                <p className="text-3xl font-bold text-slate-900">{calories.maintenance}</p>
                                <p className="text-sm text-slate-600">kcal/day</p>
                            </div>
                            <div className="flex gap-3 mt-2 text-xs">
                                <span className="text-slate-600">BMR: {calories.bmr}</span>
                                <span className="text-green-600">Loss: {calories.weightLoss}</span>
                                <span className="text-orange-600">Gain: {calories.weightGain}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Activity & Goals */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Activity & Goals</h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            <Activity className="w-4 h-4 inline mr-2" />
                            Activity Level
                        </label>
                        <select
                            value={formData.activityLevel}
                            onChange={(e) => setFormData({ ...formData, activityLevel: e.target.value })}
                            disabled={!editing}
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 disabled:bg-slate-50"
                        >
                            <option value="">Select level</option>
                            <option value="sedentary">Sedentary (office job, little exercise)</option>
                            <option value="lightly_active">Lightly Active (1-3 days/week)</option>
                            <option value="moderately_active">Moderately Active (3-5 days/week)</option>
                            <option value="very_active">Very Active (6-7 days/week)</option>
                            <option value="extra_active">Extra Active (athlete, physical job)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            <Target className="w-4 h-4 inline mr-2" />
                            Primary Goal
                        </label>
                        <select
                            value={formData.primaryGoal}
                            onChange={(e) => setFormData({ ...formData, primaryGoal: e.target.value })}
                            disabled={!editing}
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 disabled:bg-slate-50"
                        >
                            <option value="">Select goal</option>
                            <option value="Weight Loss">Weight Loss</option>
                            <option value="Muscle Gain">Build Muscle</option>
                            <option value="Stress Reduction">Reduce Stress</option>
                            <option value="Better Sleep">Better Sleep</option>
                            <option value="Healthy Eating">Healthy Eating</option>
                            <option value="Social Wellness">Social Wellness</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Exercise Frequency
                        </label>
                        <select
                            value={formData.exerciseFrequency}
                            onChange={(e) => setFormData({ ...formData, exerciseFrequency: e.target.value })}
                            disabled={!editing}
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 disabled:bg-slate-50"
                        >
                            <option value="">Select frequency</option>
                            <option value="never">Never</option>
                            <option value="1-2">1-2 times per week</option>
                            <option value="3-4">3-4 times per week</option>
                            <option value="5+">5+ times per week</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Sleep Hours
                        </label>
                        <select
                            value={formData.sleepHours}
                            onChange={(e) => setFormData({ ...formData, sleepHours: e.target.value })}
                            disabled={!editing}
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 disabled:bg-slate-50"
                        >
                            <option value="">Select hours</option>
                            <option value="<5">Less than 5 hours</option>
                            <option value="5-6">5-6 hours</option>
                            <option value="7-8">7-8 hours</option>
                            <option value="9+">9+ hours</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Preferences */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Preferences</h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Preferred Activity Time
                        </label>
                        <select
                            value={formData.preferredActivityTime}
                            onChange={(e) => setFormData({ ...formData, preferredActivityTime: e.target.value })}
                            disabled={!editing}
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 disabled:bg-slate-50"
                        >
                            <option value="">Select time</option>
                            <option value="morning">Morning (6AM - 12PM)</option>
                            <option value="afternoon">Afternoon (12PM - 6PM)</option>
                            <option value="evening">Evening (6PM - 10PM)</option>
                            <option value="flexible">Flexible</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Motivation Style
                        </label>
                        <select
                            value={formData.motivationStyle}
                            onChange={(e) => setFormData({ ...formData, motivationStyle: e.target.value })}
                            disabled={!editing}
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 disabled:bg-slate-50"
                        >
                            <option value="">Select style</option>
                            <option value="competitive">Competitive (leaderboards)</option>
                            <option value="supportive">Supportive (encouragement)</option>
                            <option value="data-driven">Data-driven (insights & analytics)</option>
                            <option value="social">Social (community challenges)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Challenge Difficulty
                        </label>
                        <select
                            value={formData.challengeDifficulty}
                            onChange={(e) => setFormData({ ...formData, challengeDifficulty: e.target.value })}
                            disabled={!editing}
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 disabled:bg-slate-50"
                        >
                            <option value="">Select difficulty</option>
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Meditation Experience
                        </label>
                        <select
                            value={formData.meditationExperience}
                            onChange={(e) => setFormData({ ...formData, meditationExperience: e.target.value })}
                            disabled={!editing}
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 disabled:bg-slate-50"
                        >
                            <option value="">Select experience</option>
                            <option value="never">Never tried</option>
                            <option value="beginner">Beginner</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="advanced">Advanced</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Stats */}
            {userData?.stats && (
                <div className="bg-white rounded-2xl shadow-lg p-6">
                    <h2 className="text-xl font-bold text-slate-900 mb-4">Your Stats</h2>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg">
                            <p className="text-3xl font-bold text-teal-700">{userData.stats.totalPoints}</p>
                            <p className="text-sm text-slate-600 mt-1">Total Points</p>
                        </div>
                        <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg">
                            <p className="text-3xl font-bold text-emerald-700">{userData.stats.level}</p>
                            <p className="text-sm text-slate-600 mt-1">Level</p>
                        </div>
                        <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
                            <p className="text-3xl font-bold text-orange-700">{userData.stats.currentStreak}</p>
                            <p className="text-sm text-slate-600 mt-1">Current Streak</p>
                        </div>
                        <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                            <p className="text-3xl font-bold text-purple-700">{userData.stats.completedChallenges}</p>
                            <p className="text-sm text-slate-600 mt-1">Challenges</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
