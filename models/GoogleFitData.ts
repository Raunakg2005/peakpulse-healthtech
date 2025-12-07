import mongoose, { Schema, Model } from 'mongoose';

export interface IGoogleFitData {
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    dataType: 'activity' | 'heart_rate' | 'sleep' | 'body';
    date: Date;
    data: {
        // Activity data
        steps?: number;
        calories?: number;
        distance?: number;
        activeMinutes?: number;

        // Heart rate data
        heartRate?: number;
        restingHeartRate?: number;
        maxHeartRate?: number;
        minHeartRate?: number;

        // Sleep data
        sleepDuration?: number;
        deepSleep?: number;
        lightSleep?: number;
        remSleep?: number;

        // Body data
        weight?: number;
        height?: number;
        bodyFat?: number;
        bmi?: number;
    };
    source: 'google_fit' | 'manual';
    syncedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

const GoogleFitDataSchema = new Schema<IGoogleFitData>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    dataType: {
        type: String,
        enum: ['activity', 'heart_rate', 'sleep', 'body'],
        required: true
    },
    date: {
        type: Date,
        required: true,
        index: true
    },
    data: {
        // Activity
        steps: Number,
        calories: Number,
        distance: Number,
        activeMinutes: Number,

        // Heart rate
        heartRate: Number,
        restingHeartRate: Number,
        maxHeartRate: Number,
        minHeartRate: Number,

        // Sleep
        sleepDuration: Number,
        deepSleep: Number,
        lightSleep: Number,
        remSleep: Number,

        // Body
        weight: Number,
        height: Number,
        bodyFat: Number,
        bmi: Number
    },
    source: {
        type: String,
        enum: ['google_fit', 'manual'],
        default: 'google_fit'
    },
    syncedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Compound index for efficient queries
GoogleFitDataSchema.index({ userId: 1, dataType: 1, date: -1 });

const GoogleFitData: Model<IGoogleFitData> =
    (mongoose.models.GoogleFitData as Model<IGoogleFitData>) ||
    mongoose.model<IGoogleFitData>('GoogleFitData', GoogleFitDataSchema);

export default GoogleFitData;
