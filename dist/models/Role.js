"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Role = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const roleSchema = new mongoose_1.Schema({
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
            type: mongoose_1.Schema.Types.ObjectId,
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
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
    },
    updatedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
    deletedAt: {
        type: Date,
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
// Indexes for performance
roleSchema.index({ slug: 1 }, { unique: true });
roleSchema.index({ status: 1 });
roleSchema.index({ accessLevel: 1 });
roleSchema.index({ isSystem: 1, status: 1 });
// Pre-save hook to ensure system roles cannot be deleted
roleSchema.pre('findOneAndUpdate', async function (next) {
    const update = this.getUpdate();
    if (update.isDeleted) {
        const doc = await this.model.findOne(this.getQuery());
        if (doc && doc.isSystem) {
            return next(new Error('Cannot delete system roles'));
        }
    }
    next();
});
exports.Role = mongoose_1.default.model('Role', roleSchema);
//# sourceMappingURL=Role.js.map