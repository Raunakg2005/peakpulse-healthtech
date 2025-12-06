// Badge definitions and criteria
export interface Badge {
    id: string;
    name: string;
    description: string;
    icon: string;
    category: 'streak' | 'activity' | 'social' | 'challenge' | 'milestone';
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    criteria: {
        type: string;
        threshold: number;
        metric?: string;
    };
    points: number;
}

export const BADGES: Badge[] = [
    // Streak Badges
    {
        id: 'streak_1',
        name: 'First Step',
        description: 'Start your wellness journey with your first day',
        icon: '✨',
        category: 'streak',
        rarity: 'common',
        criteria: { type: 'streak', threshold: 1 },
        points: 10
    },
    {
        id: 'streak_7',
        name: '7-Day Warrior',
        description: 'Complete activities for 7 days in a row',
        icon: '🔥',
        category: 'streak',
        rarity: 'common',
        criteria: { type: 'streak', threshold: 7 },
        points: 100
    },
    {
        id: 'streak_30',
        name: 'Monthly Champion',
        description: 'Maintain a 30-day streak',
        icon: '⚡',
        category: 'streak',
        rarity: 'rare',
        criteria: { type: 'streak', threshold: 30 },
        points: 500
    },
    {
        id: 'streak_100',
        name: 'Century Master',
        description: 'Achieve a 100-day streak',
        icon: '👑',
        category: 'streak',
        rarity: 'epic',
        criteria: { type: 'streak', threshold: 100 },
        points: 2000
    },
    {
        id: 'streak_365',
        name: 'Year Legend',
        description: 'Complete a full year streak',
        icon: '🏆',
        category: 'streak',
        rarity: 'legendary',
        criteria: { type: 'streak', threshold: 365 },
        points: 10000
    },

    // Activity Badges
    {
        id: 'steps_10k',
        name: 'Step Master',
        description: 'Walk 10,000 steps in a single day',
        icon: '👟',
        category: 'activity',
        rarity: 'common',
        criteria: { type: 'single_activity', threshold: 10000, metric: 'steps' },
        points: 50
    },
    {
        id: 'steps_million',
        name: 'Million Steps',
        description: 'Accumulate 1 million total steps',
        icon: '🎖️',
        category: 'activity',
        rarity: 'epic',
        criteria: { type: 'cumulative', threshold: 1000000, metric: 'steps' },
        points: 1500
    },
    {
        id: 'meditation_100',
        name: 'Zen Master',
        description: 'Complete 100 meditation sessions',
        icon: '🧘',
        category: 'activity',
        rarity: 'rare',
        criteria: { type: 'count', threshold: 100, metric: 'meditation' },
        points: 750
    },
    {
        id: 'workout_50',
        name: 'Fitness Fanatic',
        description: 'Complete 50 workout sessions',
        icon: '💪',
        category: 'activity',
        rarity: 'rare',
        criteria: { type: 'count', threshold: 50, metric: 'exercise' },
        points: 600
    },
    {
        id: 'calories_5k',
        name: 'Calorie Crusher',
        description: 'Burn 5,000 calories in a week',
        icon: '🔥',
        category: 'activity',
        rarity: 'rare',
        criteria: { type: 'weekly', threshold: 5000, metric: 'calories' },
        points: 400
    },

    // Challenge Badges
    {
        id: 'challenge_1',
        name: 'Challenge Starter',
        description: 'Complete your first challenge',
        icon: '🎯',
        category: 'challenge',
        rarity: 'common',
        criteria: { type: 'count', threshold: 1, metric: 'challenges_completed' },
        points: 50
    },
    {
        id: 'challenge_10',
        name: 'Challenge Veteran',
        description: 'Complete 10 challenges',
        icon: '🏅',
        category: 'challenge',
        rarity: 'common',
        criteria: { type: 'count', threshold: 10, metric: 'challenges_completed' },
        points: 250
    },
    {
        id: 'challenge_50',
        name: 'Challenge Elite',
        description: 'Complete 50 challenges',
        icon: '⭐',
        category: 'challenge',
        rarity: 'rare',
        criteria: { type: 'count', threshold: 50, metric: 'challenges_completed' },
        points: 1000
    },
    {
        id: 'challenge_perfect',
        name: 'Perfectionist',
        description: 'Complete 5 challenges with 100% success',
        icon: '💎',
        category: 'challenge',
        rarity: 'epic',
        criteria: { type: 'perfect_challenges', threshold: 5 },
        points: 1200
    },

    // Social Badges
    {
        id: 'social_10',
        name: 'Social Butterfly',
        description: 'Make 10 social interactions',
        icon: '🦋',
        category: 'social',
        rarity: 'common',
        criteria: { type: 'count', threshold: 10, metric: 'social_interactions' },
        points: 100
    },
    {
        id: 'social_100',
        name: 'Community Leader',
        description: 'Reach 100 social interactions',
        icon: '🌟',
        category: 'social',
        rarity: 'rare',
        criteria: { type: 'count', threshold: 100, metric: 'social_interactions' },
        points: 500
    },
    {
        id: 'motivator',
        name: 'Motivator',
        description: 'Encourage 25 other users',
        icon: '💬',
        category: 'social',
        rarity: 'rare',
        criteria: { type: 'encouragements_given', threshold: 25 },
        points: 400
    },

    // Milestone Badges
    {
        id: 'points_1k',
        name: 'Point Collector',
        description: 'Earn 1,000 total points',
        icon: '💰',
        category: 'milestone',
        rarity: 'common',
        criteria: { type: 'total_points', threshold: 1000 },
        points: 0
    },
    {
        id: 'points_10k',
        name: 'Point Master',
        description: 'Earn 10,000 total points',
        icon: '💎',
        category: 'milestone',
        rarity: 'rare',
        criteria: { type: 'total_points', threshold: 10000 },
        points: 0
    },
    {
        id: 'level_10',
        name: 'Level 10 Hero',
        description: 'Reach level 10',
        icon: '🎮',
        category: 'milestone',
        rarity: 'rare',
        criteria: { type: 'level', threshold: 10 },
        points: 0
    },
    {
        id: 'level_25',
        name: 'Level 25 Legend',
        description: 'Reach level 25',
        icon: '👑',
        category: 'milestone',
        rarity: 'epic',
        criteria: { type: 'level', threshold: 25 },
        points: 0
    },
    {
        id: 'early_bird',
        name: 'Early Bird',
        description: 'Complete 10 morning activities',
        icon: '🌅',
        category: 'activity',
        rarity: 'common',
        criteria: { type: 'time_based', threshold: 10, metric: 'morning_activities' },
        points: 150
    },
    {
        id: 'night_owl',
        name: 'Night Owl',
        description: 'Complete 10 evening activities',
        icon: '🌙',
        category: 'activity',
        rarity: 'common',
        criteria: { type: 'time_based', threshold: 10, metric: 'evening_activities' },
        points: 150
    }
];

