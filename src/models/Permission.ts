import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IPermission extends Document {
  _id: Types.ObjectId;
  name: string;
  resource: string;
  action: string;
  description?: string;
  status: 'active' | 'inactive';
  isSystem: boolean;
  createdBy?: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const permissionSchema = new Schema<IPermission>(
  {
    name: {
      type: String,
      required: [true, 'Permission name is required'],
      trim: true,
      unique: true,
      maxlength: [100, 'Permission name cannot exceed 100 characters'],
    },
    resource: {
      type: String,
      required: [true, 'Resource is required'],
      lowercase: true,
      trim: true,
      index: true,
    },
    action: {
      type: String,
      required: [true, 'Action is required'],
      lowercase: true,
      trim: true,
      enum: ['create', 'read', 'update', 'delete', 'manage', 'approve', 'export', 'import'],
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
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound unique index on resource and action
permissionSchema.index({ resource: 1, action: 1 }, { unique: true });
permissionSchema.index({ status: 1 });
permissionSchema.index({ isSystem: 1, status: 1 });

// Virtual for full permission string (e.g., "booking:create")
permissionSchema.virtual('permissionString').get(function() {
  return `${this.resource}:${this.action}`;
});

// Static method to find permissions by resource
permissionSchema.statics.findByResource = function(resource: string) {
  return this.find({ resource, status: 'active', isDeleted: false });
};

// Static method to find all active permissions
permissionSchema.statics.findActive = function() {
  return this.find({ status: 'active', isDeleted: false });
};

export const Permission = mongoose.model<IPermission>('Permission', permissionSchema);
