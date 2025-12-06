import Link from 'next/link';
import { Brain, TrendingUp, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

export default function Hero() {
    return (
        <section className="pt-32 pb-20 px-6 relative overflow-hidden">
            {/* Animated background gradients */}
            <div className="absolute top-20 right-10 w-72 h-72 bg-teal-400/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-20 left-10 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl animate-pulse delay-1000" />

            <div className="container mx-auto relative">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left: Content */}
                    <div className="animate-fadeIn">
                        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-50 to-emerald-50 text-teal-700 px-4 py-2 rounded-full mb-6 border border-teal-200/50">
                            <Sparkles className="w-4 h-4 animate-pulse" />
                            <span className="text-sm font-semibold">7 ML Models + Quantum Computing</span>
                        </div>

                        <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 mb-6 leading-tight">
                            Reach Your
                            <span className="block mt-2 bg-gradient-to-r from-teal-600 via-emerald-600 to-green-600 bg-clip-text text-transparent animate-gradient">
                                Peak Health
                            </span>
                        </h1>

                        <p className="text-xl text-slate-600 mb-8 leading-relaxed max-w-xl">
                            The world's first <span className="font-semibold text-teal-600">quantum-enhanced</span> wellness platform.
                            Achieve peak performance with AI predictions, gamified tracking, and personalized insights.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 mb-12">
                            <Link
                                href="/signup"
                                className="group bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white px-8 py-4 rounded-xl transition flex items-center justify-center gap-2 text-lg font-semibold shadow-xl shadow-teal-500/30 hover:shadow-2xl hover:shadow-teal-500/40 transform hover:scale-105"
                            >
                                Start Free Today
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
                            </Link>
                            <button className="group border-2 border-slate-300 hover:border-teal-600 text-slate-700 hover:text-teal-600 px-8 py-4 rounded-xl transition text-lg font-semibold hover:bg-teal-50">
                                Watch Demo
                                <span className="ml-2 opacity-0 group-hover:opacity-100 transition">→</span>
                            </button>
                        </div>

                        <div className="flex flex-wrap items-center gap-6">
                            {['No credit card', 'Free forever', '30s setup'].map((feature) => (
                                <div key={feature} className="flex items-center gap-2">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                    <span className="text-slate-600 font-medium">{feature}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right: Dashboard Preview */}
                    <div className="relative">
                        <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-8 shadow-2xl border border-slate-700/50">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-3xl blur opacity-20" />

                            <div className="relative space-y-4">
                                {/* Dropout Risk Card */}
                                <div className="bg-gradient-to-br from-teal-500/20 to-emerald-500/20 backdrop-blur-sm rounded-xl p-6 border border-teal-400/30 hover:scale-105 transition-transform cursor-pointer">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <Brain className="w-5 h-5 text-teal-300" />
                                            <span className="text-teal-100 font-medium">Dropout Risk</span>
                                        </div>
                                        <span className="text-white font-bold text-lg">6.3%</span>
                                    </div>
                                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                        <div className="h-full w-[6%] bg-gradient-to-r from-teal-400 to-emerald-400 rounded-full animate-pulse" />
                                    </div>
                                    <p className="text-teal-200 text-sm mt-2">93.7% accurate prediction</p>
                                </div>

                                {/* Streak Card */}
                                <div className="bg-gradient-to-br from-emerald-500/20 to-green-500/20 backdrop-blur-sm rounded-xl p-6 border border-emerald-400/30 hover:scale-105 transition-transform cursor-pointer">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-emerald-100 font-medium">Current Streak</span>
                                        <span className="text-white font-bold text-2xl">23 🔥</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <TrendingUp className="w-5 h-5 text-emerald-300" />
                                        <span className="text-emerald-200 text-sm">+12% this week</span>
                                    </div>
                                </div>

                                {/* Engagement Card */}
                                <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 backdrop-blur-sm rounded-xl p-6 border border-amber-400/30 hover:scale-105 transition-transform cursor-pointer">
                                    <div className="flex items-center justify-between">
                                        <span className="text-amber-100 font-medium">Engagement Level</span>
                                        <span className="bg-gradient-to-r from-amber-400 to-orange-400 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-lg">
                                            Excellent
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Floating AI Badge */}
                        <div className="absolute -bottom-6 -right-6 bg-white p-5 rounded-2xl shadow-2xl border border-slate-200 animate-float">
                            <div className="flex items-center gap-3">
                                <div className="bg-gradient-to-br from-teal-500 to-emerald-500 p-3 rounded-xl">
                                    <Sparkles className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-600 font-medium">Quantum ML</p>
                                    <p className="font-bold text-slate-900 text-lg">Active</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
