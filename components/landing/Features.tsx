import { Brain, Target, Zap, ArrowRight, Award } from 'lucide-react';

const features = [
    {
        icon: Brain,
        title: 'Predictive Analytics',
        description: 'Know your dropout risk (93.7% accurate), streak predictions (83.5%), and engagement level powered by ensemble ML models.',
        color: 'teal',
        stats: ['93.7%', '83.5%'],
    },
    {
        icon: Target,
        title: 'Smart Challenges',
        description: 'AI recommends perfect challenges (70.3% accuracy). Difficulty auto-calibrates with 99% precision based on your performance.',
        color: 'emerald',
        stats: ['70.3%', '99%'],
    },
    {
        icon: Zap,
        title: 'Quantum ML',
        description: 'World\'s first hybrid quantum-classical health predictor. Experience cutting-edge personalization with 4 qubits and 36 trainable parameters.',
        color: 'amber',
        stats: ['4 qubits', '36 params'],
    },
];

const colorClasses = {
    teal: {
        bg: 'from-white to-teal-50/30',
        border: 'hover:border-teal-500',
        iconBg: 'from-teal-500 to-teal-600',
        text: 'text-teal-600',
        gradient: 'from-teal-500/5',
    },
    emerald: {
        bg: 'from-white to-emerald-50/30',
        border: 'hover:border-emerald-500',
        iconBg: 'from-emerald-500 to-emerald-600',
        text: 'text-emerald-600',
        gradient: 'from-emerald-500/5',
    },
    amber: {
        bg: 'from-white to-amber-50/30',
        border: 'hover:border-amber-500',
        iconBg: 'from-amber-500 to-amber-600',
        text: 'text-amber-600',
        gradient: 'from-amber-500/5',
    },
};

export default function Features() {
    return (
        <section id="features" className="py-20 bg-white">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 bg-teal-50 text-teal-700 px-4 py-2 rounded-full mb-4">
                        <Award className="w-4 h-4" />
                        <span className="text-sm font-semibold">Production-Ready ML</span>
                    </div>
                    <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
                        Powered by <span className="bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">Advanced AI</span>
                    </h2>
                    <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                        Seven trained models working together to keep you motivated and on track
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {features.map((feature) => {
                        const Icon = feature.icon;
                        const colors = colorClasses[feature.color as keyof typeof colorClasses];

                        return (
                            <div
                                key={feature.title}
                                className={`group relative p-8 rounded-2xl border-2 border-slate-200 ${colors.border} transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 bg-gradient-to-br ${colors.bg}`}
                            >
                                <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition`} />
                                <div className="relative">
                                    <div className={`bg-gradient-to-br ${colors.iconBg} w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition shadow-lg`}>
                                        <Icon className="w-7 h-7 text-white" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-900 mb-4">
                                        {feature.title}
                                    </h3>
                                    <p className="text-slate-600 leading-relaxed mb-4">
                                        {feature.description}
                                    </p>
                                    <div className={`flex items-center gap-2 ${colors.text} font-semibold group-hover:gap-3 transition-all`}>
                                        <span>Learn more</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
