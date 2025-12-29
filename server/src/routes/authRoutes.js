import express from 'express';
const router = express.Router();
import { register, login, logout, getMe } from '../controllers/authController.js';

router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);
router.get('/me', getMe);

export default router;
