import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IRoomType extends Document {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  maxOccupancy: number;
  basePrice: number;
  currency: string;
  images: string[];
  amenities: string[];
  status: 'active' | 'inactive';
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const roomTypeSchema = new Schema<IRoomType>({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  description: { type: String, required: true },
  maxOccupancy: { type: Number, required: true, min: 1 },
  basePrice: { type: Number, required: true, min: 0 },
  currency: { type: String, default: 'USD' },
  images: [{ type: String }],
  amenities: [{ type: String }],
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  displayOrder: { type: Number, default: 0 },
}, { timestamps: true });

roomTypeSchema.index({ slug: 1 }, { unique: true });
roomTypeSchema.index({ status: 1 });

export const RoomType = mongoose.model<IRoomType>('RoomType', roomTypeSchema);
