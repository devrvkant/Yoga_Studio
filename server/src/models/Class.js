import mongoose from 'mongoose';

const classSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a class title'],
        trim: true,
        maxlength: [50, 'Title can not be more than 50 characters']
    },
    description: {
        type: String,
        required: [true, 'Please add a description'],
        maxlength: [500, 'Description can not be more than 500 characters']
    },
    isPaid: {
        type: Boolean,
        default: false
    },
    price: {
        type: Number,
        required: function () { return this.isPaid; }, // Only required if paid
        default: 0
    },
    digistoreProductId: {
        type: String,
        required: function () { return this.isPaid; }, // Required for paid classes
        trim: true
    },
    level: {
        type: String,
        required: [true, 'Please add a difficulty level'],
        enum: ['Beginner', 'Intermediate', 'Advanced', 'All Levels']
    },
    image: {
        type: String, // URL/Path to image
        default: 'default-class.jpg'
    },
    video: {
        type: String, // URL/Path to video
        required: false
    },
    duration: {
        type: String, // e.g. "60 min"
        default: "60 min"
    },
    instructor: {
        type: String,
        default: "Serenity Instuctor"
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

export default mongoose.model('Class', classSchema);
