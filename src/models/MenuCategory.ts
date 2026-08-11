import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IMenuCategory extends Document {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  displayOrder: number;
  image?: string;
  isActive: boolean;
  restaurantLocation?: string;
  createdAt: Date;
  updatedAt: Date;
}

const menuCategorySchema = new Schema<IMenuCategory>({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  description: { type: String, trim: true },
  displayOrder: { type: Number, default: 0 },
  image: { type: String },
  isActive: { type: Boolean, default: true },
  restaurantLocation: { type: String },
}, { timestamps: true });

menuCategorySchema.index({ slug: 1 }, { unique: true });
menuCategorySchema.index({ isActive: 1 });

export const MenuCategory = mongoose.model<IMenuCategory>('MenuCategory', menuCategorySchema);
