import express from 'express';
import {
    getCourses,
    getCourse,
    createCourse,
    updateCourse,
    deleteCourse,
    enrollCourse,
    getEnrolledUsers
} from '../controllers/courseController.js';

// Middleware
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getCourses);
router.get('/:id', getCourse);

// Enrollment
router.post('/:id/enroll', protect, enrollCourse);

// Admin only routes
router.get('/:id/enrolled', protect, authorize('admin'), getEnrolledUsers);
router.post('/', protect, authorize('admin'), createCourse);
router.put('/:id', protect, authorize('admin'), updateCourse);
router.delete('/:id', protect, authorize('admin'), deleteCourse);

export default router;
