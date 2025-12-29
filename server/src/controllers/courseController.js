import Course from '../models/Course.js';

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
export const getCourses = async (req, res, next) => {
    try {
        const courses = await Course.find();
        res.status(200).json({ success: true, count: courses.length, data: courses });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Public
export const getCourse = async (req, res, next) => {
    try {
        const course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        res.status(200).json({ success: true, data: course });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Create new course
// @route   POST /api/courses
// @access  Private (Admin)
export const createCourse = async (req, res, next) => {
    try {
        const course = await Course.create(req.body);
        res.status(201).json({ success: true, data: course });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private (Admin)
export const updateCourse = async (req, res, next) => {
    try {
        const course = await Course.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        res.status(200).json({ success: true, data: course });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private (Admin)
export const deleteCourse = async (req, res, next) => {
    try {
        const course = await Course.findByIdAndDelete(req.params.id);

        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Enroll in course
// @route   POST /api/courses/:id/enroll
// @access  Private
export const enrollCourse = async (req, res, next) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        if (course.enrolledUsers.includes(req.user.id)) {
            return res.status(400).json({ success: false, message: 'User already enrolled' });
        }

        course.enrolledUsers.push(req.user.id);
        await course.save();

        const User = (await import('../models/User.js')).default;
        await User.findByIdAndUpdate(req.user.id, {
            $addToSet: { enrolledCourses: req.params.id }
        });

        res.status(200).json({ success: true, message: 'Enrolled successfully' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// @desc    Get enrolled users for a course
// @route   GET /api/courses/:id/enrolled
// @access  Private (Admin)
export const getEnrolledUsers = async (req, res, next) => {
    try {
        const course = await Course.findById(req.params.id).populate('enrolledUsers', 'name email');

        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        res.status(200).json({ success: true, count: course.enrolledUsers.length, data: course.enrolledUsers });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
