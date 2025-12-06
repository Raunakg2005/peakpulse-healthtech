import mongoose, { Schema, Model } from 'mongoose';

export interface IComment {
    userId: mongoose.Types.ObjectId;
    content: string;
    createdAt: Date;
}

export interface ISocialPost {
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    content: string;
    category?: string;
    activityId?: mongoose.Types.ObjectId;
    likes: Array<{ userId: mongoose.Types.ObjectId }>;
    comments: IComment[];
    imageUrl?: string;
    createdAt: Date;
    updatedAt: Date;
}

const CommentSchema = new Schema<IComment>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    content: {
        type: String,
        required: true,
        maxlength: 500,
    },
}, {
    timestamps: true,
});

const SocialPostSchema = new Schema<ISocialPost>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    content: {
        type: String,
        required: true,
        maxlength: 1000,
    },
    category: {
        type: String,
        default: 'general',
    },
    activityId: {
        type: Schema.Types.ObjectId,
        ref: 'Activity',
    },
    likes: [{
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
    }],
    comments: [CommentSchema],
    imageUrl: String,
}, {
    timestamps: true,
});

// Indexes for feed queries
SocialPostSchema.index({ createdAt: -1 });
SocialPostSchema.index({ userId: 1, createdAt: -1 });

const SocialPost: Model<ISocialPost> = mongoose.models.SocialPost || mongoose.model<ISocialPost>('SocialPost', SocialPostSchema);

export default SocialPost;
