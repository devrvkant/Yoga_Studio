import express from 'express';
import {
    getClasses,
    getClass,
    createClass,
    updateClass,
    deleteClass,
    enrollClass,
    getEnrolledUsers
} from '../controllers/classController.js';

// Middleware
import { protect, authorize } from '../middleware/authMiddleware.js';
import { optionalAuth } from '../middleware/optionalAuth.js';

const router = express.Router();

// Public routes
router.get('/', getClasses);
router.get('/:id', optionalAuth, getClass); // optionalAuth to check enrollment for paid classes

// Enrollment
router.post('/:id/enroll', protect, enrollClass);

// Admin only routes
router.get('/:id/enrolled', protect, authorize('admin'), getEnrolledUsers);
router.post('/', protect, authorize('admin'), createClass);
router.put('/:id', protect, authorize('admin'), updateClass);
router.delete('/:id', protect, authorize('admin'), deleteClass);

export default router;
