'use client';

import { useState, useEffect } from 'react';
import { Heart, Activity as ActivityIcon, Droplet, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface VitalsData {
    averages: {
        heartRate: number;
        restingHeartRate: number;
        bloodOxygen: number;
        bloodPressureSystolic: number;
        bloodPressureDiastolic: number;
        heartRateVariability: number;
    };
    records: any[];
    count: number;
    period: string;
}

export default function VitalsMonitor() {
    const [vitals, setVitals] = useState<VitalsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [formData, setFormData] = useState({
        heartRate: '',
        restingHeartRate: '',
        bloodOxygen: '',
        bloodPressureSystolic: '',
        bloodPressureDiastolic: '',
        heartRateVariability: ''
    });

    useEffect(() => {
        fetchVitals();
    }, []);

    const fetchVitals = async () => {
        try {
            const response = await fetch('/api/vitals?days=7');
            const data = await response.json();
            if (data.success) {
                setVitals(data.data);
            }
        } catch (error) {
            console.error('Error fetching vitals:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            const response = await fetch('/api/vitals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    heartRate: formData.heartRate ? parseFloat(formData.heartRate) : undefined,
                    restingHeartRate: formData.restingHeartRate ? parseFloat(formData.restingHeartRate) : undefined,
                    bloodOxygen: formData.bloodOxygen ? parseFloat(formData.bloodOxygen) : undefined,
                    bloodPressureSystolic: formData.bloodPressureSystolic ? parseFloat(formData.bloodPressureSystolic) : undefined,
                    bloodPressureDiastolic: formData.bloodPressureDiastolic ? parseFloat(formData.bloodPressureDiastolic) : undefined,
                    heartRateVariability: formData.heartRateVariability ? parseFloat(formData.heartRateVariability) : undefined
                })
            });

            if (response.ok) {
                setShowAddModal(false);
                setFormData({
                    heartRate: '',
                    restingHeartRate: '',
                    bloodOxygen: '',
                    bloodPressureSystolic: '',
                    bloodPressureDiastolic: '',
                    heartRateVariability: ''
                });
                fetchVitals(); // Refresh data
            }
        } catch (error) {
            console.error('Error recording vitals:', error);
        }
    };

    const getHealthStatus = (metric: string, value: number) => {
        switch (metric) {
            case 'heartRate':
                if (value >= 60 && value <= 100) return { status: 'good', color: 'text-green-600', icon: TrendingUp };
                if (value > 100) return { status: 'high', color: 'text-orange-600', icon: TrendingUp };
                return { status: 'low', color: 'text-blue-600', icon: TrendingDown };
            
            case 'bloodOxygen':
                if (value >= 95) return { status: 'good', color: 'text-green-600', icon: TrendingUp };
                if (value >= 90) return { status: 'fair', color: 'text-yellow-600', icon: Minus };
                return { status: 'low', color: 'text-red-600', icon: TrendingDown };
            
            case 'bloodPressure':
                if (value <= 120) return { status: 'good', color: 'text-green-600', icon: TrendingUp };
                if (value <= 139) return { status: 'elevated', color: 'text-yellow-600', icon: TrendingUp };
                return { status: 'high', color: 'text-red-600', icon: TrendingUp };
            
            case 'hrv':
                if (value >= 50) return { status: 'good', color: 'text-green-600', icon: TrendingUp };
                if (value >= 30) return { status: 'fair', color: 'text-yellow-600', icon: Minus };
                return { status: 'low', color: 'text-orange-600', icon: TrendingDown };
            
            default:
                return { status: 'unknown', color: 'text-gray-600', icon: Minus };
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <Heart className="w-12 h-12 mx-auto mb-4 text-rose-500 animate-pulse" />
                    <p className="text-gray-600">Loading vital signs...</p>
                </div>
            </div>
        );
    }

    const averages = vitals?.averages || {
        heartRate: 0,
        restingHeartRate: 0,
        bloodOxygen: 0,
        bloodPressureSystolic: 0,
        bloodPressureDiastolic: 0,
        heartRateVariability: 0
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                        💓 Vital Signs Monitor
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                        Track your heart health and vital metrics
                    </p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-lg hover:from-rose-600 hover:to-pink-600 transition-all shadow-md hover:shadow-lg"
                >
                    + Add Reading
                </button>
            </div>

            {/* Vitals Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Heart Rate */}
                <div className="group bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl p-6 border-2 border-rose-100 hover:border-rose-300 transition-all hover:scale-105 hover:shadow-lg">
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-gradient-to-br from-rose-500 to-pink-500 rounded-lg group-hover:scale-110 transition-transform">
                            <Heart className="w-6 h-6 text-white" />
                        </div>
                        {averages.heartRate > 0 && (() => {
                            const status = getHealthStatus('heartRate', averages.heartRate);
                            const Icon = status.icon;
                            return <Icon className={`w-5 h-5 ${status.color}`} />;
                        })()}
                    </div>
                    <h3 className="text-sm font-medium text-gray-600 mb-1">Heart Rate</h3>
                    <p className="text-3xl font-bold text-gray-900">
                        {averages.heartRate > 0 ? averages.heartRate : '--'}
                        <span className="text-sm font-normal text-gray-500 ml-2">BPM</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-2">Normal: 60-100 BPM</p>
                </div>

                {/* Resting Heart Rate */}
                <div className="group bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border-2 border-blue-100 hover:border-blue-300 transition-all hover:scale-105 hover:shadow-lg">
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg group-hover:scale-110 transition-transform">
                            <ActivityIcon className="w-6 h-6 text-white" />
                        </div>
                    </div>
                    <h3 className="text-sm font-medium text-gray-600 mb-1">Resting HR</h3>
                    <p className="text-3xl font-bold text-gray-900">
                        {averages.restingHeartRate > 0 ? averages.restingHeartRate : '--'}
                        <span className="text-sm font-normal text-gray-500 ml-2">BPM</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-2">Lower is better</p>
                </div>

                {/* Blood Oxygen */}
                <div className="group bg-gradient-to-br from-teal-50 to-emerald-50 rounded-xl p-6 border-2 border-teal-100 hover:border-teal-300 transition-all hover:scale-105 hover:shadow-lg">
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-lg group-hover:scale-110 transition-transform">
                            <Droplet className="w-6 h-6 text-white" />
                        </div>
                        {averages.bloodOxygen > 0 && (() => {
                            const status = getHealthStatus('bloodOxygen', averages.bloodOxygen);
                            const Icon = status.icon;
                            return <Icon className={`w-5 h-5 ${status.color}`} />;
                        })()}
                    </div>
                    <h3 className="text-sm font-medium text-gray-600 mb-1">Blood Oxygen (SpO2)</h3>
                    <p className="text-3xl font-bold text-gray-900">
                        {averages.bloodOxygen > 0 ? averages.bloodOxygen : '--'}
                        <span className="text-sm font-normal text-gray-500 ml-2">%</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-2">Normal: 95-100%</p>
                </div>

                {/* Blood Pressure */}
                <div className="group bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-100 hover:border-purple-300 transition-all hover:scale-105 hover:shadow-lg">
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg group-hover:scale-110 transition-transform">
                            <TrendingUp className="w-6 h-6 text-white" />
                        </div>
                        {averages.bloodPressureSystolic > 0 && (() => {
                            const status = getHealthStatus('bloodPressure', averages.bloodPressureSystolic);
                            const Icon = status.icon;
                            return <Icon className={`w-5 h-5 ${status.color}`} />;
                        })()}
                    </div>
                    <h3 className="text-sm font-medium text-gray-600 mb-1">Blood Pressure</h3>
                    <p className="text-3xl font-bold text-gray-900">
                        {averages.bloodPressureSystolic > 0 && averages.bloodPressureDiastolic > 0
                            ? `${Math.round(averages.bloodPressureSystolic)}/${Math.round(averages.bloodPressureDiastolic)}`
                            : '--/--'}
                        <span className="text-sm font-normal text-gray-500 ml-2">mmHg</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-2">Normal: &lt;120/80</p>
                </div>

                {/* Heart Rate Variability */}
                <div className="group bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border-2 border-amber-100 hover:border-amber-300 transition-all hover:scale-105 hover:shadow-lg">
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg group-hover:scale-110 transition-transform">
                            <ActivityIcon className="w-6 h-6 text-white" />
                        </div>
                        {averages.heartRateVariability > 0 && (() => {
                            const status = getHealthStatus('hrv', averages.heartRateVariability);
                            const Icon = status.icon;
                            return <Icon className={`w-5 h-5 ${status.color}`} />;
                        })()}
                    </div>
                    <h3 className="text-sm font-medium text-gray-600 mb-1">HRV</h3>
                    <p className="text-3xl font-bold text-gray-900">
                        {averages.heartRateVariability > 0 ? Math.round(averages.heartRateVariability) : '--'}
                        <span className="text-sm font-normal text-gray-500 ml-2">ms</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-2">Higher is better</p>
                </div>

                {/* Data Count */}
                <div className="group bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-6 border-2 border-gray-100 hover:border-gray-300 transition-all hover:scale-105 hover:shadow-lg">
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-gradient-to-br from-gray-500 to-slate-500 rounded-lg group-hover:scale-110 transition-transform">
                            <TrendingUp className="w-6 h-6 text-white" />
                        </div>
                    </div>
                    <h3 className="text-sm font-medium text-gray-600 mb-1">Readings</h3>
                    <p className="text-3xl font-bold text-gray-900">
                        {vitals?.count || 0}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">Last {vitals?.period || '7 days'}</p>
                </div>
            </div>

            {/* Add Vitals Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6">
                        <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                            Add Vital Signs Reading
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Heart Rate (BPM)
                                </label>
                                <input
                                    type="number"
                                    value={formData.heartRate}
                                    onChange={(e) => setFormData({ ...formData, heartRate: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                                    placeholder="e.g., 72"
                                    min="30"
                                    max="220"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Resting Heart Rate (BPM)
                                </label>
                                <input
                                    type="number"
                                    value={formData.restingHeartRate}
                                    onChange={(e) => setFormData({ ...formData, restingHeartRate: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                                    placeholder="e.g., 60"
                                    min="40"
                                    max="100"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Blood Oxygen (SpO2 %)
                                </label>
                                <input
                                    type="number"
                                    value={formData.bloodOxygen}
                                    onChange={(e) => setFormData({ ...formData, bloodOxygen: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                                    placeholder="e.g., 98"
                                    min="70"
                                    max="100"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        BP Systolic (mmHg)
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.bloodPressureSystolic}
                                        onChange={(e) => setFormData({ ...formData, bloodPressureSystolic: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                                        placeholder="120"
                                        min="70"
                                        max="200"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        BP Diastolic (mmHg)
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.bloodPressureDiastolic}
                                        onChange={(e) => setFormData({ ...formData, bloodPressureDiastolic: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                                        placeholder="80"
                                        min="40"
                                        max="130"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Heart Rate Variability (ms)
                                </label>
                                <input
                                    type="number"
                                    value={formData.heartRateVariability}
                                    onChange={(e) => setFormData({ ...formData, heartRateVariability: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                                    placeholder="e.g., 65"
                                    min="10"
                                    max="200"
                                />
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-lg hover:from-rose-600 hover:to-pink-600 transition-all shadow-md hover:shadow-lg"
                                >
                                    Save Reading
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
