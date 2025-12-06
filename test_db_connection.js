// Test script to verify database connectivity and saving
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/healthtech';

async function testConnection() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ MongoDB Connected successfully!\n');

        // Test User Schema
        const UserSchema = new mongoose.Schema({
            email: String,
            name: String,
            profile: {
                age: Number,
                gender: String,
                height: Number,
                heightUnit: String,
                weight: Number,
                weightUnit: String,
                activityLevel: String,
                primaryGoal: String,
            }
        });

        const TestUser = mongoose.models.TestUser || mongoose.model('TestUser', UserSchema);

        // Create test user
        console.log('📝 Creating test user...');
        const testUser = await TestUser.create({
            email: 'test@example.com',
            name: 'Test User',
            profile: {
                age: 30,
                gender: 'Male',
                height: 175,
                heightUnit: 'cm',
                weight: 75,
                weightUnit: 'kg',
                activityLevel: 'moderately_active',
                primaryGoal: 'Weight Loss'
            }
        });
        console.log('✅ Test user created:', testUser._id);

        // Update test user
        console.log('\n📝 Updating test user...');
        const updatedUser = await TestUser.findByIdAndUpdate(
            testUser._id,
            { $set: { 'profile.weight': 73 } },
            { new: true }
        );
        console.log('✅ Test user updated. New weight:', updatedUser.profile.weight);

        // Fetch test user
        console.log('\n📝 Fetching test user...');
        const fetchedUser = await TestUser.findById(testUser._id);
        console.log('✅ Test user fetched:', fetchedUser.email);
        console.log('   Profile:', JSON.stringify(fetchedUser.profile, null, 2));

        // Test Activity Schema
        const ActivitySchema = new mongoose.Schema({
            userId: String,
            type: String,
            duration: Number,
            caloriesBurned: Number,
            timestamp: { type: Date, default: Date.now }
        });

        const TestActivity = mongoose.models.TestActivity || mongoose.model('TestActivity', ActivitySchema);

        console.log('\n📝 Creating test activity...');
        const testActivity = await TestActivity.create({
            userId: 'test@example.com',
            type: 'Running',
            duration: 30,
            caloriesBurned: 300
        });
        console.log('✅ Test activity created:', testActivity._id);

        // Fetch test activity
        console.log('\n📝 Fetching test activity...');
        const fetchedActivity = await TestActivity.findById(testActivity._id);
        console.log('✅ Test activity fetched:', fetchedActivity.type);
        console.log('   Details:', JSON.stringify({
            type: fetchedActivity.type,
            duration: fetchedActivity.duration,
            calories: fetchedActivity.caloriesBurned
        }, null, 2));

        // Clean up test data
        console.log('\n🧹 Cleaning up test data...');
        await TestUser.findByIdAndDelete(testUser._id);
        await TestActivity.findByIdAndDelete(testActivity._id);
        console.log('✅ Test data cleaned up');

        console.log('\n✅ All database tests passed!');
        console.log('💾 Database is working correctly and can save/fetch data');

    } catch (error) {
        console.error('❌ Database test failed:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 MongoDB connection closed');
    }
}

testConnection();
