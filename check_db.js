
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Session from './server/src/models/Session.js';
import Course from './server/src/models/Course.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, 'server/.env') });

const checkDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB...');

        const sessionCount = await Session.countDocuments();
        console.log(`Total Sessions: ${sessionCount}`);

        const sessionsWithVideo = await Session.countDocuments({ video: { $exists: true, $ne: '' } });
        console.log(`Sessions with Video: ${sessionsWithVideo}`);

        if (sessionCount > 0) {
            const sampleSession = await Session.findOne().populate('courseId', 'title');
            console.log('Sample Session:', {
                title: sampleSession.title,
                course: sampleSession.courseId?.title,
                video: sampleSession.video
            });
        }

        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkDB();
