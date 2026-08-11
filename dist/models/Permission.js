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
exports.Permission = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const permissionSchema = new mongoose_1.Schema({
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
// Compound unique index on resource and action
permissionSchema.index({ resource: 1, action: 1 }, { unique: true });
permissionSchema.index({ status: 1 });
permissionSchema.index({ isSystem: 1, status: 1 });
// Virtual for full permission string (e.g., "booking:create")
permissionSchema.virtual('permissionString').get(function () {
    return `${this.resource}:${this.action}`;
});
// Static method to find permissions by resource
permissionSchema.statics.findByResource = function (resource) {
    return this.find({ resource, status: 'active', isDeleted: false });
};
// Static method to find all active permissions
permissionSchema.statics.findActive = function () {
    return this.find({ status: 'active', isDeleted: false });
};
exports.Permission = mongoose_1.default.model('Permission', permissionSchema);
//# sourceMappingURL=Permission.js.map