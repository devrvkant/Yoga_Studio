import Class from '../models/Class.js';
import { cleanupClassAssets, rollbackUploads, extractPublicId } from '../services/cloudinaryService.js';

// @desc    Get all classes
// @route   GET /api/classes
// @access  Public
export const getClasses = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 12;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;

        // Build query
        const query = {};
        if (req.query.level && req.query.level !== 'All Classes') {
            query.level = req.query.level;
        }

        // Add search functionality
        if (req.query.search && req.query.search.trim()) {
            const searchRegex = new RegExp(req.query.search.trim(), 'i');
            query.$or = [
                { title: searchRegex },
                { description: searchRegex },
                { instructor: searchRegex }
            ];
        }

        const total = await Class.countDocuments(query);
        const classes = await Class.find(query).skip(startIndex).limit(limit);

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
            count: classes.length,
            total,
            pagination,
            data: classes
        });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Get single class
// @route   GET /api/classes/:id
// @access  Public (but video hidden for paid classes if not enrolled)
export const getClass = async (req, res, next) => {
    try {
        const yogaClass = await Class.findById(req.params.id);

        if (!yogaClass) {
            return res.status(404).json({ success: false, message: 'Class not found' });
        }

        // Security: Hide video URL for paid classes if user is not enrolled
        if (yogaClass.isPaid) {
            const isEnrolled = req.user && yogaClass.enrolledUsers.some(
                userId => userId.toString() === req.user.id
            );
            const isAdmin = req.user && req.user.role === 'admin';

            if (!isEnrolled && !isAdmin) {
                // Convert to object to modify, then remove video
                const classData = yogaClass.toObject();
                delete classData.video;
                return res.status(200).json({ success: true, data: classData });
            }
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
    const uploadedAssets = [];

    try {
        // Track uploaded assets for potential rollback
        if (req.body.image) {
            const imagePublicId = extractPublicId(req.body.image);
            if (imagePublicId) {
                uploadedAssets.push({ publicId: imagePublicId, resourceType: 'image' });
            }
        }
        if (req.body.video) {
            const videoPublicId = extractPublicId(req.body.video);
            if (videoPublicId) {
                uploadedAssets.push({ publicId: videoPublicId, resourceType: 'video' });
            }
        }

        // Create class in database
        const yogaClass = await Class.create(req.body);
        res.status(201).json({ success: true, data: yogaClass });
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

// @desc    Update class
// @route   PUT /api/classes/:id
// @access  Private (Admin)
export const updateClass = async (req, res, next) => {
    const newUploadedAssets = [];
    const oldAssets = [];

    try {
        // Get the existing class to track old assets
        const existingClass = await Class.findById(req.params.id);
        if (!existingClass) {
            return res.status(404).json({ success: false, message: 'Class not found' });
        }

        // Track old assets that will be replaced
        console.log('=== CLASS UPDATE - Asset Change Detection ===');
        console.log('Existing image:', existingClass.image);
        console.log('New image:', req.body.image);
        console.log('Existing video:', existingClass.video);
        console.log('New video:', req.body.video);

        // Track image changes (including removal)
        const imageChanged = 'image' in req.body && req.body.image !== existingClass.image;
        if (imageChanged) {
            console.log('IMAGE CHANGED - Will cleanup old image');
            if (existingClass.image && existingClass.image !== 'default-class.jpg') {
                const oldImageId = extractPublicId(existingClass.image);
                console.log('Old image public_id:', oldImageId);
                if (oldImageId) {
                    oldAssets.push({ publicId: oldImageId, resourceType: 'image' });
                }
            }
            if (req.body.image && req.body.image !== 'default-class.jpg') {
                const newImageId = extractPublicId(req.body.image);
                if (newImageId) {
                    newUploadedAssets.push({ publicId: newImageId, resourceType: 'image' });
                }
            }
        }

        // Track video changes (including removal)
        const videoChanged = 'video' in req.body && req.body.video !== existingClass.video;
        if (videoChanged) {
            console.log('VIDEO CHANGED - Will cleanup old video');
            if (existingClass.video) {
                const oldVideoId = extractPublicId(existingClass.video);
                console.log('Old video public_id:', oldVideoId);
                if (oldVideoId) {
                    oldAssets.push({ publicId: oldVideoId, resourceType: 'video' });
                }
            }
            if (req.body.video) {
                const newVideoId = extractPublicId(req.body.video);
                if (newVideoId) {
                    newUploadedAssets.push({ publicId: newVideoId, resourceType: 'video' });
                }
            }
        }

        console.log('Old assets to cleanup:', oldAssets);
        console.log('New assets uploaded:', newUploadedAssets);

        // Update class in database
        const yogaClass = await Class.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        // Delete old assets from Cloudinary after successful update
        if (oldAssets.length > 0) {
            console.log('EXECUTING CLOUDINARY CLEANUP for old assets...');
            await rollbackUploads(oldAssets).catch(cleanupErr => {
                console.error('Error cleaning up old assets:', cleanupErr);
            });
            console.log('Cloudinary cleanup completed');
        } else {
            console.log('No old assets to cleanup');
        }

        res.status(200).json({ success: true, data: yogaClass });
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

// @desc    Delete class
// @route   DELETE /api/classes/:id
// @access  Private (Admin)
export const deleteClass = async (req, res, next) => {
    try {
        const yogaClass = await Class.findByIdAndDelete(req.params.id);

        if (!yogaClass) {
            return res.status(404).json({ success: false, message: 'Class not found' });
        }

        // Clean up all associated Cloudinary assets
        await cleanupClassAssets(yogaClass).catch(cleanupErr => {
            console.error('Error cleaning up class assets from Cloudinary:', cleanupErr);
            // Don't fail the delete operation if Cloudinary cleanup fails
        });

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
