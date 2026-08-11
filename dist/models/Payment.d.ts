import mongoose, { Document, Types } from 'mongoose';
export interface IPayment extends Document {
    _id: Types.ObjectId;
    bookingId: Types.ObjectId;
    transactionId: string;
    gateway: 'esewa' | 'khalti' | 'cash' | 'card';
    amount: number;
    currency: string;
    status: 'pending' | 'completed' | 'failed' | 'refunded';
    paymentMethod: string;
    metadata?: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Payment: mongoose.Model<IPayment, {}, {}, {}, mongoose.Document<unknown, {}, IPayment, {}, {}> & IPayment & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Payment.d.ts.map