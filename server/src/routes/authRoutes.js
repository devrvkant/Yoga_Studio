import express from 'express';
const router = express.Router();
import { protect, authorize } from '../middleware/authMiddleware.js';
import { getAllUsers, getMe, login, logout, register } from '../controllers/authController.js';

router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);
router.get('/me', protect, getMe);
router.get('/users', protect, authorize('admin'), getAllUsers);

export default router;
