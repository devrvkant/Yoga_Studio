import express from 'express';
import {
    getSessionsByCourse,
    getSession,
    createSession,
    updateSession,
    deleteSession,
    reorderSessions
} from '../controllers/sessionController.js';

// Middleware
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router({ mergeParams: true }); // mergeParams to access :courseId from parent

// Public routes
router.get('/', getSessionsByCourse);
router.get('/:id', getSession);

// Admin only routes
router.post('/', protect, authorize('admin'), createSession);
router.put('/reorder', protect, authorize('admin'), reorderSessions);
router.put('/:id', protect, authorize('admin'), updateSession);
router.delete('/:id', protect, authorize('admin'), deleteSession);

export default router;
