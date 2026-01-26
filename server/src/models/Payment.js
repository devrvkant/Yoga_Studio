import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
    // User who made the payment
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // What they purchased
    itemType: {
        type: String,
        enum: ['class', 'course'],
        required: true
    },
    itemId: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'itemModel',
        required: true
    },
    itemModel: {
        type: String,
        enum: ['Class', 'Course'],
        required: true
    },

    // Digistore24 data
    orderId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    transactionId: {
        type: String
    },
    productId: {
        type: String,
        required: true
    },
    affiliateId: {
        type: String
    },

    // Customer info from Digistore
    customerEmail: {
        type: String,
        required: true
    },
    customerName: {
        type: String
    },

    // Payment details
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'EUR'
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'refunded', 'chargebacked', 'cancelled'],
        default: 'pending'
    },

    // Timestamps
    paidAt: {
        type: Date
    },
    refundedAt: {
        type: Date
    },

    // Raw IPN data for audit trail
    ipnData: {
        type: mongoose.Schema.Types.Mixed
    },

    // Notes for admin
    notes: {
        type: String
    }
}, {
    timestamps: true
});

// Indexes for common queries
paymentSchema.index({ user: 1, status: 1 });
paymentSchema.index({ productId: 1 });
paymentSchema.index({ customerEmail: 1 });
paymentSchema.index({ createdAt: -1 });

// Virtual for item reference
paymentSchema.virtual('item', {
    ref: function () { return this.itemModel; },
    localField: 'itemId',
    foreignField: '_id',
    justOne: true
});

export default mongoose.model('Payment', paymentSchema);
