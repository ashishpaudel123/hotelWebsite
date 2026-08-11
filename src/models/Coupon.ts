import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ICoupon extends Document {
  _id: Types.ObjectId;
  code: string;
  description?: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minBookingAmount: number;
  maxDiscountAmount?: number;
  validFrom: Date;
  validTo: Date;
  usageLimit?: number;
  usageCount: number;
  perUserLimit?: number;
  applicableRoomTypes: string[];
  status: 'active' | 'inactive' | 'expired';
  createdAt: Date;
  updatedAt: Date;
}

const couponSchema = new Schema<ICoupon>({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  description: { type: String, trim: true },
  discountType: { type: String, enum: ['percentage', 'fixed'], required: true },
  discountValue: { type: Number, required: true, min: 0 },
  minBookingAmount: { type: Number, required: true, min: 0 },
  maxDiscountAmount: { type: Number, min: 0 },
  validFrom: { type: Date, required: true },
  validTo: { type: Date, required: true },
  usageLimit: { type: Number, min: 1 },
  usageCount: { type: Number, default: 0, min: 0 },
  perUserLimit: { type: Number, min: 1 },
  applicableRoomTypes: [{ type: String }],
  status: { type: String, enum: ['active', 'inactive', 'expired'], default: 'active' },
}, { timestamps: true });

couponSchema.index({ code: 1 }, { unique: true });
couponSchema.index({ status: 1, validFrom: 1, validTo: 1 });

export const Coupon = mongoose.model<ICoupon>('Coupon', couponSchema);
