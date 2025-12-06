import connectDB from '../lib/mongodb';
import Challenge from '../models/Challenge';

const challenges = [
    {
        title: 'HIIT Workout Series',
        description: 'High-intensity interval training program designed to boost your metabolism and build endurance. Perfect for those looking to maximize results in minimal time.',
        category: 'fitness',
        difficulty: 4, // Advanced = 4
        duration: 'daily',
        points: 400,
        criteria: {
            type: 'workout',
            target: 14,
            metric: 'days'
        },
        active: true
    },
    {
        title: 'Plant-Based Diet',
        description: 'Transition to a healthier, plant-focused diet. Learn delicious recipes and discover the benefits of plant-based nutrition for your body and the planet.',
        category: 'nutrition',
        difficulty: 3, // Intermediate = 3
        duration: 'monthly',
        points: 600,
        criteria: {
            type: 'meals',
            target: 90,
            metric: 'plant-based meals'
        },
        active: true
    },
    {
        title: '10-Min Daily Breathing',
        description: 'Build a consistent meditation practice with guided breathing exercises. Reduce stress, improve focus, and enhance mental clarity in just 10 minutes a day.',
        category: 'meditation',
        difficulty: 1, // Beginner = 1
        duration: 'daily',
        points: 150,
        criteria: {
            type: 'meditation',
            target: 7,
            metric: 'days'
        },
        active: true
    },
    {
        title: 'Sleep Hygiene Reset',
        description: 'Optimize your sleep routine with proven techniques. Learn to fall asleep faster, sleep deeper, and wake up refreshed every morning.',
        category: 'fitness',
        difficulty: 1, // Beginner = 1
        duration: 'daily',
        points: 200,
        criteria: {
            type: 'sleep',
            target: 7,
            metric: 'nights'
        },
        active: true
    },
    {
        title: 'Hydration Hero',
        description: 'Stay properly hydrated throughout the day. Track your water intake, learn optimal hydration strategies, and feel the difference proper hydration makes.',
        category: 'nutrition',
        difficulty: 1, // Beginner = 1
        duration: 'daily',
        points: 250,
        criteria: {
            type: 'water',
            target: 8,
            metric: 'glasses per day'
        },
        active: true
    },
    {
        title: 'Digital Detox Weekend',
        description: 'Take a break from screens and reconnect with the physical world. Reduce eye strain, improve sleep quality, and boost your mental health.',
        category: 'social',
        difficulty: 3, // Intermediate = 3
        duration: 'weekly',
        points: 500,
        criteria: {
            type: 'screen-free',
            target: 2,
            metric: 'days'
        },
        active: true
    },
    {
        title: 'Morning Cold Shower',
        description: 'Build mental toughness and boost your immune system with daily cold exposure. Start your mornings with energy and clarity.',
        category: 'fitness',
        difficulty: 5, // Advanced = 5
        duration: 'daily',
        points: 1000,
        criteria: {
            type: 'cold-exposure',
            target: 21,
            metric: 'days'
        },
        active: true
    },
    {
        title: '10k Steps Daily',
        description: 'Walk your way to better health. Achieve 10,000 steps every day to improve cardiovascular health, boost mood, and increase energy levels.',
        category: 'fitness',
        difficulty: 3, // Intermediate = 3
        duration: 'monthly',
        points: 450,
        criteria: {
            type: 'steps',
            target: 10000,
            metric: 'steps per day'
        },
        active: true
    },
    {
        title: 'No Sugar Challenge',
        description: 'Eliminate added sugars from your diet. Break sugar addiction, stabilize energy levels, and discover natural sweetness in whole foods.',
        category: 'nutrition',
        difficulty: 4, // Advanced = 4
        duration: 'daily',
        points: 800,
        criteria: {
            type: 'diet',
            target: 14,
            metric: 'sugar-free days'
        },
        active: true
    },
    {
        title: 'Gratitude Journaling',
        description: 'Cultivate a positive mindset through daily gratitude practice. Write three things you\'re grateful for each day and watch your perspective shift.',
        category: 'meditation',
        difficulty: 1, // Beginner = 1
        duration: 'daily',
        points: 300,
        criteria: {
            type: 'journal',
            target: 21,
            metric: 'entries'
        },
        active: true
    },
];

async function seedChallenges() {
    try {
        await connectDB();
        
        // Clear existing challenges
        await Challenge.deleteMany({});
        console.log('Cleared existing challenges');
        
        // Insert new challenges
        const result = await Challenge.insertMany(challenges);
        console.log(`✅ Successfully seeded ${result.length} challenges`);
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding challenges:', error);
        process.exit(1);
    }
}

seedChallenges();
