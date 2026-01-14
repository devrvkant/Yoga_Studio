import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/User.js';
import connectDB from '../src/config/db.js';

dotenv.config();

const firstNames = ['Alex', 'Blake', 'Casey', 'Drew', 'Ember', 'Finley', 'Gray', 'Harper', 'Iris', 'Jordan', 'Kai', 'Logan', 'Morgan', 'Nova', 'Ocean', 'Parker', 'Quinn', 'River', 'Sage', 'Taylor'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];

const generateRandomUser = (index) => {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const randomNum = Math.floor(Math.random() * 10000);

    return {
        name: `${firstName} ${lastName}`,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${randomNum}@yogatest.com`,
        password: 'TestPassword123!', // Will be hashed by the schema middleware
        role: 'user',
        enrolledClasses: [],
        enrolledCourses: [],
    };
};

const seedUsers = async () => {
    try {
        await connectDB();

        console.log('🌱 Starting user seeding...');

        // Check if test users already exist
        const existingTestUsers = await User.countDocuments({ email: /@yogatest\.com$/ });

        if (existingTestUsers >= 100) {
            console.log(`✅ Already have ${existingTestUsers} test users. Skipping seed.`);
            process.exit(0);
        }

        // Generate 100 random users
        const users = [];
        for (let i = 0; i < 100; i++) {
            users.push(generateRandomUser(i));
        }

        // Insert users in batches for better performance
        const batchSize = 10;
        let inserted = 0;

        for (let i = 0; i < users.length; i += batchSize) {
            const batch = users.slice(i, i + batchSize);
            await User.insertMany(batch);
            inserted += batch.length;
            console.log(`📦 Inserted ${inserted}/100 users...`);
        }

        console.log('✅ Successfully seeded 100 test users!');
        console.log('📧 All users have password: TestPassword123!');
        console.log('🔗 Email pattern: firstname.lastname####@yogatest.com');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding users:', error);
        process.exit(1);
    }
};

seedUsers();
