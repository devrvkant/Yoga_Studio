import Course from '../models/Course.js';
import { cleanupCourseAssets, rollbackUploads, extractPublicId } from '../services/cloudinaryService.js';

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
    const uploadedAssets = [];

    try {
        // Track uploaded assets for potential rollback
        if (req.body.videos && Array.isArray(req.body.videos)) {
            req.body.videos.forEach(videoItem => {
                if (videoItem.url) {
                    const videoPublicId = extractPublicId(videoItem.url);
                    if (videoPublicId) {
                        uploadedAssets.push({ publicId: videoPublicId, resourceType: 'video' });
                    }
                }
                if (videoItem.thumbnail) {
                    const thumbnailPublicId = extractPublicId(videoItem.thumbnail);
                    if (thumbnailPublicId) {
                        uploadedAssets.push({ publicId: thumbnailPublicId, resourceType: 'image' });
                    }
                }
            });
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

        // Track assets that will be replaced (simplified - tracks new videos)
        if (req.body.videos && Array.isArray(req.body.videos)) {
            // Track new uploads
            req.body.videos.forEach(videoItem => {
                if (videoItem.url) {
                    const videoPublicId = extractPublicId(videoItem.url);
                    if (videoPublicId) {
                        newUploadedAssets.push({ publicId: videoPublicId, resourceType: 'video' });
                    }
                }
                if (videoItem.thumbnail) {
                    const thumbnailPublicId = extractPublicId(videoItem.thumbnail);
                    if (thumbnailPublicId) {
                        newUploadedAssets.push({ publicId: thumbnailPublicId, resourceType: 'image' });
                    }
                }
            });

            // Track old videos for cleanup (if completely replacing videos array)
            if (existingCourse.videos && Array.isArray(existingCourse.videos)) {
                existingCourse.videos.forEach(oldVideoItem => {
                    if (oldVideoItem.url) {
                        const oldVideoId = extractPublicId(oldVideoItem.url);
                        if (oldVideoId) {
                            oldAssets.push({ publicId: oldVideoId, resourceType: 'video' });
                        }
                    }
                    if (oldVideoItem.thumbnail) {
                        const oldThumbnailId = extractPublicId(oldVideoItem.thumbnail);
                        if (oldThumbnailId) {
                            oldAssets.push({ publicId: oldThumbnailId, resourceType: 'image' });
                        }
                    }
                });
            }
        }

        // Update course in database
        const course = await Course.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        // Delete old assets from Cloudinary after successful update
        if (oldAssets.length > 0) {
            await rollbackUploads(oldAssets).catch(cleanupErr => {
                console.error('Error cleaning up old course assets:', cleanupErr);
            });
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

        // Clean up all associated Cloudinary assets (videos and thumbnails)
        await cleanupCourseAssets(course).catch(cleanupErr => {
            console.error('Error cleaning up course assets from Cloudinary:', cleanupErr);
            // Don't fail the delete operation if Cloudinary cleanup fails
        });

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
