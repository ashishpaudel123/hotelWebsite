const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, unique: true, required: true, lowercase: true },
    description: { type: String, required: true },
    shortDescription: String,
    eventType: {
      type: String,
      enum: ['wedding', 'conference', 'party', 'meeting', 'workshop', 'other'],
      required: true
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    location: {
      venue: String,
      address: String,
      city: String,
      country: String
    },
    images: [String],
    featuredImage: String,
    price: Number,
    maxAttendees: Number,
    currentAttendees: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['draft', 'published', 'cancelled', 'completed'],
      default: 'draft'
    },
    isFeatured: { type: Boolean, default: false },
    amenities: [String],
    contactPerson: {
      name: String,
      email: String,
      phone: String
    }
  },
  { timestamps: true }
);

module.exports = mongoose.models.Event || mongoose.model("Event", eventSchema);
