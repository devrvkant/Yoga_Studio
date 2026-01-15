/* server/src/scripts/seedCourses.js */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Course from '../src/models/Course.js';
import Session from '../src/models/Session.js';
// Load env vars
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });
const coursesData = [
    {
        title: "21-Day Yoga Foundation",
        description: "Master the basics of Hatha yoga. This course covers fundamental poses, breathing techniques, and alignment principles to build a safe and strong home practice.",
        instructor: "Sarah Chen",
        isPaid: false,
        price: 0,
        duration: "3 Weeks",
        sessions: "7 Sessions",
        level: "Beginner",
        learnPoints: ["Basic Asanas", "Pranayama Basics", "Alignment", "Sun Salutations"],
        image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1000&auto=format&fit=crop",
        sessionsList: [
            { title: "Day 1: Finding Your Breath", duration: "15:00", order: 1, desc: "Introduction to three-part yogic breathing." },
            { title: "Day 2: The Sun Salutation A", duration: "20:00", order: 2, desc: "Step-by-step breakdown of Surya Namaskar A." },
            { title: "Day 3: Standing Strong", duration: "25:00", order: 3, desc: "Focus on Warrior I and II alignment." }
        ]
    },
    {
        title: "Advanced Vinyasa Mastery",
        description: "Take your practice to the next level with complex transitions, arm balances, and inversions. Designed for experienced practitioners seeking to deepen their physical and mental edge.",
        instructor: "Michael Rivers",
        isPaid: true,
        price: 49.99,
        duration: "4 Weeks",
        sessions: "12 Sessions",
        level: "Advanced",
        learnPoints: ["Arm Balances", "Handstand Prep", "Fluid Transitions", "Deep Backbends"],
        image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=1000&auto=format&fit=crop",
        sessionsList: [
            { title: "Flow 1: Heat & Power", duration: "45:00", order: 1, desc: "Fast-paced flow to build internal heat." },
            { title: "Flow 2: Crow to Chaturanga", duration: "30:00", order: 2, desc: "Mastering the jump back from arm balances." }
        ]
    },
    {
        title: "The Anxiety Relief Series",
        description: "A gentle, therapeutic course focusing on Restorative and Yin yoga to calm the nervous system and reduce stress.",
        instructor: "Emma Wilson",
        isPaid: true,
        price: 29.99,
        duration: "2 Weeks",
        sessions: "10 Sessions",
        level: "All Levels",
        learnPoints: ["Nervous System Regulation", "Patience", "Deep Tissue Release", "Mindfulness"],
        image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=1000&auto=format&fit=crop",
        sessionsList: [
            { title: "Session 1: Quiet Mind", duration: "60:00", order: 1, desc: "Long holds in supportive poses." }
        ]
    },
    {
        title: "Core Power Yoga",
        description: "Focus on building a rock-solid core. This course combines traditional yoga with fitness-based abdominal work.",
        instructor: "David Miller",
        isPaid: true,
        price: 19.99,
        duration: "30 Days",
        sessions: "15 Sessions",
        level: "Intermediate",
        learnPoints: ["Core Stability", "Balance", "Agility", "Internal Strength"],
        image: "https://images.unsplash.com/photo-1510894347713-fc3ed6fdf539?q=80&w=1000&auto=format&fit=crop",
        sessionsList: [
            { title: "Day 1: Navasana Variations", duration: "20:00", order: 1, desc: "Developing Boat Pose endurance." }
        ]
    },
    {
        title: "Meditation for Modern Life",
        description: "Clear your mind and find focus. This course teaches accessible meditation techniques for busy people.",
        instructor: "Sarah Chen",
        isPaid: false,
        price: 0,
        duration: "7 Days",
        sessions: "7 Sessions",
        level: "All Levels",
        learnPoints: ["Vipassana", "Metta", "Breath Awareness", "Walking Meditation"],
        image: "https://images.unsplash.com/photo-1499209974431-9dac3adaf477?q=80&w=1000&auto=format&fit=crop",
        sessionsList: [
            { title: "Day 1: Anchoring the Mind", duration: "10:00", order: 1, desc: "Introduction to concentration meditation." }
        ]
    }
];
// Placeholder Video (Dog video from Cloudinary demo)
const SAMPLE_VIDEO = "https://res.cloudinary.com/demo/video/upload/dog.mp4";
const SAMPLE_THUMB = "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=400&auto=format&fit=crop";
const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB for seeding...');
        // Clear existing data (Be careful with this in production!)
        await Course.deleteMany({});
        await Session.deleteMany({});
        console.log('Cleared existing courses and sessions.');
        for (const cData of coursesData) {
            const { sessionsList, ...courseMetadata } = cData;

            // Create Course
            const course = await Course.create(courseMetadata);
            console.log(`Created course: ${course.title}`);
            // Create Sessions for this course
            for (const sData of sessionsList) {
                await Session.create({
                    ...sData,
                    courseId: course._id,
                    video: SAMPLE_VIDEO,
                    thumbnail: SAMPLE_THUMB
                });
            }
            console.log(`  -> Added ${sessionsList.length} sessions`);
        }
        console.log('Seeding completed successfully!');
        process.exit();
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
};
seedDB();