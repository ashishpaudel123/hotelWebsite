const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  bookingReference: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  guestDetails: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    country: String,
    specialRequests: String
  },
  checkIn: {
    type: Date,
    required: true
  },
  checkOut: {
    type: Date,
    required: true
  },
  rooms: [{
    roomTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RoomType',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    pricePerNight: {
      type: Number,
      required: true
    },
    totalNights: {
      type: Number,
      required: true
    }
  }],
  pricing: {
    subtotal: { type: Number, required: true },
    tax: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    couponCode: String,
    total: { type: Number, required: true },
    currency: { type: String, default: 'NPR' }
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'failed'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'partial', 'paid', 'refunded'],
    default: 'unpaid'
  },
  cancellationPolicy: {
    applicable: { type: Boolean, default: true },
    refundAmount: { type: Number, default: 0 },
    deadline: Date
  },
  source: {
    type: String,
    enum: ['website', 'mobile_app', 'walk_in', 'ota'],
    default: 'website'
  },
  assignedStaff: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  metadata: {
    ipAddress: String,
    userAgent: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
bookingSchema.index({ bookingReference: 1 });
bookingSchema.index({ customerId: 1, status: 1 });
bookingSchema.index({ checkIn: 1, checkOut: 1, status: 1 });
bookingSchema.index({ status: 1, paymentStatus: 1 });
bookingSchema.index({ createdAt: -1 });

// Virtual for total nights calculation
bookingSchema.virtual('totalNights').get(function() {
  const oneDay = 24 * 60 * 60 * 1000;
  return Math.round(Math.abs((this.checkOut - this.checkIn) / oneDay));
});

// Pre-save hook to generate reference
bookingSchema.pre('save', async function(next) {
  if (this.isNew && !this.bookingReference) {
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomPart = Math.floor(1000 + Math.random() * 9000);
    this.bookingReference = `HTL-${datePart}-${randomPart}`;
  }
  next();
});

// Soft delete handling
bookingSchema.methods.softDelete = async function() {
  this.status = 'cancelled';
  await this.save();
};

module.exports = mongoose.model('Booking', bookingSchema);
