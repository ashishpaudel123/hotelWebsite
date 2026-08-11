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
exports.MenuItem = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const menuItemSchema = new mongoose_1.Schema({
    category: { type: mongoose_1.Schema.Types.ObjectId, ref: 'MenuCategory', required: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    discountedPrice: { type: Number, min: 0 },
    images: [{ type: String }],
    ingredients: [{ type: String }],
    allergens: [{ type: String }],
    dietaryTags: [{ type: String, enum: ['vegetarian', 'vegan', 'gluten-free', 'spicy'] }],
    isAvailable: { type: Boolean, default: true },
    preparationTime: { type: Number },
    spicyLevel: { type: Number, enum: [0, 1, 2, 3], default: 0 },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
}, { timestamps: true });
menuItemSchema.index({ slug: 1 }, { unique: true });
menuItemSchema.index({ category: 1, isAvailable: 1 });
exports.MenuItem = mongoose_1.default.model('MenuItem', menuItemSchema);
//# sourceMappingURL=MenuItem.js.map