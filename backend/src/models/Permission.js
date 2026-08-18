const mongoose = require("mongoose");

const permissionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    description: String,
    resource: {
      type: String,
      required: true,
      enum: [
        'users',
        'roles',
        'rooms',
        'bookings',
        'payments',
        'cms',
        'settings',
        'reports'
      ]
    },
    action: {
      type: String,
      required: true,
      enum: ['create', 'read', 'update', 'delete', 'all']
    }
  },
  { 
    timestamps: true 
  }
);

module.exports = mongoose.models.Permission || mongoose.model("Permission", permissionSchema);
