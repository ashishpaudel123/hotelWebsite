import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IBlog extends Document {
  _id: Types.ObjectId;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  gallery: string[];
  author: {
    name: string;
    avatar?: string;
  };
  categories: string[];
  tags: string[];
  views: number;
  publishedAt?: Date;
  status: 'draft' | 'published' | 'archived';
  seo: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

const blogSchema = new Schema<IBlog>({
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  excerpt: { type: String, required: true },
  content: { type: String, required: true },
  coverImage: { type: String, default: '' },
  gallery: [{ type: String }],
  author: {
    name: { type: String, required: true },
    avatar: { type: String },
  },
  categories: [{ type: String }],
  tags: [{ type: String }],
  views: { type: Number, default: 0 },
  publishedAt: { type: Date },
  status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
  seo: {
    metaTitle: { type: String },
    metaDescription: { type: String },
    keywords: [{ type: String }],
  },
}, { timestamps: true });

blogSchema.index({ slug: 1 }, { unique: true });
blogSchema.index({ status: 1, publishedAt: -1 });

export const Blog = mongoose.model<IBlog>('Blog', blogSchema);
