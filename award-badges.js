const { MongoClient } = require('mongodb');

const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);

async function awardBadges() {
    try {
        await client.connect();
        const db = client.db('healthtech');
        
        // Get user
        const user = await db.collection('users').findOne({ email: 'raunakg2005@gmail.com' });
        console.log('Current streak:', user.stats?.currentStreak);
        console.log('Current badges:', user.stats?.badges);
        
        // Award badges based on current streak
        const badgesToAward = [];
        if (user.stats?.currentStreak >= 1) {
            badgesToAward.push('streak_1');
        }
        
        // Update user with badges
        const result = await db.collection('users').updateOne(
            { email: 'raunakg2005@gmail.com' },
            { 
                $set: { 'stats.badges': badgesToAward },
                $inc: { 'stats.totalPoints': 10 } // 10 points for First Step badge
            }
        );
        
        console.log('✅ Badges awarded:', badgesToAward);
        console.log('Modified count:', result.modifiedCount);
        
        // Check updated stats
        const updatedUser = await db.collection('users').findOne({ email: 'raunakg2005@gmail.com' });
        console.log('\nUpdated Stats:');
        console.log('- Badges:', updatedUser.stats?.badges);
        console.log('- Total Points:', updatedUser.stats?.totalPoints);
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await client.close();
    }
}

awardBadges();
