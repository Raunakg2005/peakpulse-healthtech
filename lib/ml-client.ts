/**
 * ML Service Client
 * TypeScript client for communicating with the Python ML service
 */

export interface UserProfile {
    user_id: string;
    days_active: number;
    avg_steps_last_7_days: number;
    meditation_streak: number;
    challenge_completion_rate: number;
    social_engagement_score: number;
    preferred_activity_times: string[];
    response_rate_to_notifications: number;
    mood_correlation_with_exercise?: number;
}

export interface ChallengeRecommendation {
    challenge_id: string;
    challenge_name: string;
    confidence_score: number;
    reasoning: string;
    difficulty_level: number;
    estimated_completion_time: number;
}

export interface DropoutPrediction {
    user_id: string;
    dropout_probability: number;
    risk_level: 'low' | 'medium' | 'high';
    recommended_interventions: string[];
    days_until_predicted_dropout: number;
}

export interface StreakPrediction {
    user_id: string;
    streak_break_probability: number;
    current_streak: number;
    recommended_actions: string[];
}

export interface MotivationMessage {
    message: string;
    tone: string;
    personalization_score: number;
}

export interface DifficultyCalibration {
    current_difficulty: number;
    recommended_difficulty: number;
    reasoning: string;
    confidence: number;
}

class MLServiceClient {
    private baseUrl: string;

    constructor(baseUrl: string = 'http://localhost:8000') {
        this.baseUrl = baseUrl;
    }

    /**
     * Get personalized challenge recommendations
     */
    async getRecommendations(profile: UserProfile): Promise<ChallengeRecommendation[]> {
        const response = await fetch(`${this.baseUrl}/api/recommend-challenge`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(profile),
        });

        if (!response.ok) {
            throw new Error(`ML Service error: ${response.statusText}`);
        }

        return response.json();
    }

    /**
     * Predict user dropout risk
     */
    async predictDropout(profile: UserProfile): Promise<DropoutPrediction> {
        const response = await fetch(`${this.baseUrl}/api/predict-dropout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(profile),
        });

        if (!response.ok) {
            throw new Error(`ML Service error: ${response.statusText}`);
        }

        return response.json();
    }

    /**
     * Predict streak break probability
     */
    async predictStreak(profile: UserProfile): Promise<StreakPrediction> {
        const response = await fetch(`${this.baseUrl}/api/predict-streak`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(profile),
        });

        if (!response.ok) {
            throw new Error(`ML Service error: ${response.statusText}`);
        }

        return response.json();
    }

    /**
     * Generate personalized motivation message
     */
    async generateMotivation(profile: UserProfile): Promise<MotivationMessage> {
        const response = await fetch(`${this.baseUrl}/api/generate-motivation`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(profile),
        });

        if (!response.ok) {
            throw new Error(`ML Service error: ${response.statusText}`);
        }

        return response.json();
    }

    /**
     * Calibrate challenge difficulty
     */
    async calibrateDifficulty(
        profile: UserProfile,
        currentDifficulty: number
    ): Promise<DifficultyCalibration> {
        const response = await fetch(`${this.baseUrl}/api/calibrate-difficulty`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ...profile, current_difficulty: currentDifficulty }),
        });

        if (!response.ok) {
            throw new Error(`ML Service error: ${response.statusText}`);
        }

        return response.json();
    }

    /**
     * Check ML service health
     */
    async healthCheck(): Promise<{ status: string; models_loaded: boolean }> {
        const response = await fetch(`${this.baseUrl}/health`);

        if (!response.ok) {
            throw new Error(`ML Service error: ${response.statusText}`);
        }

        return response.json();
    }
}

// Export singleton instance
export const mlClient = new MLServiceClient(
    process.env.NEXT_PUBLIC_ML_SERVICE_URL || 'http://localhost:8000'
);

export default MLServiceClient;
