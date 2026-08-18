const mongoose = require("mongoose");

const menuItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, unique: true, required: true, lowercase: true },
    description: String,
    category: {
      type: String,
      enum: ['appetizer', 'main', 'dessert', 'beverage', 'wine', 'cocktail', 'special'],
      required: true
    },
    price: { type: Number, required: true, min: 0 },
    image: String,
    isVegetarian: { type: Boolean, default: false },
    isVegan: { type: Boolean, default: false },
    isGlutenFree: { type: Boolean, default: false },
    isSpicy: { type: Boolean, default: false },
    allergens: [String],
    calories: Number,
    preparationTime: Number, // in minutes
    isAvailable: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    order: { type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.models.MenuItem || mongoose.model("MenuItem", menuItemSchema);
