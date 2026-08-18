const mongoose = require("mongoose");

const testimonialSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: String,
    avatar: String,
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    title: String,
    content: { type: String, required: true },
    position: String,
    company: String,
    location: String,
    isVerified: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.models.Testimonial || mongoose.model("Testimonial", testimonialSchema);