// Rarity colors and styles
export const RARITY_STYLES = {
    common: {
        bg: 'bg-slate-100',
        text: 'text-slate-700',
        border: 'border-slate-300',
        glow: 'shadow-slate-200'
    },
    rare: {
        bg: 'bg-blue-100',
        text: 'text-blue-700',
        border: 'border-blue-300',
        glow: 'shadow-blue-200'
    },
    epic: {
        bg: 'bg-purple-100',
        text: 'text-purple-700',
        border: 'border-purple-300',
        glow: 'shadow-purple-200'
    },
    legendary: {
        bg: 'bg-amber-100',
        text: 'text-amber-700',
        border: 'border-amber-300',
        glow: 'shadow-amber-200'
    }
};

// XP required for each level
export const LEVEL_THRESHOLDS = [
    0,      // Level 1
    100,    // Level 2
    250,    // Level 3
    500,    // Level 4
    800,    // Level 5
    1200,   // Level 6
    1700,   // Level 7
    2300,   // Level 8
    3000,   // Level 9
    3800,   // Level 10
    4700,   // Level 11
    5700,   // Level 12
    6800,   // Level 13
    8000,   // Level 14
    9300,   // Level 15
    10700,  // Level 16
    12200,  // Level 17
    13800,  // Level 18
    15500,  // Level 19
    17300,  // Level 20
    19200,  // Level 21
    21200,  // Level 22
    23300,  // Level 23
    25500,  // Level 24
    27800,  // Level 25
    30200,  // Level 26
    32700,  // Level 27
    35300,  // Level 28
    38000,  // Level 29
    40800,  // Level 30
];

// Calculate level from points
export function calculateLevel(points: number): number {
    for (let level = LEVEL_THRESHOLDS.length - 1; level >= 0; level--) {
        if (points >= LEVEL_THRESHOLDS[level]) {
            return level + 1;
        }
    }
    return 1;
}

// Calculate progress to next level
export function getLevelProgress(points: number): {
    currentLevel: number;
    nextLevel: number;
    currentLevelPoints: number;
    nextLevelPoints: number;
    progress: number;
    pointsToNext: number;
} {
    const currentLevel = calculateLevel(points);
    const nextLevel = currentLevel + 1;
    
    const currentLevelPoints = LEVEL_THRESHOLDS[currentLevel - 1] || 0;
    const nextLevelPoints = LEVEL_THRESHOLDS[currentLevel] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1] + 1000;
    
    const pointsInCurrentLevel = points - currentLevelPoints;
    const pointsNeededForLevel = nextLevelPoints - currentLevelPoints;
    const progress = (pointsInCurrentLevel / pointsNeededForLevel) * 100;
    const pointsToNext = nextLevelPoints - points;
    
    return {
        currentLevel,
        nextLevel,
        currentLevelPoints,
        nextLevelPoints,
        progress: Math.min(100, Math.max(0, progress)),
        pointsToNext: Math.max(0, pointsToNext)
    };
}

// Point rewards for different actions
export const POINT_REWARDS = {
    // Activities
    complete_activity: 10,
    complete_exercise: 20,
    complete_meditation: 15,
    log_nutrition: 5,
    achieve_step_goal: 25,
    
    // Challenges
    complete_challenge: 50,
    perfect_challenge: 100,
    
    // Streaks
    maintain_streak: 5,
    streak_milestone_7: 50,
    streak_milestone_30: 200,
    streak_milestone_100: 1000,
    
    // Social
    social_interaction: 3,
    encourage_user: 5,
    
    // Other
    profile_completion: 50,
    first_login: 10,
    daily_check_in: 5,
};

// Check if badge should be awarded
export function checkBadgeEligibility(badge: Badge, userStats: any): boolean {
    const { criteria } = badge;
    
    switch (criteria.type) {
        case 'streak':
            return (userStats.currentStreak || 0) >= criteria.threshold;
            
        case 'count':
            const count = userStats[criteria.metric || ''] || 0;
            return count >= criteria.threshold;
            
        case 'cumulative':
            const total = userStats[`total_${criteria.metric}`] || 0;
            return total >= criteria.threshold;
            
        case 'total_points':
            return (userStats.totalPoints || 0) >= criteria.threshold;
            
        case 'level':
            return (userStats.level || 1) >= criteria.threshold;
            
        default:
            return false;
    }
}
