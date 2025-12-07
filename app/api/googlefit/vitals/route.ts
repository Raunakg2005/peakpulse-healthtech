import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { getHeartRateData, getBodyData } from '@/lib/googlefit';

// GET - Sync Google Fit vitals data
export async function POST(req: NextRequest) {
    try {
        console.log('🔍 Google Fit Vitals Sync Started');

        const session = await getServerSession();
        if (!session?.user?.email) {
            console.log('❌ No session found');
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        console.log('✅ Session found:', session.user.email);

        await dbConnect();

        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            console.log('❌ User not found in database');
            return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
        }

        console.log('✅ User found:', user.email);
        console.log('Google Fit connected:', user.googleFit?.isConnected);

        if (!user.googleFit?.isConnected) {
            console.log('❌ Google Fit not connected for user');
            return NextResponse.json({
                success: false,
                error: 'Google Fit not connected'
            }, { status: 400 });
        }

        const { days } = await req.json();
        const numDays = days || 7;

        console.log('📊 Syncing vitals for', numDays, 'days');

        // Calculate date range
        const endTime = new Date();
        const startTime = new Date();
        startTime.setDate(startTime.getDate() - numDays);

        console.log('📅 Date range:', startTime.toISOString(), 'to', endTime.toISOString());

        let heartRateData;
        let bodyData;

        try {
            // Fetch heart rate data
            console.log('❤️ Fetching heart rate data...');
            heartRateData = await getHeartRateData(user._id.toString(), startTime, endTime);
            console.log('✅ Heart rate data fetched');

            // Fetch body data (weight, height, body fat)
            console.log('⚖️ Fetching body data...');
            bodyData = await getBodyData(user._id.toString(), startTime, endTime);
            console.log('✅ Body data fetched');

        } catch (fetchError: any) {
            console.error('❌ Error fetching Google Fit vitals:', fetchError.message);
            throw fetchError;
        }

        // Process and extract vitals from Google Fit data
        const vitals = processGoogleFitVitals(heartRateData, bodyData);

        console.log('✅ Vitals processed:', vitals);

        // Update last sync time
        await User.findByIdAndUpdate(user._id, {
            $set: { 'googleFit.lastSync': new Date() }
        });

        return NextResponse.json({
            success: true,
            vitals,
            source: 'google_fit'
        });

    } catch (error: any) {
        console.error('❌ Google Fit vitals sync error:', error.message);
        console.error('Error details:', error);

        // Check if it's an auth error
        if (error.message?.includes('401') || error.message?.includes('403')) {
            console.log('🔄 Auth error detected, user needs to reconnect');
            return NextResponse.json({
                success: false,
                error: 'Google Fit authorization expired. Please reconnect.',
                needsReauth: true
            }, { status: 401 });
        }

        return NextResponse.json({
            success: false,
            error: error.message || 'Failed to sync Google Fit vitals',
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, { status: 500 });
    }
}

function processGoogleFitVitals(heartRateData: any, bodyData: any) {
    const vitals: any = {
        heartRate: null,
        restingHeartRate: null,
        weight: null,
        height: null,
        bodyFat: null
    };

    // Process heart rate data
    if (heartRateData?.bucket) {
        const heartRates: number[] = [];

        heartRateData.bucket.forEach((bucket: any) => {
            bucket.dataset?.forEach((dataset: any) => {
                dataset.point?.forEach((point: any) => {
                    const bpm = point.value?.[0]?.fpVal;
                    if (bpm) {
                        heartRates.push(bpm);
                    }
                });
            });
        });

        if (heartRates.length > 0) {
            // Calculate average heart rate
            vitals.heartRate = Math.round(heartRates.reduce((a, b) => a + b, 0) / heartRates.length);

            // Estimate resting heart rate (lowest 10% of readings)
            const sorted = heartRates.sort((a, b) => a - b);
            const restingCount = Math.max(1, Math.floor(sorted.length * 0.1));
            vitals.restingHeartRate = Math.round(
                sorted.slice(0, restingCount).reduce((a, b) => a + b, 0) / restingCount
            );
        }
    }

    // Process body data
    if (bodyData?.bucket) {
        bodyData.bucket.forEach((bucket: any) => {
            bucket.dataset?.forEach((dataset: any, index: number) => {
                dataset.point?.forEach((point: any) => {
                    const value = point.value?.[0]?.fpVal;
                    if (value) {
                        switch (index) {
                            case 0: // weight
                                vitals.weight = value; // in kg
                                break;
                            case 1: // height
                                vitals.height = value * 100; // convert m to cm
                                break;
                            case 2: // body fat percentage
                                vitals.bodyFat = value;
                                break;
                        }
                    }
                });
            });
        });
    }

    return vitals;
}
