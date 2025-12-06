'use client';

import Link from 'next/link';
import { Activity, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled
                ? 'bg-white/95 backdrop-blur-lg shadow-lg border-b border-slate-200/50'
                : 'bg-white/90 backdrop-blur-md border-b border-slate-200/50'
            }`}>
            <div className="container mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="bg-gradient-to-br from-teal-500 to-emerald-500 p-2 rounded-xl group-hover:scale-110 transition-transform shadow-lg">
                            <Activity className="w-6 h-6 text-white" />
                        </div>
                        <span className="font-bold text-xl bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
                            PeakPulse
                        </span>
                    </Link>

                    <div className="hidden md:flex items-center gap-8">
                        <Link href="#features" className="text-slate-600 hover:text-teal-600 transition font-medium relative group">
                            Features
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-teal-600 group-hover:w-full transition-all" />
                        </Link>
                        <Link href="#how-it-works" className="text-slate-600 hover:text-teal-600 transition font-medium relative group">
                            How It Works
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-teal-600 group-hover:w-full transition-all" />
                        </Link>
                        <Link href="#technology" className="text-slate-600 hover:text-teal-600 transition font-medium relative group">
                            Technology
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-teal-600 group-hover:w-full transition-all" />
                        </Link>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            href="/signin"
                            className="text-slate-700 hover:text-teal-600 transition px-4 py-2 font-medium"
                        >
                            Sign In
                        </Link>
                        <Link
                            href="/signup"
                            className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white px-6 py-2.5 rounded-xl transition shadow-lg shadow-teal-500/30 flex items-center gap-2 font-medium group"
                        >
                            Get Started
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
}
