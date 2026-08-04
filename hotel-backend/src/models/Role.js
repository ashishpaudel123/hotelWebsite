import mongoose from 'mongoose';

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Role name is required'],
    minlength: [2, 'Role name must be at least 2 characters'],
    trim: true,
  },
  slug: {
    type: String,
    required: [true, 'Role slug is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[a-z0-9_-]+$/, 'Slug must contain only lowercase letters, numbers, hyphens, and underscores'],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters'],
  },
  permissions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Permission',
  }],
  accessLevel: {
    type: Number,
    int: true,
    min: [1, 'Access level must be at least 1'],
    max: [100, 'Access level cannot exceed 100'],
    default: 1,
  },
  canApproveBookings: {
    type: Boolean,
    default: false,
  },
  canManagePayments: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes
roleSchema.index({ slug: 1 }, { unique: true });
roleSchema.index({ status: 1 });
roleSchema.index({ name: 1 });

// Virtual for permission count
roleSchema.virtual('permissionCount').get(function() {
  return this.permissions ? this.permissions.length : 0;
});

// Pre-delete hook to check if role is assigned to users
roleSchema.pre('findOneAndDelete', async function(next) {
  const Role = this.model;
  const User = mongoose.model('User');
  
  const doc = await Role.findOne(this.getFilter());
  if (!doc) {
    return next();
  }

  // Check if any user has this role (excluding deleted users)
  const userCount = await User.countDocuments({ 
    role: doc._id, 
    isDeleted: false 
  });
  
  if (userCount > 0) {
    throw new Error(`Cannot delete role. ${userCount} user(s) are assigned to this role.`);
  }
  
  next();
});

const Role = mongoose.model('Role', roleSchema);

export default Role;
