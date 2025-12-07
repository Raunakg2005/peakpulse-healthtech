'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
    Home,
    Activity,
    Target,
    Users,
    Brain,
    Trophy,
    Medal,
    LogOut,
    Menu,
    X,
    Calendar,
    UserPlus
} from 'lucide-react';
import { getAvatarById, getDefaultAvatar } from '@/lib/avatars';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/signin');
        }
    }, [status, router]);

    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-slate-600">Loading...</p>
                </div>
            </div>
        );
    }

    if (!session) {
        return null;
    }

    const navigation = [
        { name: 'Dashboard', href: '/dashboard', icon: Home },
        { name: 'Habits', href: '/dashboard/habits', icon: Activity },
        { name: 'Calendar', href: '/dashboard/calendar', icon: Calendar },
        { name: 'Challenges', href: '/dashboard/challenges', icon: Target },
        { name: 'Social', href: '/dashboard/social', icon: Users },
        { name: 'Friends', href: '/dashboard/friends', icon: UserPlus },
        { name: 'Insights', href: '/dashboard/insights', icon: Brain },
        { name: 'Achievements', href: '/achievements', icon: Trophy },
        { name: 'Leaderboard', href: '/leaderboard', icon: Medal },
    ];

    const userAvatar = getAvatarById((session?.user as any)?.avatar) || getDefaultAvatar();

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Top Navbar - Responsive */}
            <nav className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-50">
                <div className="flex items-center justify-between h-full px-4 md:px-6">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="bg-gradient-to-br from-teal-500 to-emerald-500 p-2 rounded-lg">
                            <Activity className="w-5 h-5 text-white" />
                        </div>
                        <span className="hidden sm:block font-bold text-lg bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
                            PeakPulse
                        </span>
                    </Link>

                    <div className="flex items-center gap-2 md:gap-4">
                        {/* Mobile menu button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="lg:hidden p-2 hover:bg-slate-100 rounded-lg transition"
                            title="Menu"
                        >
                            {mobileMenuOpen ? <X className="w-5 h-5 text-slate-600" /> : <Menu className="w-5 h-5 text-slate-600" />}
                        </button>

                        <div className="hidden md:flex items-center gap-3">
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 rounded-full mr-2">
                                <Trophy className="w-4 h-4 text-amber-500 fill-amber-500" />
                                <span className="font-bold text-amber-700">{(session?.user as any).totalPoints || 0}</span>
                            </div>
                            <Link
                                href="/profile"
                                className="flex items-center gap-2 hover:opacity-80 transition group"
                                title="View Profile"
                            >
                                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-md group-hover:scale-105 transition-transform">
                                    <img
                                        src={userAvatar.imageUrl}
                                        alt={userAvatar.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="flex pt-16">
                {/* Mobile Sidebar Overlay */}
                {mobileMenuOpen && (
                    <div
                        className="lg:hidden fixed inset-0 bg-black/50 z-40"
                        onClick={() => setMobileMenuOpen(false)}
                    />
                )}

                {/* Sidebar - Desktop always visible, Mobile slide-in */}
                <aside className={`
                    fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-slate-200 overflow-y-auto z-50 transition-transform duration-300
                    lg:translate-x-0
                    ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                `}>
                    <nav className="p-4 space-y-2 flex flex-col h-full">
                        <div className="space-y-2">
                            {navigation.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-700 hover:bg-teal-50 hover:text-teal-600 transition group"
                                    >
                                        <Icon className="w-5 h-5 group-hover:scale-110 transition" />
                                        <span className="font-medium">{item.name}</span>
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Sign Out button at bottom */}
                        <div className="mt-auto pt-4 border-t border-slate-200">
                            <button
                                onClick={() => router.push('/api/auth/signout')}
                                className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition group w-full"
                            >
                                <LogOut className="w-5 h-5 group-hover:scale-110 transition" />
                                <span className="font-medium">Sign Out</span>
                            </button>
                        </div>
                    </nav>
                </aside>

                {/* Main Content - Responsive padding */}
                <main className="flex-1 lg:ml-64 p-4 md:p-6 lg:p-8 max-w-7xl w-full">
                    {children}
                </main>
            </div>
        </div>
    );
}
