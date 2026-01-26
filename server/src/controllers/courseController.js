import Course from '../models/Course.js';
import { cleanupCourseAssets, rollbackUploads, extractPublicId } from '../services/cloudinaryService.js';

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
export const getCourses = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 12;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;

        // Build query
        const query = {};
        if (req.query.level && req.query.level !== 'All Courses') {
            query.level = req.query.level;
        }

        // Add search functionality
        if (req.query.search && req.query.search.trim()) {
            const searchRegex = new RegExp(req.query.search.trim(), 'i');
            query.$or = [
                { title: searchRegex },
                { description: searchRegex }
            ];
        }

        const total = await Course.countDocuments(query);
        const courses = await Course.find(query).skip(startIndex).limit(limit);

        // Pagination result
        const pagination = {};

        if (endIndex < total) {
            pagination.next = {
                page: page + 1,
                limit
            };
        }

        if (startIndex > 0) {
            pagination.prev = {
                page: page - 1,
                limit
            };
        }

        res.status(200).json({
            success: true,
            count: courses.length,
            total,
            pagination,
            data: courses
        });
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
    const uploadedAssets = [];

    try {
        // Track uploaded image for potential rollback
        if (req.body.image) {
            const imagePublicId = extractPublicId(req.body.image);
            if (imagePublicId) {
                uploadedAssets.push({ publicId: imagePublicId, resourceType: 'image' });
            }
        }

        // Create course in database
        const course = await Course.create(req.body);
        res.status(201).json({ success: true, data: course });
    } catch (err) {
        // Rollback: Delete uploaded assets from Cloudinary if DB operation failed
        if (uploadedAssets.length > 0) {
            console.log('DB error occurred, rolling back Cloudinary uploads...');
            await rollbackUploads(uploadedAssets).catch(rollbackErr => {
                console.error('Rollback failed:', rollbackErr);
            });
        }
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private (Admin)
export const updateCourse = async (req, res, next) => {
    const newUploadedAssets = [];
    const oldAssets = [];

    try {
        // Get the existing course to track old assets
        const existingCourse = await Course.findById(req.params.id);
        if (!existingCourse) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        console.log('=== COURSE UPDATE - Asset Change Detection ===');
        console.log('Existing image:', existingCourse.image);
        console.log('New image:', req.body.image);

        // Track image changes (including removal/reset to default)
        const imageChanged = 'image' in req.body && req.body.image !== existingCourse.image;
        if (imageChanged) {
            console.log('IMAGE CHANGED - Will cleanup old image');
            // Cleanup old image if it exists and is not the default
            if (existingCourse.image && existingCourse.image !== 'default-course.jpg') {
                const oldImageId = extractPublicId(existingCourse.image);
                console.log('Old image public_id:', oldImageId);
                if (oldImageId) {
                    oldAssets.push({ publicId: oldImageId, resourceType: 'image' });
                }
            }
            // Track new image for potential rollback (only if it's a real Cloudinary URL)
            if (req.body.image && req.body.image !== 'default-course.jpg') {
                const newImageId = extractPublicId(req.body.image);
                if (newImageId) {
                    newUploadedAssets.push({ publicId: newImageId, resourceType: 'image' });
                }
            }
        }

        console.log('Old assets to cleanup:', oldAssets);
        console.log('New assets uploaded:', newUploadedAssets);

        // Update course in database
        const course = await Course.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        // Delete old assets from Cloudinary after successful update
        if (oldAssets.length > 0) {
            console.log('EXECUTING CLOUDINARY CLEANUP for old assets...');
            await rollbackUploads(oldAssets).catch(cleanupErr => {
                console.error('Error cleaning up old course assets:', cleanupErr);
            });
            console.log('Cloudinary cleanup completed');
        } else {
            console.log('No old assets to cleanup');
        }

        res.status(200).json({ success: true, data: course });
    } catch (err) {
        // Rollback: Delete new uploaded assets from Cloudinary if DB update failed
        if (newUploadedAssets.length > 0) {
            console.log('DB update error occurred, rolling back new Cloudinary uploads...');
            await rollbackUploads(newUploadedAssets).catch(rollbackErr => {
                console.error('Rollback failed:', rollbackErr);
            });
        }
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

        // CASCADE DELETE: Delete all sessions belonging to this course
        const Session = (await import('../models/Session.js')).default;
        const sessions = await Session.find({ courseId: req.params.id });

        // Delete session assets from Cloudinary
        for (const session of sessions) {
            const assetsToDelete = [];

            if (session.video) {
                const { extractPublicId } = await import('../services/cloudinaryService.js');
                const videoId = extractPublicId(session.video);
                if (videoId) {
                    assetsToDelete.push({ publicId: videoId, resourceType: 'video' });
                }
            }

            if (session.thumbnail) {
                const { extractPublicId } = await import('../services/cloudinaryService.js');
                const thumbnailId = extractPublicId(session.thumbnail);
                if (thumbnailId) {
                    assetsToDelete.push({ publicId: thumbnailId, resourceType: 'image' });
                }
            }

            if (assetsToDelete.length > 0) {
                const { rollbackUploads } = await import('../services/cloudinaryService.js');
                await rollbackUploads(assetsToDelete).catch(err => {
                    console.error('Error cleaning session assets:', err);
                });
            }
        }

        // Delete all sessions from database
        await Session.deleteMany({ courseId: req.params.id });
        console.log(`Deleted ${sessions.length} sessions for course ${req.params.id}`);

        // Clean up course image (if exists)
        if (course.image && course.image !== 'default-course.jpg') {
            const { deleteFromCloudinaryByUrl } = await import('../services/cloudinaryService.js');
            await deleteFromCloudinaryByUrl(course.image, 'image').catch(cleanupErr => {
                console.error('Error cleaning up course image from Cloudinary:', cleanupErr);
            });
        }

        res.status(200).json({ success: true, data: {}, message: `Course and ${sessions.length} sessions deleted successfully` });
    } catch (err) {
        console.error('Error deleting course:', err);
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
