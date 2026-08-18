const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    slug: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      trim: true
    },
    description: String,
    roomType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RoomType',
      required: true
    },
    floor: Number,
    status: {
      type: String,
      enum: ['available', 'occupied', 'maintenance', 'booked'],
      default: 'available'
    },
    pricePerNight: {
      type: Number,
      required: true,
      min: 0
    },
    discountPrice: {
      type: Number,
      min: 0
    },
    maxOccupancy: {
      adults: { type: Number, default: 2 },
      children: { type: Number, default: 0 }
    },
    size: Number, // in sq ft or sq meters
    amenities: [{
      type: String,
      enum: [
        'wifi',
        'tv',
        'ac',
        'minibar',
        'safe',
        'balcony',
        'bathtub',
        'shower',
        'cityView',
        'oceanView',
        'kingBed',
        'twinBeds',
        'workspace',
        'coffeeMaker'
      ]
    }],
    images: [{
      url: String,
      caption: String,
      isPrimary: { type: Boolean, default: false }
    }],
    isFeatured: {
      type: Boolean,
      default: false
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for faster queries
roomSchema.index({ slug: 1 });
roomSchema.index({ status: 1 });
roomSchema.index({ roomType: 1 });
roomSchema.index({ isFeatured: 1 });
roomSchema.index({ isActive: 1 });

module.exports = mongoose.models.Room || mongoose.model("Room", roomSchema);
