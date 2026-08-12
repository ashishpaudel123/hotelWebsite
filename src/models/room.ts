import mongoose, { Document, Schema } from 'mongoose';

// -----------------------------------------------------------------------------
// Room Type
// -----------------------------------------------------------------------------
export interface IRoomType extends Document {
  name: string;
  slug: string;
  description: string;
  maxOccupancy: number;
  basePrice: number;
  images: string[];
  amenities: string[];
}

const roomTypeSchema = new Schema<IRoomType>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, default: '' },
    maxOccupancy: { type: Number, default: 2 },
    basePrice: { type: Number, default: 0 },
    images: { type: [String], default: [] },
    amenities: { type: [String], default: [] },
  },
  { timestamps: true }
);

// -----------------------------------------------------------------------------
// Room
// -----------------------------------------------------------------------------
export interface IRoom extends Document {
  roomNumber: string;
  roomType: IRoomType['_id'];
  floor: number;
  status: 'available' | 'occupied' | 'maintenance' | 'dirty';
  images: string[];
}

const roomSchema = new Schema<IRoom>(
  {
    roomNumber: { type: String, required: true, unique: true },
    roomType: { type: Schema.Types.ObjectId, ref: 'RoomType', required: true },
    floor: { type: Number, default: 1 },
    status: {
      type: String,
      enum: ['available', 'occupied', 'maintenance', 'dirty'],
      default: 'available',
    },
    images: { type: [String], default: [] },
  },
  { timestamps: true }
);

export const RoomType = mongoose.model<IRoomType>('RoomType', roomTypeSchema);
export const Room = mongoose.model<IRoom>('Room', roomSchema);
