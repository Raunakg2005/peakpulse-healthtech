'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Activity, Mail, Lock, Eye, EyeOff, Chrome, User, CheckCircle2 } from 'lucide-react';

export default function SignUpPage() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const passwordStrength = () => {
        if (password.length === 0) return 0;
        if (password.length < 6) return 1;
        if (password.length < 10) return 2;
        return 3;
    };

    const strength = passwordStrength();
    const strengthColors = ['', 'bg-red-500', 'bg-amber-500', 'bg-emerald-500'];
    const strengthLabels = ['', 'Weak', 'Medium', 'Strong'];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Something went wrong');
                setLoading(false);
                return;
            }

            // Auto sign in after signup
            const result = await signIn('credentials', {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError('Account created but sign in failed. Please sign in manually.');
                router.push('/signin');
            } else {
                router.push('/onboarding');
            }
        } catch (err) {
            setError('Something went wrong. Please try again.');
            setLoading(false);
        }
    };

    const handleGoogleSignUp = async () => {
        setLoading(true);
        await signIn('google', { callbackUrl: '/onboarding' });
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">
                {/* Logo */}
                <Link href="/" className="flex items-center justify-center gap-2 mb-8">
                    <Activity className="w-10 h-10 text-teal-600" />
                    <span className="font-bold text-2xl text-slate-900">HealthTech 2.0</span>
                </Link>

                {/* Main Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-slate-900 mb-2">Create your account</h1>
                        <p className="text-slate-600">Start your health journey with AI-powered insights</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Full Name
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
                                    placeholder="John Doe"
                                    required
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
                                    placeholder="you@example.com"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-11 pr-12 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>

                            {/* Password Strength */}
                            {password && (
                                <div className="mt-2">
                                    <div className="flex gap-1 mb-1">
                                        {[1, 2, 3].map((i) => (
                                            <div
                                                key={i}
                                                className={`h-1 flex-1 rounded-full ${i <= strength ? strengthColors[strength] : 'bg-slate-200'
                                                    } transition`}
                                            />
                                        ))}
                                    </div>
                                    {strength > 0 && (
                                        <p className="text-xs text-slate-600">
                                            Password strength: {strengthLabels[strength]}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Terms */}
                        <label className="flex items-start gap-3 cursor-pointer">
                            <input type="checkbox" className="w-4 h-4 mt-1 text-teal-600 border-slate-300 rounded" required />
                            <span className="text-sm text-slate-600">
                                I agree to the{' '}
                                <Link href="#" className="text-teal-600 hover:underline">Terms of Service</Link>
                                {' '}and{' '}
                                <Link href="#" className="text-teal-600 hover:underline">Privacy Policy</Link>
                            </span>
                        </label>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Creating account...' : 'Create Account'}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center gap-4 my-6">
                        <div className="flex-1 h-px bg-slate-200" />
                        <span className="text-sm text-slate-500">or continue with</span>
                        <div className="flex-1 h-px bg-slate-200" />
                    </div>

                    {/* Google Sign Up */}
                    <button
                        onClick={handleGoogleSignUp}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-3 border-2 border-slate-200 hover:border-teal-600 hover:bg-teal-50 text-slate-700 font-medium py-3 rounded-lg transition disabled:opacity-50"
                    >
                        <Chrome className="w-5 h-5" />
                        Sign up with Google
                    </button>

                    {/* Sign In Link */}
                    <p className="mt-6 text-center text-slate-600">
                        Already have an account?{' '}
                        <Link href="/signin" className="text-teal-600 hover:text-teal-700 font-medium">
                            Sign in
                        </Link>
                    </p>
                </div>

                {/* Features */}
                <div className="mt-8 space-y-3">
                    <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-teal-600 flex-shrink-0" />
                        <span className="text-sm text-slate-600">93.7% accurate dropout predictions</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-teal-600 flex-shrink-0" />
                        <span className="text-sm text-slate-600">Personalized challenges with ML recommendations</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-teal-600 flex-shrink-0" />
                        <span className="text-sm text-slate-600">Quantum-enhanced health insights</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
