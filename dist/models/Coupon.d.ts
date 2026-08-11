import mongoose, { Document, Types } from 'mongoose';
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
export declare const Coupon: mongoose.Model<ICoupon, {}, {}, {}, mongoose.Document<unknown, {}, ICoupon, {}, {}> & ICoupon & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Coupon.d.ts.map