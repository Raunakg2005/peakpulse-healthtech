import Link from 'next/link';
import { Activity } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-slate-900 text-slate-400 py-12">
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="bg-gradient-to-br from-teal-500 to-emerald-500 p-2 rounded-lg">
                            <Activity className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-bold text-white">PeakPulse</span>
                    </div>

                    <p className="text-sm">
                        © 2025 PeakPulse. Powered by 7 ML Models + Quantum Computing.
                    </p>

                    <div className="flex gap-6">
                        <Link href="#" className="hover:text-teal-400 transition">Terms</Link>
                        <Link href="#" className="hover:text-teal-400 transition">Privacy</Link>
                        <Link href="#" className="hover:text-teal-400 transition">Contact</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
