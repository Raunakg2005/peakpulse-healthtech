import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import Activity from '@/models/Activity';

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();
        const data = await request.json();

        const {
            heartRate,
            restingHeartRate,
            bloodOxygen,
            bloodPressureSystolic,
            bloodPressureDiastolic,
            heartRateVariability,
            timestamp
        } = data;

        // Create a vitals activity record
        const vitalsActivity = new Activity({
            userId: session.user.email,
            type: 'vitals',
            name: 'Vital Signs Check',
            duration: 1, // 1 minute measurement
            heartRate,
            restingHeartRate,
            bloodOxygen,
            bloodPressureSystolic,
            bloodPressureDiastolic,
            heartRateVariability,
            completedAt: timestamp ? new Date(timestamp) : new Date(),
            completed: true
        });

        await vitalsActivity.save();

        return NextResponse.json({
            success: true,
            message: 'Vital signs recorded successfully',
            data: vitalsActivity
        });
    } catch (error: any) {
        console.error('Error recording vitals:', error);
        return NextResponse.json(
            { error: 'Failed to record vital signs', details: error.message },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const { searchParams } = new URL(request.url);
        const days = parseInt(searchParams.get('days') || '7');

        // Get vitals from the last N days
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const vitalsRecords = await Activity.find({
            userId: session.user.email,
            completedAt: { $gte: startDate },
            $or: [
                { heartRate: { $exists: true } },
                { bloodOxygen: { $exists: true } },
                { bloodPressureSystolic: { $exists: true } }
            ]
        })
        .sort({ completedAt: -1 })
        .limit(100)
        .lean();

        // Calculate averages
        const records = vitalsRecords.filter(r => 
            r.heartRate || r.bloodOxygen || r.bloodPressureSystolic
        );

        const averages = {
            heartRate: 0,
            restingHeartRate: 0,
            bloodOxygen: 0,
            bloodPressureSystolic: 0,
            bloodPressureDiastolic: 0,
            heartRateVariability: 0
        };

        if (records.length > 0) {
            const sums = records.reduce((acc, record) => ({
                heartRate: acc.heartRate + (record.heartRate || 0),
                restingHeartRate: acc.restingHeartRate + (record.restingHeartRate || 0),
                bloodOxygen: acc.bloodOxygen + (record.bloodOxygen || 0),
                bloodPressureSystolic: acc.bloodPressureSystolic + (record.bloodPressureSystolic || 0),
                bloodPressureDiastolic: acc.bloodPressureDiastolic + (record.bloodPressureDiastolic || 0),
                heartRateVariability: acc.heartRateVariability + (record.heartRateVariability || 0)
            }), averages);

            Object.keys(averages).forEach(key => {
                averages[key as keyof typeof averages] = Math.round(
                    (sums[key as keyof typeof sums] / records.length) * 10
                ) / 10;
            });
        }

        return NextResponse.json({
            success: true,
            data: {
                records: vitalsRecords,
                averages,
                count: records.length,
                period: `${days} days`
            }
        });
    } catch (error: any) {
        console.error('Error fetching vitals:', error);
        return NextResponse.json(
            { error: 'Failed to fetch vital signs', details: error.message },
            { status: 500 }
        );
    }
}
