import Session from '../models/Session.js';
import Course from '../models/Course.js';
import { rollbackUploads, extractPublicId, deleteFromCloudinary } from '../services/cloudinaryService.js';

/**
 * @desc    Get all sessions for a course
 * @route   GET /api/courses/:courseId/sessions
 * @access  Public (but video hidden for paid courses if not enrolled)
 */
export const getSessionsByCourse = async (req, res) => {
    try {
        const { courseId } = req.params;

        // Verify course exists
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        let sessions = await Session.find({ courseId }).sort({ order: 1 });

        // Security: Hide video URLs for paid courses if user is not enrolled
        if (course.isPaid) {
            const isEnrolled = req.user && course.enrolledUsers.some(
                userId => userId.toString() === req.user.id
            );
            const isAdmin = req.user && req.user.role === 'admin';

            if (!isEnrolled && !isAdmin) {
                // Strip video from each session
                sessions = sessions.map(session => {
                    const sessionObj = session.toObject();
                    delete sessionObj.video;
                    return sessionObj;
                });
            }
        }

        res.status(200).json({ success: true, count: sessions.length, data: sessions });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

/**
 * @desc    Get single session
 * @route   GET /api/courses/:courseId/sessions/:id
 * @access  Public (but video hidden for paid courses if not enrolled)
 */
export const getSession = async (req, res) => {
    try {
        const session = await Session.findById(req.params.id);

        if (!session) {
            return res.status(404).json({ success: false, message: 'Session not found' });
        }

        // Get parent course to check if paid
        const course = await Course.findById(session.courseId);

        // Security: Hide video URL for paid courses if user is not enrolled
        if (course && course.isPaid) {
            const isEnrolled = req.user && course.enrolledUsers.some(
                userId => userId.toString() === req.user.id
            );
            const isAdmin = req.user && req.user.role === 'admin';

            if (!isEnrolled && !isAdmin) {
                const sessionData = session.toObject();
                delete sessionData.video;
                return res.status(200).json({ success: true, data: sessionData });
            }
        }

        res.status(200).json({ success: true, data: session });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

/**
 * @desc    Create new session
 * @route   POST /api/courses/:courseId/sessions
 * @access  Private (Admin)
 */
export const createSession = async (req, res) => {
    const uploadedAssets = [];

    try {
        const { courseId } = req.params;

        // Verify course exists
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        // Track uploaded assets for potential rollback
        if (req.body.video) {
            const videoPublicId = extractPublicId(req.body.video);
            if (videoPublicId) {
                uploadedAssets.push({ publicId: videoPublicId, resourceType: 'video' });
            }
        }
        if (req.body.thumbnail) {
            const thumbnailPublicId = extractPublicId(req.body.thumbnail);
            if (thumbnailPublicId) {
                uploadedAssets.push({ publicId: thumbnailPublicId, resourceType: 'image' });
            }
        }

        // Get the next order number
        const lastSession = await Session.findOne({ courseId }).sort({ order: -1 });
        const nextOrder = lastSession ? lastSession.order + 1 : 1;

        // Create session
        const session = await Session.create({
            ...req.body,
            courseId,
            order: req.body.order || nextOrder
        });

        res.status(201).json({ success: true, data: session });
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

/**
 * @desc    Update session
 * @route   PUT /api/courses/:courseId/sessions/:id
 * @access  Private (Admin)
 */
export const updateSession = async (req, res) => {
    const newUploadedAssets = [];
    const oldAssets = [];

    try {
        const existingSession = await Session.findById(req.params.id);
        if (!existingSession) {
            return res.status(404).json({ success: false, message: 'Session not found' });
        }

        console.log('=== SESSION UPDATE - Asset Change Detection ===');
        console.log('Existing video:', existingSession.video);
        console.log('New video:', req.body.video);
        console.log('Existing thumbnail:', existingSession.thumbnail);
        console.log('New thumbnail:', req.body.thumbnail);

        // Track video changes (including removal)
        const videoChanged = 'video' in req.body && req.body.video !== existingSession.video;
        if (videoChanged) {
            console.log('SESSION VIDEO CHANGED - Will cleanup old video');
            // Cleanup old video if it exists
            if (existingSession.video) {
                const oldVideoId = extractPublicId(existingSession.video);
                if (oldVideoId) {
                    oldAssets.push({ publicId: oldVideoId, resourceType: 'video' });
                }
            }
            // Track new video for potential rollback
            if (req.body.video) {
                const newVideoId = extractPublicId(req.body.video);
                if (newVideoId) {
                    newUploadedAssets.push({ publicId: newVideoId, resourceType: 'video' });
                }
            }
        }

        // Track thumbnail changes (including removal)
        const thumbnailChanged = 'thumbnail' in req.body && req.body.thumbnail !== existingSession.thumbnail;
        if (thumbnailChanged) {
            console.log('SESSION THUMBNAIL CHANGED - Will cleanup old thumbnail');
            // Cleanup old thumbnail if it exists
            if (existingSession.thumbnail) {
                const oldThumbnailId = extractPublicId(existingSession.thumbnail);
                if (oldThumbnailId) {
                    oldAssets.push({ publicId: oldThumbnailId, resourceType: 'image' });
                }
            }
            // Track new thumbnail for potential rollback
            if (req.body.thumbnail) {
                const newThumbnailId = extractPublicId(req.body.thumbnail);
                if (newThumbnailId) {
                    newUploadedAssets.push({ publicId: newThumbnailId, resourceType: 'image' });
                }
            }
        }

        console.log('Old assets to cleanup:', oldAssets);
        console.log('New assets uploaded:', newUploadedAssets);

        // Update session in database
        const session = await Session.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        // Delete old assets from Cloudinary after successful update
        if (oldAssets.length > 0) {
            console.log('EXECUTING CLOUDINARY CLEANUP for old session assets...');
            await rollbackUploads(oldAssets).catch(cleanupErr => {
                console.error('Error cleaning up old assets:', cleanupErr);
            });
            console.log('Cloudinary cleanup completed');
        } else {
            console.log('No old assets to cleanup');
        }

        res.status(200).json({ success: true, data: session });
    } catch (err) {
        // Rollback: Delete new uploaded assets if DB update failed
        if (newUploadedAssets.length > 0) {
            console.log('DB update error occurred, rolling back new Cloudinary uploads...');
            await rollbackUploads(newUploadedAssets).catch(rollbackErr => {
                console.error('Rollback failed:', rollbackErr);
            });
        }
        res.status(400).json({ success: false, error: err.message });
    }
};

/**
 * @desc    Delete session
 * @route   DELETE /api/courses/:courseId/sessions/:id
 * @access  Private (Admin)
 */
export const deleteSession = async (req, res) => {
    try {
        const session = await Session.findByIdAndDelete(req.params.id);

        if (!session) {
            return res.status(404).json({ success: false, message: 'Session not found' });
        }

        // Clean up Cloudinary assets
        const assetsToDelete = [];

        if (session.video) {
            const videoId = extractPublicId(session.video);
            if (videoId) {
                assetsToDelete.push({ publicId: videoId, resourceType: 'video' });
            }
        }

        if (session.thumbnail) {
            const thumbnailId = extractPublicId(session.thumbnail);
            if (thumbnailId) {
                assetsToDelete.push({ publicId: thumbnailId, resourceType: 'image' });
            }
        }

        if (assetsToDelete.length > 0) {
            await rollbackUploads(assetsToDelete).catch(cleanupErr => {
                console.error('Error cleaning up session assets from Cloudinary:', cleanupErr);
            });
        }

        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

/**
 * @desc    Reorder sessions
 * @route   PUT /api/courses/:courseId/sessions/reorder
 * @access  Private (Admin)
 */
export const reorderSessions = async (req, res) => {
    try {
        const { sessionOrders } = req.body; // Array of { id, order }

        if (!Array.isArray(sessionOrders)) {
            return res.status(400).json({ success: false, message: 'sessionOrders must be an array' });
        }

        const bulkOps = sessionOrders.map(({ id, order }) => ({
            updateOne: {
                filter: { _id: id },
                update: { order }
            }
        }));

        await Session.bulkWrite(bulkOps);

        const sessions = await Session.find({ courseId: req.params.courseId }).sort({ order: 1 });
        res.status(200).json({ success: true, data: sessions });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
