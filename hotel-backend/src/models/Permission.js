import mongoose from 'mongoose';

const permissionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Permission name is required'],
    minlength: [2, 'Permission name must be at least 2 characters'],
    trim: true,
  },
  resource: {
    type: String,
    required: [true, 'Resource is required'],
    trim: true,
  },
  action: {
    type: String,
    required: [true, 'Action is required'],
    enum: ['read', 'write', 'update', 'delete', 'manage', 'all'],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters'],
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  },
  isSystem: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Compound unique index on resource and action
permissionSchema.index({ resource: 1, action: 1 }, { unique: true });
permissionSchema.index({ status: 1 });
permissionSchema.index({ resource: 1 });

// Pre-save hook to prevent deletion of system permissions
permissionSchema.pre('findOneAndDelete', async function(next) {
  const doc = await this.model.findOne(this.getFilter());
  if (doc && doc.isSystem) {
    throw new Error('Cannot delete system permissions');
  }
  next();
});

const Permission = mongoose.model('Permission', permissionSchema);

export default Permission;
