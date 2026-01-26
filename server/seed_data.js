
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Class from './src/models/Class.js';
import Course from './src/models/Course.js';

// Load env vars
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const levels = ['Beginner', 'Intermediate', 'Advanced', 'All Levels'];
const images = [
    'https://images.unsplash.com/photo-1603988363607-e1e4a66962c6?q=80&w=2070&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1544367563-12123d8959bd?q=80&w=2070&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=2031&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=2069&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1599447290810-a3371b80855b?q=80&w=2070&auto=format&fit=crop'
];

const seedData = async () => {
    await connectDB();

    try {
        console.log('Clearing existing dummy data...');
        // Optional: clear DB, but user asked to add. I'll just add.
        // await Class.deleteMany({});
        // await Course.deleteMany({});

        console.log('Seeding Classes...');
        const classes = [];
        for (let i = 1; i <= 30; i++) {
            classes.push({
                title: `Test Class ${i}`,
                description: `This is a dummy class description for Test Class ${i}. It is great for testing pagination.`,
                isPaid: Math.random() > 0.5,
                price: Math.random() > 0.5 ? 19.99 : 0,
                digistoreProductId: '12345',
                level: levels[Math.floor(Math.random() * levels.length)],
                image: images[Math.floor(Math.random() * images.length)],
                duration: `${30 + Math.floor(Math.random() * 60)} min`,
                instructor: 'Seed Bot'
            });
        }
        await Class.insertMany(classes);
        console.log('Added 30 Classes');

        console.log('Seeding Courses...');
        const courses = [];
        for (let i = 1; i <= 30; i++) {
            courses.push({
                title: `Test Course ${i}`,
                description: `This is a dummy course description for Test Course ${i}.`,
                isPaid: Math.random() > 0.5,
                price: Math.random() > 0.5 ? 49.99 : 0,
                digistoreProductId: '67890',
                duration: `${4 + Math.floor(Math.random() * 8)} Weeks`,
                sessions: `${8 + Math.floor(Math.random() * 12)} Sessions`,
                level: levels[Math.floor(Math.random() * levels.length)],
                image: images[Math.floor(Math.random() * images.length)],
                learnPoints: ['Learn basics', 'Improve flexibility', 'Master breathing', 'Reduce stress'],
                instructor: 'Seed Bot'
            });
        }
        await Course.insertMany(courses);
        console.log('Added 30 Courses');

        console.log('Data Imported!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

seedData();
