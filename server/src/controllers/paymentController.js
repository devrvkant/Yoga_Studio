import crypto from 'crypto';
import Payment from '../models/Payment.js';
import User from '../models/User.js';
import Class from '../models/Class.js';
import Course from '../models/Course.js';

/**
 * Create IPN signature for verification
 * Digistore24 uses SHA512 hash of sorted params + passphrase
 */
function createIPNSignature(data) {
    const passphrase = process.env.DIGISTORE_IPN_PASSPHRASE;
    if (!passphrase) {
        console.error('DIGISTORE_IPN_PASSPHRASE not configured');
        return null;
    }

    // Get all keys except sha_sign, sort them alphabetically
    const sortedKeys = Object.keys(data)
        .filter(key => key !== 'sha_sign')
        .sort();

    // Concatenate values in sorted key order + passphrase
    const signString = sortedKeys.map(key => data[key] || '').join('') + passphrase;

    // Create SHA512 hash and uppercase it
    return crypto.createHash('sha512').update(signString, 'utf8').digest('hex').toUpperCase();
}

/**
 * Verify IPN signature
 */
function verifyIPNSignature(data) {
    const receivedSignature = data.sha_sign;
    if (!receivedSignature) {
        console.error('No sha_sign in IPN data');
        return false;
    }

    const calculatedSignature = createIPNSignature(data);
    if (!calculatedSignature) {
        return false;
    }

    return receivedSignature.toUpperCase() === calculatedSignature;
}

/**
 * Grant access to a class/course after successful payment
 */
async function grantAccess(user, item, itemType) {
    if (itemType === 'class') {
        // Add user to class
        await Class.findByIdAndUpdate(item._id, {
            $addToSet: { enrolledUsers: user._id }
        });
        // Add class to user
        await User.findByIdAndUpdate(user._id, {
            $addToSet: { enrolledClasses: item._id }
        });
    } else {
        // Add user to course
        await Course.findByIdAndUpdate(item._id, {
            $addToSet: { enrolledUsers: user._id }
        });
        // Add course to user
        await User.findByIdAndUpdate(user._id, {
            $addToSet: { enrolledCourses: item._id }
        });
    }
    console.log(`Access granted: User ${user.email} -> ${itemType} ${item.title}`);
}

/**
 * Revoke access after refund/chargeback
 */
async function revokeAccess(user, item, itemType) {
    if (itemType === 'class') {
        await Class.findByIdAndUpdate(item._id, {
            $pull: { enrolledUsers: user._id }
        });
        await User.findByIdAndUpdate(user._id, {
            $pull: { enrolledClasses: item._id }
        });
    } else {
        await Course.findByIdAndUpdate(item._id, {
            $pull: { enrolledUsers: user._id }
        });
        await User.findByIdAndUpdate(user._id, {
            $pull: { enrolledCourses: item._id }
        });
    }
    console.log(`Access revoked: User ${user.email} -> ${itemType} ${item.title}`);
}

/**
 * Handle successful payment
 */
async function handlePayment(user, item, itemType, ipnData) {
    const orderId = ipnData.order_id;

    // Check idempotency - if already processed, skip
    const existingPayment = await Payment.findOne({ orderId });
    if (existingPayment && existingPayment.status === 'completed') {
        console.log(`Order ${orderId} already processed, skipping`);
        return;
    }

    // Create or update payment record
    const paymentData = {
        user: user._id,
        itemType,
        itemId: item._id,
        itemModel: itemType === 'class' ? 'Class' : 'Course',
        orderId,
        transactionId: ipnData.transaction_id || ipnData.billing_item_id,
        productId: ipnData.product_id,
        affiliateId: ipnData.affiliate_id || null,
        customerEmail: ipnData.email,
        customerName: `${ipnData.address_first_name || ''} ${ipnData.address_last_name || ''}`.trim(),
        amount: parseFloat(ipnData.amount) || 0,
        currency: ipnData.currency || 'EUR',
        status: 'completed',
        paidAt: new Date(),
        ipnData
    };

    await Payment.findOneAndUpdate(
        { orderId },
        paymentData,
        { upsert: true, new: true }
    );

    // Grant access
    await grantAccess(user, item, itemType);

    console.log(`Payment processed: Order ${orderId}, User ${user.email}, ${itemType} ${item.title}`);
}

/**
 * Handle refund or chargeback
 */
async function handleRefund(user, item, itemType, ipnData, event) {
    const orderId = ipnData.order_id;
    const status = event === 'on_refund' ? 'refunded' : 'chargebacked';

    // Update payment record
    await Payment.findOneAndUpdate(
        { orderId },
        {
            status,
            refundedAt: new Date(),
            $push: { ipnData: { event, timestamp: new Date(), data: ipnData } }
        }
    );

    // Revoke access
    await revokeAccess(user, item, itemType);

    console.log(`${status}: Order ${orderId}, User ${user.email}, ${itemType} ${item.title}`);
}

