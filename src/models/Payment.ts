import mongoose, { Document, Schema, Types } from 'mongoose';

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

const paymentSchema = new Schema<IPayment>({
  bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: true },
  transactionId: { type: String, required: true, unique: true },
  gateway: { type: String, enum: ['esewa', 'khalti', 'cash', 'card'], required: true },
  amount: { type: Number, required: true, min: 0 },
  currency: { type: String, default: 'USD' },
  status: { type: String, enum: ['pending', 'completed', 'failed', 'refunded'], default: 'pending' },
  paymentMethod: { type: String, required: true },
  metadata: { type: Schema.Types.Mixed },
}, { timestamps: true });

paymentSchema.index({ transactionId: 1 }, { unique: true });
paymentSchema.index({ bookingId: 1, createdAt: -1 });

export const Payment = mongoose.model<IPayment>('Payment', paymentSchema);
