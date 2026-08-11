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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const userSchema = new mongoose_1.Schema({
    firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true,
        minlength: [2, 'First name must be at least 2 characters'],
        maxlength: [50, 'First name cannot exceed 50 characters'],
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required'],
        trim: true,
        minlength: [2, 'Last name must be at least 2 characters'],
        maxlength: [50, 'Last name cannot exceed 50 characters'],
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters'],
        select: false, // Don't return password by default
    },
    phone: {
        type: String,
        trim: true,
    },
    avatar: {
        type: String,
    },
    role: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Role',
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'suspended', 'deleted'],
        default: 'active',
    },
    lastLogin: {
        type: Date,
    },
    loginAttempts: {
        type: Number,
        default: 0,
    },
    lockUntil: {
        type: Date,
    },
    refreshToken: {
        type: String,
        select: false,
    },
    passwordChangedAt: {
        type: Date,
    },
    passwordResetToken: {
        type: String,
        select: false,
    },
    passwordResetExpires: {
        type: Date,
    },
    preferences: {
        language: { type: String, default: 'en' },
        timezone: { type: String, default: 'UTC' },
        notifications: {
            email: { type: Boolean, default: true },
            sms: { type: Boolean, default: false },
            push: { type: Boolean, default: true },
        },
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
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1, status: 1 });
userSchema.index({ phone: 1 });
userSchema.index({ status: 1, isDeleted: 1 });
userSchema.index({ createdAt: -1 });
// Virtual for full name
userSchema.virtual('fullName').get(function () {
    return `${this.firstName} ${this.lastName}`;
});
// Pre-save hook to hash password
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    try {
        const salt = await bcryptjs_1.default.genSalt(12);
        this.password = await bcryptjs_1.default.hash(this.password, salt);
        next();
    }
    catch (error) {
        next(error);
    }
});
// Method to check if account is locked
userSchema.methods.isLocked = function () {
    return !!(this.lockUntil && this.lockUntil > new Date());
};
// Static method to find active users
userSchema.statics.findActive = function () {
    return this.find({ status: 'active', isDeleted: false });
};
exports.User = mongoose_1.default.model('User', userSchema);
//# sourceMappingURL=User.js.map