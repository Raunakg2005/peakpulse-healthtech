import { Users, Activity, Award, Clock } from 'lucide-react';

const stats = [
    { icon: Users, value: '1000+', label: 'Active Users', color: 'text-teal-600' },
    { icon: Activity, value: '93.7%', label: 'ML Accuracy', color: 'text-emerald-600' },
    { icon: Award, value: '7', label: 'ML Models', color: 'text-amber-600' },
    { icon: Clock, value: '30s', label: 'Setup Time', color: 'text-teal-600' },
];

export default function Stats() {
    return (
        <section className="py-20 bg-gradient-to-br from-slate-100 to-slate-50">
            <div className="container mx-auto px-6">
                <div className="grid md:grid-cols-4 gap-8">
                    {stats.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <div
                                key={stat.label}
                                className="text-center p-8 bg-white rounded-2xl shadow-lg border border-slate-200 hover:shadow-xl hover:scale-105 transition-all duration-300 group"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <Icon className={`w-12 h-12 ${stat.color} mx-auto mb-4 group-hover:scale-110 transition`} />
                                <div className="text-4xl font-bold text-slate-900 mb-2">{stat.value}</div>
                                <p className="text-slate-600">{stat.label}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
