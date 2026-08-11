import mongoose, { Document, Schema, Types } from 'mongoose';
import { IRoomType } from './RoomType';

export interface IRoom extends Document {
  _id: Types.ObjectId;
  roomNumber: string;
  roomType: Types.ObjectId | IRoomType;
  floor: number;
  building?: string;
  status: 'available' | 'occupied' | 'maintenance' | 'dirty';
  currentBooking?: Types.ObjectId;
  images: string[];
  createdAt: Date;
  updatedAt: Date;
}

const roomSchema = new Schema<IRoom>({
  roomNumber: { type: String, required: true, unique: true, trim: true },
  roomType: { type: Schema.Types.ObjectId, ref: 'RoomType', required: true },
  floor: { type: Number, required: true },
  building: { type: String, trim: true },
  status: { type: String, enum: ['available', 'occupied', 'maintenance', 'dirty'], default: 'available' },
  currentBooking: { type: Schema.Types.ObjectId, ref: 'Booking' },
  images: [{ type: String }],
}, { timestamps: true });

roomSchema.index({ roomNumber: 1 }, { unique: true });
roomSchema.index({ status: 1 });
roomSchema.index({ roomType: 1 });

export const Room = mongoose.model<IRoom>('Room', roomSchema);
