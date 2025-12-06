import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function CTA() {
    return (
        <section className="py-24 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-600 via-emerald-600 to-green-600" />
            <div className="absolute inset-0 opacity-10"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                }}
            />

            <div className="container mx-auto px-6 text-center relative">
                <h2 className="text-4xl lg:text-6xl font-extrabold text-white mb-6 animate-fadeIn">
                    Ready to Transform Your Health?
                </h2>
                <p className="text-xl text-teal-50 mb-10 max-w-2xl mx-auto">
                    Join thousands using AI-powered insights to stay motivated and achieve their goals
                </p>

                <Link
                    href="/signup"
                    className="inline-flex items-center gap-3 bg-white text-teal-600 px-10 py-5 rounded-xl text-xl font-bold hover:bg-slate-50 transition shadow-2xl hover:scale-105 transform group"
                >
                    Get Started for Free
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition" />
                </Link>

                <p className="mt-8 text-teal-100 text-lg">
                    No credit card · Free forever · 30 second setup
                </p>
            </div>
        </section>
    );
}
