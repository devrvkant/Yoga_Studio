import Class from '../models/Class.js';

// @desc    Get all classes
// @route   GET /api/classes
// @access  Public
export const getClasses = async (req, res, next) => {
    try {
        const classes = await Class.find();
        res.status(200).json({ success: true, count: classes.length, data: classes });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Get single class
// @route   GET /api/classes/:id
// @access  Public
export const getClass = async (req, res, next) => {
    try {
        const yogaClass = await Class.findById(req.params.id);

        if (!yogaClass) {
            return res.status(404).json({ success: false, message: 'Class not found' });
        }

        res.status(200).json({ success: true, data: yogaClass });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Create new class
// @route   POST /api/classes
// @access  Private (Admin)
export const createClass = async (req, res, next) => {
    try {
        const yogaClass = await Class.create(req.body);
        res.status(201).json({ success: true, data: yogaClass });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Update class
// @route   PUT /api/classes/:id
// @access  Private (Admin)
export const updateClass = async (req, res, next) => {
    try {
        const yogaClass = await Class.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!yogaClass) {
            return res.status(404).json({ success: false, message: 'Class not found' });
        }

        res.status(200).json({ success: true, data: yogaClass });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Delete class
// @route   DELETE /api/classes/:id
// @access  Private (Admin)
export const deleteClass = async (req, res, next) => {
    try {
        const yogaClass = await Class.findByIdAndDelete(req.params.id);

        if (!yogaClass) {
            return res.status(404).json({ success: false, message: 'Class not found' });
        }

        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Enroll in class
// @route   POST /api/classes/:id/enroll
// @access  Private
export const enrollClass = async (req, res, next) => {
    try {
        const yogaClass = await Class.findById(req.params.id);
        if (!yogaClass) {
            return res.status(404).json({ success: false, message: 'Class not found' });
        }

        // Check if already enrolled
        if (yogaClass.enrolledUsers.includes(req.user.id)) {
            return res.status(400).json({ success: false, message: 'User already enrolled' });
        }

        // Add user to class
        yogaClass.enrolledUsers.push(req.user.id);
        await yogaClass.save();

        // Add class to user (assuming User model is updated)
        // We need to import User or rely on req.user update but req.user is from passport session (might be stale).
        // Best practice: Update User document directly.
        // However, for simplicity let's assume one-way or handle User update if imported.
        // Let's rely on Mongoose to handle the User side if we want bidirectional.
        // Actually, let's update req.user if possible or just the User model.
        // Since we didn't import User here, let's just update the class for now? 
        // Wait, the requirement says "showing user in to admin that which user is enrolled".
        // Updating `Class.enrolledUsers` is sufficient for the Admin View of the Class.
        // Updating `User.enrolledClasses` is sufficient for the User Profile.
        // I should do both.

        // Dynamic import to avoid circular dependency issues if any
        const User = (await import('../models/User.js')).default;
        await User.findByIdAndUpdate(req.user.id, {
            $addToSet: { enrolledClasses: req.params.id }
        });

        res.status(200).json({ success: true, message: 'Enrolled successfully' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Get enrolled users for a class
// @route   GET /api/classes/:id/enrolled
// @access  Private (Admin)
export const getEnrolledUsers = async (req, res, next) => {
    try {
        const yogaClass = await Class.findById(req.params.id).populate('enrolledUsers', 'name email');

        if (!yogaClass) {
            return res.status(404).json({ success: false, message: 'Class not found' });
        }

        res.status(200).json({ success: true, count: yogaClass.enrolledUsers.length, data: yogaClass.enrolledUsers });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
