import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IMenuItem extends Document {
  _id: Types.ObjectId;
  category: Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  price: number;
  discountedPrice?: number;
  images: string[];
  ingredients?: string[];
  allergens?: string[];
  dietaryTags: ('vegetarian' | 'vegan' | 'gluten-free' | 'spicy')[];
  isAvailable: boolean;
  preparationTime?: number;
  spicyLevel?: 0 | 1 | 2 | 3;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

const menuItemSchema = new Schema<IMenuItem>({
  category: { type: Schema.Types.ObjectId, ref: 'MenuCategory', required: true },
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  discountedPrice: { type: Number, min: 0 },
  images: [{ type: String }],
  ingredients: [{ type: String }],
  allergens: [{ type: String }],
  dietaryTags: [{ type: String, enum: ['vegetarian', 'vegan', 'gluten-free', 'spicy'] }],
  isAvailable: { type: Boolean, default: true },
  preparationTime: { type: Number },
  spicyLevel: { type: Number, enum: [0, 1, 2, 3], default: 0 },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
}, { timestamps: true });

menuItemSchema.index({ slug: 1 }, { unique: true });
menuItemSchema.index({ category: 1, isAvailable: 1 });

export const MenuItem = mongoose.model<IMenuItem>('MenuItem', menuItemSchema);
