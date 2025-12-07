// Quick script to add sample vitals to existing activities
const { MongoClient, ObjectId } = require('mongodb');

async function addSampleVitals() {
    const client = new MongoClient('mongodb://localhost:27017');
    
    try {
        await client.connect();
        const db = client.db('healthtech');
        const activities = db.collection('activities');
        
        const userId = new ObjectId('6933b2cfbd07c068eec9a3ac');
        
        // Add vitals to some existing activities
        const updates = [
            {
                heartRate: 72,
                restingHeartRate: 65,
                bloodOxygen: 98,
                bloodPressureSystolic: 118,
                bloodPressureDiastolic: 78,
                heartRateVariability: 45
            },
            {
                heartRate: 85,
                restingHeartRate: 66,
                bloodOxygen: 97,
                bloodPressureSystolic: 122,
                bloodPressureDiastolic: 80,
                heartRateVariability: 42
            },
            {
                heartRate: 68,
                restingHeartRate: 64,
                bloodOxygen: 99,
                bloodPressureSystolic: 115,
                bloodPressureDiastolic: 76,
                heartRateVariability: 48
            }
        ];
        
        // Get first 3 activities
        const userActivities = await activities.find({ userId }).limit(3).toArray();
        
        for (let i = 0; i < userActivities.length && i < updates.length; i++) {
            await activities.updateOne(
                { _id: userActivities[i]._id },
                { $set: updates[i] }
            );
            console.log(`✓ Added vitals to activity: ${userActivities[i].name}`);
        }
        
        console.log('\n✅ Sample vitals added successfully!');
        console.log('Refresh your page to see the data.');
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await client.close();
    }
}

addSampleVitals();
