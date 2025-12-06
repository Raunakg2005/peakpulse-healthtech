import mongoose, { Schema, Model } from 'mongoose';

export interface IActivity {
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId | string;
    type: 'exercise' | 'meditation' | 'nutrition' | string;
    name: string;
    duration: number;
    intensity?: 'low' | 'moderate' | 'high' | 'light' | 'vigorous';
    calories?: number;
    caloriesBurned?: number;
    points?: number;
    met?: number;
    completed?: boolean;
    timestamp?: Date;
    notes?: string;
    completedAt: Date;
    createdAt: Date;
}

const ActivitySchema = new Schema<IActivity>({
    userId: {
        type: Schema.Types.Mixed,
        required: true,
        index: true,
    },
    type: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    duration: {
        type: Number,
        required: true,
    },
    intensity: {
        type: String,
        enum: ['low', 'moderate', 'high', 'light', 'vigorous'],
        default: 'moderate',
    },
    calories: {
        type: Number,
        default: 0,
    },
    caloriesBurned: {
        type: Number,
        default: 0,
    },
    met: Number,
    completed: {
        type: Boolean,
        default: false
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    points: {
        type: Number,
        default: 0
    },
    notes: String,
    completedAt: {
        type: Date,
        required: true,
        default: Date.now,
    },
}, {
    timestamps: true,
});

// Compound indexes for efficient queries
ActivitySchema.index({ userId: 1, completedAt: -1 });
ActivitySchema.index({ userId: 1, type: 1, completedAt: -1 });

const Activity: Model<IActivity> = (mongoose.models.Activity as Model<IActivity>) || mongoose.model<IActivity>('Activity', ActivitySchema);

export default Activity;
