import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IRoomItem {
  roomId: Types.ObjectId;
  roomType: string;
  quantity: number;
  price: number;
  adults: number;
  children: number;
}

export interface IGuestDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country?: string;
  specialRequests?: string;
}

export interface IPricing {
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  currency: string;
}

export interface IBooking extends Document {
  _id: Types.ObjectId;
  bookingReference: string;
  customerId: Types.ObjectId;
  guestDetails: IGuestDetails;
  checkIn: Date;
  checkOut: Date;
  rooms: IRoomItem[];
  pricing: IPricing;
  status: 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled' | 'failed';
  paymentStatus: 'unpaid' | 'partial' | 'paid' | 'refunded';
  specialRequests?: string;
  source: 'website' | 'mobile_app' | 'walk_in' | 'ota';
  metadata?: {
    ipAddress?: string;
    userAgent?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const bookingSchema = new Schema<IBooking>({
  bookingReference: { type: String, required: true, unique: true },
  customerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
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
    roomId: { type: Schema.Types.ObjectId, required: true },
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

export const Booking = mongoose.model<IBooking>('Booking', bookingSchema);
