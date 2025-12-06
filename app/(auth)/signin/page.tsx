'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Activity, Mail, Lock, Eye, EyeOff, Chrome } from 'lucide-react';

export default function SignInPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await signIn('credentials', {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError('Invalid email or password');
            } else {
                router.push('/dashboard');
            }
        } catch (err) {
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setLoading(true);
        await signIn('google', { callbackUrl: '/dashboard' });
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <Link href="/" className="flex items-center justify-center gap-2 mb-8">
                    <Activity className="w-10 h-10 text-teal-600" />
                    <span className="font-bold text-2xl text-slate-900">HealthTech 2.0</span>
                </Link>

                {/* Main Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome back</h1>
                        <p className="text-slate-600">Sign in to continue your health journey</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
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
                        </div>

                        {/* Remember & Forgot */}
                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" className="w-4 h-4 text-teal-600 border-slate-300 rounded" />
                                <span className="text-slate-600">Remember me</span>
                            </label>
                            <Link href="/reset-password" className="text-teal-600 hover:text-teal-700 font-medium">
                                Forgot password?
                            </Link>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center gap-4 my-6">
                        <div className="flex-1 h-px bg-slate-200" />
                        <span className="text-sm text-slate-500">or continue with</span>
                        <div className="flex-1 h-px bg-slate-200" />
                    </div>

                    {/* Google Sign In */}
                    <button
                        onClick={handleGoogleSignIn}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-3 border-2 border-slate-200 hover:border-teal-600 hover:bg-teal-50 text-slate-700 font-medium py-3 rounded-lg transition disabled:opacity-50"
                    >
                        <Chrome className="w-5 h-5" />
                        Sign in with Google
                    </button>

                    {/* Sign Up Link */}
                    <p className="mt-6 text-center text-slate-600">
                        Don't have an account?{' '}
                        <Link href="/signup" className="text-teal-600 hover:text-teal-700 font-medium">
                            Sign up
                        </Link>
                    </p>
                </div>

                {/* Footer */}
                <p className="mt-6 text-center text-sm text-slate-500">
                    By signing in, you agree to our{' '}
                    <Link href="#" className="text-teal-600 hover:underline">Terms</Link> and{' '}
                    <Link href="#" className="text-teal-600 hover:underline">Privacy Policy</Link>
                </p>
            </div>
        </div>
    );
}
