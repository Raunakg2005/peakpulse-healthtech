'use client';

import { useState, useEffect } from 'react';
import { Activity, Footprints, Flame, MapPin, TrendingUp, Link as LinkIcon, Unlink, CheckCircle } from 'lucide-react';

interface GoogleFitData {
    steps: number;
    calories: number;
    distance: number; // in meters
    activeMinutes: number;
}

interface GoogleFitStatus {
    isConnected: boolean;
    lastSync?: string;
}

export default function GoogleFitIntegration() {
    const [status, setStatus] = useState<GoogleFitStatus>({ isConnected: false });
    const [data, setData] = useState<GoogleFitData | null>(null);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);

    useEffect(() => {
        checkConnection();
    }, []);

    const checkConnection = async () => {
        try {
            const response = await fetch('/api/user/profile');
            const result = await response.json();

            if (result.success && result.user?.googleFit) {
                const isConnected = result.user.googleFit.isConnected || false;
                setStatus({
                    isConnected,
                    lastSync: result.user.googleFit.lastSync
                });

                // Auto-fetch data if connected
                if (isConnected) {
                    console.log('✅ Google Fit connected, auto-fetching data...');
                    fetchGoogleFitData();
                } else {
                    console.log('⚠️ Google Fit not connected');
                }
            }
        } catch (error) {
            console.error('Error checking Google Fit connection:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchGoogleFitData = async () => {
        setSyncing(true);
        try {
            const response = await fetch('/api/googlefit/data?type=activity&days=7');
            const result = await response.json();

            if (result.success && result.data?.bucket) {
                // Process the data
                const processedData = processActivityData(result.data);
                setData(processedData);
                setStatus(prev => ({ ...prev, lastSync: new Date().toISOString() }));
            } else if (result.needsReauth) {
                // Need to reconnect
                setStatus({ isConnected: false });
            }
        } catch (error) {
            console.error('Error fetching Google Fit data:', error);
        } finally {
            setSyncing(false);
        }
    };

    const processActivityData = (rawData: any): GoogleFitData => {
        let totalSteps = 0;
        let totalCalories = 0;
        let totalDistance = 0;
        let totalActiveMinutes = 0;

        rawData.bucket?.forEach((bucket: any) => {
            bucket.dataset?.forEach((dataset: any, index: number) => {
                dataset.point?.forEach((point: any) => {
                    const value = point.value?.[0];
                    if (value) {
                        switch (index) {
                            case 0: // steps
                                totalSteps += value.intVal || value.steps || 0;
                                break;
                            case 1: // calories
                                totalCalories += value.fpVal || value.calories || 0;
                                break;
                            case 2: // distance
                                totalDistance += value.fpVal || value.distance || 0;
                                break;
                            case 3: // active minutes
                                totalActiveMinutes += value.intVal || value.activeMinutes || 0;
                                break;
                        }
                    }
                });
            });
        });

        return {
            steps: Math.round(totalSteps),
            calories: Math.round(totalCalories),
            distance: Math.round(totalDistance),
            activeMinutes: Math.round(totalActiveMinutes)
        };
    };

    const handleConnect = () => {
        window.location.href = '/api/googlefit/connect';
    };

    const handleDisconnect = async () => {
        if (!confirm('Are you sure you want to disconnect Google Fit?')) return;

        try {
            const response = await fetch('/api/googlefit/disconnect', {
                method: 'POST'
            });

            if (response.ok) {
                setStatus({ isConnected: false });
                setData(null);
            }
        } catch (error) {
            console.error('Error disconnecting Google Fit:', error);
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-24 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    // Show connection card with appropriate status
    return (
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-8 shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-300/20 rounded-full blur-2xl"></div>

            <div className="relative">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/30">
                            <Activity className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <div className="flex items-center gap-3">
                                <h2 className="text-2xl font-bold text-white">Google Fit</h2>
                                {status.isConnected && (
                                    <span className="px-3 py-1 bg-green-500/30 backdrop-blur-sm text-white text-sm font-semibold rounded-full flex items-center gap-1 border border-green-400/50">
                                        <CheckCircle className="w-4 h-4" />
                                        Connected
                                    </span>
                                )}
                            </div>
                            <p className="text-indigo-100 text-sm mt-1">
                                {status.isConnected
                                    ? `Last synced: ${status.lastSync ? new Date(status.lastSync).toLocaleString() : 'Never'}`
                                    : 'Sync your activity data automatically'
                                }
                            </p>
                        </div>
                    </div>

                    {status.isConnected && (
                        <div className="flex gap-2">
                            <button
                                onClick={fetchGoogleFitData}
                                disabled={syncing}
                                className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-all border border-white/30 disabled:opacity-50 flex items-center gap-2"
                            >
                                {syncing ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Syncing...
                                    </>
                                ) : (
                                    <>
                                        <TrendingUp className="w-4 h-4" />
                                        Sync Now
                                    </>
                                )}
                            </button>
                            <button
                                onClick={handleDisconnect}
                                className="px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-lg hover:bg-red-500/30 transition-all border border-white/30 flex items-center gap-2"
                            >
                                <Unlink className="w-4 h-4" />
                                Disconnect
                            </button>
                        </div>
                    )}
                </div>

                <div className="grid md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                        <Footprints className="w-6 h-6 text-white mb-2" />
                        <p className="text-white font-semibold">Steps Tracking</p>
                        <p className="text-indigo-100 text-sm">{status.isConnected ? 'Syncing daily steps' : 'Daily step count'}</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                        <Flame className="w-6 h-6 text-white mb-2" />
                        <p className="text-white font-semibold">Calories Burned</p>
                        <p className="text-indigo-100 text-sm">{status.isConnected ? 'Tracking energy' : 'Energy expenditure'}</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                        <MapPin className="w-6 h-6 text-white mb-2" />
                        <p className="text-white font-semibold">Distance</p>
                        <p className="text-indigo-100 text-sm">{status.isConnected ? 'Recording movement' : 'Total distance traveled'}</p>
                    </div>
                </div>

                {!status.isConnected && (
                    <button
                        onClick={handleConnect}
                        className="w-full md:w-auto px-8 py-4 bg-white text-indigo-600 rounded-xl font-bold hover:bg-indigo-50 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                    >
                        <LinkIcon className="w-5 h-5" />
                        Connect Google Fit
                    </button>
                )}
            </div>
        </div>
    );
}