// @desc    Handle Digistore24 IPN notifications
// @route   POST /api/payments/digistore/ipn
// @access  Public (verified by signature)
export const handleDigistoreIPN = async (req, res) => {
    console.log('=== DIGISTORE24 IPN RECEIVED ===');
    console.log('Event:', req.body.event);
    console.log('Order ID:', req.body.order_id);
    console.log('Product ID:', req.body.product_id);
    console.log('Email:', req.body.email);

    try {
        // 1. Verify signature
        if (!verifyIPNSignature(req.body)) {
            console.error('IPN signature verification FAILED');
            // Still return 200 to prevent retries, but log the error
            return res.status(200).send('OK');
        }
        console.log('IPN signature verified successfully');

        const ipnData = req.body;
        const event = ipnData.event;
        const email = ipnData.email?.toLowerCase();
        const productId = ipnData.product_id;

        // 2. Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            console.error(`User not found for email: ${email}`);
            // Return OK - we don't want Digistore to keep retrying
            return res.status(200).send('OK');
        }

        // 3. Find the product (class or course) by Digistore product ID
        let item = await Class.findOne({ digistoreProductId: productId });
        let itemType = 'class';

        if (!item) {
            item = await Course.findOne({ digistoreProductId: productId });
            itemType = 'course';
        }

        if (!item) {
            console.error(`Product not found for Digistore ID: ${productId}`);
            return res.status(200).send('OK');
        }

        // 4. Handle different events
        switch (event) {
            case 'on_payment':
                await handlePayment(user, item, itemType, ipnData);
                break;

            case 'on_refund':
            case 'on_chargeback':
                await handleRefund(user, item, itemType, ipnData, event);
                break;

            case 'on_payment_missed':
                // For subscription payments - could revoke access
                console.log(`Payment missed: Order ${ipnData.order_id}`);
                break;

            default:
                console.log(`Unhandled IPN event: ${event}`);
        }

        // Always return 200 OK to Digistore
        res.status(200).send('OK');

    } catch (error) {
        console.error('IPN processing error:', error);
        // Still return 200 to prevent retries
        res.status(200).send('OK');
    }
};

// @desc    Create checkout URL for Digistore24
// @route   POST /api/payments/checkout
// @access  Private
export const createCheckoutUrl = async (req, res) => {
    try {
        const { itemType, itemId } = req.body;
        const user = req.user;

        if (!itemType || !itemId) {
            return res.status(400).json({
                success: false,
                message: 'itemType and itemId are required'
            });
        }

        // Find the item
        let item;
        if (itemType === 'class') {
            item = await Class.findById(itemId);
        } else if (itemType === 'course') {
            item = await Course.findById(itemId);
        }

        if (!item) {
            return res.status(404).json({
                success: false,
                message: `${itemType} not found`
            });
        }

        if (!item.isPaid) {
            return res.status(400).json({
                success: false,
                message: 'This item is free, no payment required'
            });
        }

        if (!item.digistoreProductId) {
            return res.status(400).json({
                success: false,
                message: 'Payment not configured for this item'
            });
        }

        // Check if already enrolled
        const isEnrolled = itemType === 'class'
            ? user.enrolledClasses?.includes(itemId)
            : user.enrolledCourses?.includes(itemId);

        if (isEnrolled) {
            return res.status(400).json({
                success: false,
                message: 'You are already enrolled in this item'
            });
        }

        // Build Digistore24 checkout URL
        // Format: https://www.digistore24.com/product/{product_id}?email={email}&custom={custom_data}
        const vendorId = process.env.DIGISTORE_VENDOR_ID;
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

        // Custom data to pass through (for tracking)
        const customData = Buffer.from(JSON.stringify({
            userId: user._id,
            itemType,
            itemId
        })).toString('base64');

        const checkoutUrl = new URL(`https://www.digistore24.com/product/${item.digistoreProductId}`);
        checkoutUrl.searchParams.set('email', user.email);
        checkoutUrl.searchParams.set('custom', customData);
        // Return URLs
        checkoutUrl.searchParams.set('thankyouurl', `${frontendUrl}/payment/success`);
        checkoutUrl.searchParams.set('cancelurl', `${frontendUrl}/payment/cancelled`);

        res.status(200).json({
            success: true,
            data: {
                checkoutUrl: checkoutUrl.toString(),
                item: {
                    type: itemType,
                    title: item.title,
                    price: item.price,
                    image: item.image
                }
            }
        });

    } catch (error) {
        console.error('Checkout URL error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create checkout URL'
        });
    }
};

// @desc    Get user's payment history
// @route   GET /api/payments/history
// @access  Private
export const getPaymentHistory = async (req, res) => {
    try {
        const payments = await Payment.find({ user: req.user._id })
            .populate('itemId', 'title image')
            .sort({ createdAt: -1 })
            .limit(50);

        res.status(200).json({
            success: true,
            count: payments.length,
            data: payments
        });

    } catch (error) {
        console.error('Payment history error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch payment history'
        });
    }
};

// @desc    Get all payments (admin)
// @route   GET /api/payments
// @access  Private (Admin)
export const getAllPayments = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const payments = await Payment.find()
            .populate('user', 'name email')
            .populate('itemId', 'title')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Payment.countDocuments();

        res.status(200).json({
            success: true,
            count: payments.length,
            total,
            page,
            pages: Math.ceil(total / limit),
            data: payments
        });

    } catch (error) {
        console.error('Get all payments error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch payments'
        });
    }
};
