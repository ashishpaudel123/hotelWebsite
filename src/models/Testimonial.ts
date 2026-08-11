import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ITestimonial extends Document {
  _id: Types.ObjectId;
  customerName: string;
  customerAvatar?: string;
  designation?: string;
  rating: number;
  comment: string;
  isVisible: boolean;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const testimonialSchema = new Schema<ITestimonial>({
  customerName: { type: String, required: true, trim: true },
  customerAvatar: { type: String },
  designation: { type: String, trim: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  isVisible: { type: Boolean, default: true },
  featured: { type: Boolean, default: false },
}, { timestamps: true });

testimonialSchema.index({ isVisible: 1, featured: -1 });

export const Testimonial = mongoose.model<ITestimonial>('Testimonial', testimonialSchema);
