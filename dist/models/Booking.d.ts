import mongoose, { Document, Types } from 'mongoose';
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
export declare const Booking: mongoose.Model<IBooking, {}, {}, {}, mongoose.Document<unknown, {}, IBooking, {}, {}> & IBooking & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Booking.d.ts.map