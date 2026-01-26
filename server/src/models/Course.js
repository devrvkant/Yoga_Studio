import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a course title'],
        trim: true,
        maxlength: [50, 'Title can not be more than 50 characters']
    },
    description: {
        type: String,
        required: [true, 'Please add a description'],
        maxlength: [500, 'Description can not be more than 500 characters']
    },
    instructor: {
        type: String,
        default: 'Serenity Instructor'
    },
    isPaid: {
        type: Boolean,
        default: false
    },
    price: {
        type: Number,
        required: function () { return this.isPaid; },
        default: 0
    },
    digistoreProductId: {
        type: String,
        required: function () { return this.isPaid; }, // Required for paid courses
        trim: true
    },
    duration: {
        type: String, // e.g. "4 Weeks"
        required: [true, 'Please add a duration']
    },
    sessions: {
        type: String, // e.g. "8 Sessions"
        required: [true, 'Please add session count']
    },
    level: {
        type: String,
        required: [true, 'Please add a difficulty level'],
        enum: ['Beginner', 'Intermediate', 'Advanced', 'All Levels'],
        default: 'All Levels'
    },
    image: {
        type: String,
        default: 'default-course.jpg'
    },
    learnPoints: {
        type: [String],
        required: true,
        validate: [arrayLimit, '{PATH} exceeds the limit of 10 points']
    },
    enrolledUsers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

function arrayLimit(val) {
    return val.length <= 10;
}

export default mongoose.model('Course', courseSchema);
