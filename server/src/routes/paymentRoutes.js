import express from 'express';
import {
    handleDigistoreIPN,
    createCheckoutUrl,
    getPaymentHistory,
    getAllPayments
} from '../controllers/paymentController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Digistore24 IPN webhook - No auth (uses signature verification)
// IMPORTANT: This must be accessible without authentication
router.post('/digistore/ipn', handleDigistoreIPN);

// Protected routes
router.use(protect);

// Get checkout URL for a product
router.post('/checkout', createCheckoutUrl);

// Get user's payment history
router.get('/history', getPaymentHistory);

// Admin only
router.get('/', authorize('admin'), getAllPayments);

export default router;
