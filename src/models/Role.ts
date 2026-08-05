import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IRole extends Document {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  permissions: Types.ObjectId[];
  accessLevel: number;
  canApproveBookings: boolean;
  canManagePayments: boolean;
  canManageUsers: boolean;
  canManageCMS: boolean;
  canManageSettings: boolean;
  status: 'active' | 'inactive';
  isSystem: boolean;
  createdBy?: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const roleSchema = new Schema<IRole>(
  {
    name: {
      type: String,
      required: [true, 'Role name is required'],
      trim: true,
      unique: true,
      maxlength: [50, 'Role name cannot exceed 50 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Role slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9-_]+$/, 'Slug must contain only lowercase letters, numbers, hyphens, and underscores'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    permissions: [{
      type: Schema.Types.ObjectId,
      ref: 'Permission',
    }],
    accessLevel: {
      type: Number,
      default: 1,
      min: 1,
      max: 100,
    },
    canApproveBookings: {
      type: Boolean,
      default: false,
    },
    canManagePayments: {
      type: Boolean,
      default: false,
    },
    canManageUsers: {
      type: Boolean,
      default: false,
    },
    canManageCMS: {
      type: Boolean,
      default: false,
    },
    canManageSettings: {
      type: Boolean,
      default: false,
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

// Indexes for performance
roleSchema.index({ slug: 1 }, { unique: true });
roleSchema.index({ status: 1 });
roleSchema.index({ accessLevel: 1 });
roleSchema.index({ isSystem: 1, status: 1 });

// Pre-save hook to ensure system roles cannot be deleted
roleSchema.pre('findOneAndUpdate', async function(next) {
  const update = this.getUpdate() as any;
  if (update.isDeleted) {
    const doc = await this.model.findOne(this.getQuery());
    if (doc && (doc as any).isSystem) {
      return next(new Error('Cannot delete system roles'));
    }
  }
  next();
});

export const Role = mongoose.model<IRole>('Role', roleSchema);
