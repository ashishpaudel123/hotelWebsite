const mongoose = require("mongoose");

const roomTypeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, unique: true },
    description: String,
    basePrice: { type: Number, default: 0 },
    totalRooms: { type: Number, default: 0 },
    maxOccupancy: { type: Number, default: 2 },
    amenities: [String],
  },
  { timestamps: true },
);
// Guard against model overwrite when files are loaded multiple times
module.exports =
  mongoose.models.RoomType || mongoose.model("RoomType", roomTypeSchema);
