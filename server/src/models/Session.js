import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: [true, 'Course ID is required']
    },
    title: {
        type: String,
        required: [true, 'Please add a session title'],
        trim: true,
        maxlength: [100, 'Title cannot be more than 100 characters']
    },
    description: {
        type: String,
        maxlength: [500, 'Description cannot be more than 500 characters']
    },
    order: {
        type: Number,
        required: true,
        default: 0
    },
    video: {
        type: String, // Cloudinary URL
        required: [true, 'Please add a video for this session']
    },
    thumbnail: {
        type: String, // Cloudinary URL (optional)
        default: null
    },
    duration: {
        type: String, // e.g. "45 min"
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for efficient querying by course
sessionSchema.index({ courseId: 1, order: 1 });

export default mongoose.model('Session', sessionSchema);
