import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IEvent extends Document {
  _id: Types.ObjectId;
  title: string;
  slug: string;
  description: string;
  startDate: Date;
  endDate: Date;
  location: string;
  bannerImage: string;
  gallery: string[];
  price?: number;
  registrationLink?: string;
  seo: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
  };
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

const eventSchema = new Schema<IEvent>({
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  description: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  location: { type: String, required: true },
  bannerImage: { type: String, default: '' },
  gallery: [{ type: String }],
  price: { type: Number, min: 0 },
  registrationLink: { type: String },
  seo: {
    metaTitle: { type: String },
    metaDescription: { type: String },
    keywords: [{ type: String }],
  },
  status: { type: String, enum: ['upcoming', 'ongoing', 'completed', 'cancelled'], default: 'upcoming' },
}, { timestamps: true });

eventSchema.index({ slug: 1 }, { unique: true });
eventSchema.index({ status: 1, startDate: 1 });

export const Event = mongoose.model<IEvent>('Event', eventSchema);
