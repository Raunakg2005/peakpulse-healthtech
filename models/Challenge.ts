import mongoose, { Schema, Model } from 'mongoose';

export interface IChallenge {
    _id: mongoose.Types.ObjectId;
    title: string;
    description: string;
    category: 'fitness' | 'meditation' | 'nutrition' | 'social';
    difficulty: number; // 1-5
    points: number;
    duration: 'daily' | 'weekly' | 'monthly';

    criteria: {
        type: string;
        target: number;
        metric: string;
    };

    active: boolean;
    createdBy?: string; // 'admin' or userId
    imageUrl?: string;
    createdAt: Date;
    updatedAt: Date;
}

const ChallengeSchema = new Schema<IChallenge>({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        enum: ['fitness', 'meditation', 'nutrition', 'social'],
        required: true,
    },
    difficulty: {
        type: Number,
        min: 1,
        max: 5,
        required: true,
    },
    points: {
        type: Number,
        required: true,
    },
    duration: {
        type: String,
        enum: ['daily', 'weekly', 'monthly'],
        required: true,
    },
    criteria: {
        type: {
            type: String,
            required: true,
        },
        target: {
            type: Number,
            required: true,
        },
        metric: {
            type: String,
            required: true,
        },
    },
    active: {
        type: Boolean,
        default: true,
    },
    createdBy: String,
    imageUrl: String,
}, {
    timestamps: true,
});

// Indexes
ChallengeSchema.index({ category: 1, active: 1 });
ChallengeSchema.index({ difficulty: 1 });

const Challenge: Model<IChallenge> = mongoose.models.Challenge || mongoose.model<IChallenge>('Challenge', ChallengeSchema);

export default Challenge;
