import mongoose, { Schema, Model } from 'mongoose';

export interface IUserChallenge {
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    challengeId: mongoose.Types.ObjectId;
    status: 'active' | 'completed' | 'failed';
    progress: number;
    startedAt: Date;
    completedAt?: Date;
    pointsEarned: number;
    createdAt: Date;
    updatedAt: Date;
}

const UserChallengeSchema = new Schema<IUserChallenge>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    challengeId: {
        type: Schema.Types.ObjectId,
        ref: 'Challenge',
        required: true,
    },
    status: {
        type: String,
        enum: ['active', 'completed', 'failed'],
        default: 'active',
    },
    progress: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
    },
    startedAt: {
        type: Date,
        required: true,
        default: Date.now,
    },
    completedAt: Date,
    pointsEarned: {
        type: Number,
        default: 0,
    },
}, {
    timestamps: true,
});

// Indexes
UserChallengeSchema.index({ userId: 1, status: 1 });
UserChallengeSchema.index({ userId: 1, challengeId: 1 });

const UserChallenge: Model<IUserChallenge> = mongoose.models.UserChallenge || mongoose.model<IUserChallenge>('UserChallenge', UserChallengeSchema);

export default UserChallenge;
