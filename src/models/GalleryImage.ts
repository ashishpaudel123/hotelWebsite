import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IGalleryImage extends Document {
  _id: Types.ObjectId;
  title: string;
  slug: string;
  category: 'rooms' | 'dining' | 'events' | 'facilities' | 'exterior';
  imageUrl: string;
  altText: string;
  displayOrder: number;
  isVisible: boolean;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

const galleryImageSchema = new Schema<IGalleryImage>({
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  category: { type: String, required: true, enum: ['rooms', 'dining', 'events', 'facilities', 'exterior'] },
  imageUrl: { type: String, required: true },
  altText: { type: String, required: true },
  displayOrder: { type: Number, default: 0 },
  isVisible: { type: Boolean, default: true },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
}, { timestamps: true });

galleryImageSchema.index({ slug: 1 }, { unique: true });
galleryImageSchema.index({ category: 1, isVisible: 1 });

export const GalleryImage = mongoose.model<IGalleryImage>('GalleryImage', galleryImageSchema);
