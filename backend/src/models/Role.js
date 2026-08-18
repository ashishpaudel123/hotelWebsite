const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    description: String,
    permissions: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Permission'
    }],
    isSystem: {
      type: Boolean,
      default: false
    }
  },
  { 
    timestamps: true 
  }
);

module.exports = mongoose.models.Role || mongoose.model("Role", roleSchema);
