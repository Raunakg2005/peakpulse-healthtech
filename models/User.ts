import mongoose, { Schema, Model } from 'mongoose';

export interface IUser {
    _id: mongoose.Types.ObjectId;
    email: string;
    name: string;
    password?: string;
    googleId?: string;
    avatar?: string;
    emailVerified: boolean;
    verificationToken?: string;
    resetToken?: string;
    resetTokenExpiry?: Date;
    onboardingCompleted: boolean;
    status?: 'active' | 'non-active' | 'rest-day';

    profile: {
        age?: number;
        gender?: string;
        height?: number;
        heightUnit?: 'cm' | 'ft';
        weight?: number;
        weightUnit?: 'kg' | 'lbs';
        activityLevel?: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extra_active';
        primaryGoal?: string;
        secondaryGoals?: string[];
        fitnessLevel?: 'beginner' | 'intermediate' | 'advanced';
        goals: string[];
        preferences: Record<string, any>;
    };

    stats: {
        totalPoints: number;
        level: number;
        currentStreak: number;
        longestStreak: number;
        lastActiveDate?: Date;
        badges: string[];
        completedChallenges: number;
    };

    mlData: {
        dropoutRisk?: number;
        streakRisk?: number;
        engagementLevel?: string;
        preferredTone?: string;
        lastPrediction?: Date;
    };

    googleFit?: {
        accessToken?: string;
        refreshToken?: string;
        tokenExpiry?: Date;
        isConnected: boolean;
        lastSync?: Date;
        scopes?: string[];
    };

    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    name: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        select: false, // Don't return password by default
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true,
    },
    avatar: String,
    emailVerified: {
        type: Boolean,
        default: false,
    },
    verificationToken: String,
    resetToken: String,
    resetTokenExpiry: Date,
    status: {
        type: String,
        enum: ['active', 'non-active', 'rest-day'],
        default: 'active'
    },

    profile: {
        age: Number,
        gender: String,
        height: Number,
        heightUnit: {
            type: String,
            enum: ['cm', 'ft'],
            default: 'cm'
        },
        weight: Number,
        weightUnit: {
            type: String,
            enum: ['kg', 'lbs'],
            default: 'kg'
        },
        activityLevel: {
            type: String,
            enum: ['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extra_active'],
            default: 'sedentary'
        },
        primaryGoal: String,
        secondaryGoals: {
            type: [String],
            default: []
        },
        fitnessLevel: {
            type: String,
            enum: ['beginner', 'intermediate', 'advanced'],
        },
        goals: {
            type: [String],
            default: [],
        },
        preferences: {
            type: Map,
            of: Schema.Types.Mixed,
            default: {},
        },
    },

    stats: {
        totalPoints: {
            type: Number,
            default: 0,
        },
        level: {
            type: Number,
            default: 1,
        },
        currentStreak: {
            type: Number,
            default: 0,
        },
        longestStreak: {
            type: Number,
            default: 0,
        },
        lastActiveDate: {
            type: Date,
        },
        badges: {
            type: [String],
            default: [],
        },
        completedChallenges: {
            type: Number,
            default: 0,
        },
    },

    mlData: {
        dropoutRisk: Number,
        streakRisk: Number,
        engagementLevel: String,
        preferredTone: String,
        lastPrediction: Date,
    },

    googleFit: {
        accessToken: {
            type: String,
            select: false, // Don't return in queries by default for security
        },
        refreshToken: {
            type: String,
            select: false, // Don't return in queries by default for security
        },
        tokenExpiry: Date,
        isConnected: {
            type: Boolean,
            default: false,
        },
        lastSync: Date,
        scopes: [String],
    },

    onboardingCompleted: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});

const User: Model<IUser> = (mongoose.models.User as Model<IUser>) || mongoose.model<IUser>('User', UserSchema);

export default User;
