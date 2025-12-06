
import mongoose from 'mongoose';
import User from '../models/User';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function checkUsers() {
    try {
        if (!process.env.MONGODB_URI) {
            console.error('MONGODB_URI not found');
            return;
        }
        await mongoose.connect(process.env.MONGODB_URI);
        const count = await User.countDocuments();
        console.log(`Total users in DB: ${count}`);

        const users = await User.find({}, 'name email stats.totalPoints');
        users.forEach(u => {
            console.log(`${u.name} (${u.email}): ${u.stats?.totalPoints} points`);
        });

    } catch (error) {
        console.error(error);
    } finally {
        await mongoose.disconnect();
    }
}

checkUsers();
