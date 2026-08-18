const mongoose = require("mongoose");

const gallerySchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    category: {
      type: String,
      enum: ['rooms', 'restaurant', 'spa', 'pool', 'gym', 'events', 'exterior', 'lobby', 'other'],
      default: 'other'
    },
    images: [{
      url: { type: String, required: true },
      caption: String,
      altText: String,
      isPrimary: { type: Boolean, default: false }
    }],
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.models.Gallery || mongoose.model("Gallery", gallerySchema);
