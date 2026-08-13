const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstName: String,
    lastName: String,
    email: { type: String, unique: true },
    phone: String,
    roles: [{ name: String }],
  },
  { timestamps: true },
);
module.exports = mongoose.models.User || mongoose.model("User", userSchema);
