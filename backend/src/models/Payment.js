const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  transactionId: {
    type: String,
    required: true,
    unique: true
  },
  provider: {
    type: String,
    enum: ['esewa', 'khalti', 'stripe', 'bank_transfer'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'NPR'
  },
  type: {
    type: String,
    enum: ['payment', 'refund'],
    default: 'payment'
  },
  status: {
    type: String,
    enum: ['pending', 'success', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'debit_card', 'mobile_banking', 'wallet']
  },
  gatewayResponse: {
    statusCode: String,
    message: String,
    transactionCode: String,
    rawResponse: mongoose.Schema.Types.Mixed
  },
  receiptUrl: String,
  refundDetails: {
    reason: String,
    amount: Number,
    refundedAt: Date,
    refundTransactionId: String
  },
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  metadata: {
    ipAddress: String,
    userAgent: String,
    webhookAttempts: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

// Indexes
paymentSchema.index({ transactionId: 1 });
paymentSchema.index({ bookingId: 1 });
paymentSchema.index({ status: 1, provider: 1 });
paymentSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Payment', paymentSchema);
