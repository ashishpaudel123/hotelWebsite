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
exports.Booking = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const bookingSchema = new mongoose_1.Schema({
    bookingReference: { type: String, required: true, unique: true },
    customerId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    guestDetails: {
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String, required: true },
        country: { type: String },
        specialRequests: { type: String },
    },
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },
    rooms: [{
            roomId: { type: mongoose_1.Schema.Types.ObjectId, required: true },
            roomType: { type: String, required: true },
            quantity: { type: Number, required: true, min: 1 },
            price: { type: Number, required: true, min: 0 },
            adults: { type: Number, required: true, min: 1 },
            children: { type: Number, required: true, min: 0, default: 0 },
        }],
    pricing: {
        subtotal: { type: Number, required: true, min: 0 },
        tax: { type: Number, required: true, min: 0 },
        discount: { type: Number, default: 0, min: 0 },
        total: { type: Number, required: true, min: 0 },
        currency: { type: String, default: 'USD' },
    },
    status: { type: String, enum: ['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'failed'], default: 'pending' },
    paymentStatus: { type: String, enum: ['unpaid', 'partial', 'paid', 'refunded'], default: 'unpaid' },
    specialRequests: { type: String },
    source: { type: String, enum: ['website', 'mobile_app', 'walk_in', 'ota'], default: 'website' },
    metadata: {
        ipAddress: { type: String },
        userAgent: { type: String },
    },
}, { timestamps: true });
bookingSchema.index({ bookingReference: 1 }, { unique: true });
bookingSchema.index({ customerId: 1, createdAt: -1 });
bookingSchema.index({ status: 1, paymentStatus: 1 });
exports.Booking = mongoose_1.default.model('Booking', bookingSchema);
//# sourceMappingURL=Booking.js.map