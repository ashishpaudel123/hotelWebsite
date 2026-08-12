import mongoose, { Document, Schema } from 'mongoose';

// Shared SEO subdocument
const seoSchema = new Schema(
  {
    metaTitle: { type: String },
    metaDescription: { type: String },
    keywords: { type: [String], default: [] },
    ogImage: { type: String },
    canonicalUrl: { type: String },
  },
  { _id: false }
);

// -----------------------------------------------------------------------------
// Blog Post
// -----------------------------------------------------------------------------
export interface IBlogPost extends Document {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  gallery?: string[];
  author: { name: string; avatar?: string };
  categories: string[];
  tags: string[];
  views: number;
  publishedAt: Date;
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
    ogImage?: string;
    canonicalUrl?: string;
  };
  status: 'draft' | 'published' | 'archived';
}

const blogPostSchema = new Schema<IBlogPost>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    excerpt: { type: String, default: '' },
    content: { type: String, default: '' },
    coverImage: { type: String, default: '' },
    gallery: { type: [String], default: [] },
    author: {
      name: { type: String, default: 'Hotel Admin' },
      avatar: { type: String },
    },
    categories: { type: [String], default: [] },
    tags: { type: [String], default: [] },
    views: { type: Number, default: 0 },
    publishedAt: { type: Date, default: Date.now },
    seo: { type: seoSchema, default: () => ({}) },
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'published' },
  },
  { timestamps: true }
);

// -----------------------------------------------------------------------------
// Event
// -----------------------------------------------------------------------------
export interface IEvent extends Document {
  title: string;
  slug: string;
  description: string;
  startDate: Date;
  endDate: Date;
  location: string;
  bannerImage: string;
  gallery?: string[];
  price?: number;
  registrationLink?: string;
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
    ogImage?: string;
    canonicalUrl?: string;
  };
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
}

const eventSchema = new Schema<IEvent>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, default: '' },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, default: Date.now },
    location: { type: String, default: '' },
    bannerImage: { type: String, default: '' },
    gallery: { type: [String], default: [] },
    price: { type: Number },
    registrationLink: { type: String },
    seo: { type: seoSchema, default: () => ({}) },
    status: {
      type: String,
      enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
      default: 'upcoming',
    },
  },
  { timestamps: true }
);

// -----------------------------------------------------------------------------
// Gallery Image
// -----------------------------------------------------------------------------
export interface IGalleryImage extends Document {
  title: string;
  slug: string;
  category: 'rooms' | 'dining' | 'events' | 'facilities' | 'exterior';
  imageUrl: string;
  altText: string;
  displayOrder: number;
  isVisible: boolean;
}

const galleryImageSchema = new Schema<IGalleryImage>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    category: {
      type: String,
      enum: ['rooms', 'dining', 'events', 'facilities', 'exterior'],
      default: 'rooms',
    },
    imageUrl: { type: String, default: '' },
    altText: { type: String, default: '' },
    displayOrder: { type: Number, default: 0 },
    isVisible: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// -----------------------------------------------------------------------------
// Testimonial
// -----------------------------------------------------------------------------
export interface ITestimonial extends Document {
  customerName: string;
  customerAvatar?: string;
  designation?: string;
  rating: number;
  comment: string;
  isVisible: boolean;
  featured: boolean;
}

const testimonialSchema = new Schema<ITestimonial>(
  {
    customerName: { type: String, required: true },
    customerAvatar: { type: String },
    designation: { type: String },
    rating: { type: Number, default: 5 },
    comment: { type: String, default: '' },
    isVisible: { type: Boolean, default: true },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// -----------------------------------------------------------------------------
// Menu Category
// -----------------------------------------------------------------------------
export interface IMenuCategory extends Document {
  name: string;
  slug: string;
  description?: string;
  displayOrder: number;
  isActive: boolean;
}

const menuCategorySchema = new Schema<IMenuCategory>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String },
    displayOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// -----------------------------------------------------------------------------
// Menu Item
// -----------------------------------------------------------------------------
export interface IMenuItem extends Document {
  category: IMenuCategory['_id'];
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
}

const menuItemSchema = new Schema<IMenuItem>(
  {
    category: { type: Schema.Types.ObjectId, ref: 'MenuCategory', required: true },
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, default: '' },
    price: { type: Number, default: 0 },
    discountedPrice: { type: Number },
    images: { type: [String], default: [] },
    ingredients: { type: [String], default: [] },
    allergens: { type: [String], default: [] },
    dietaryTags: {
      type: [String],
      enum: ['vegetarian', 'vegan', 'gluten-free', 'spicy'],
      default: [],
    },
    isAvailable: { type: Boolean, default: true },
    preparationTime: { type: Number },
    spicyLevel: { type: Number, enum: [0, 1, 2, 3] },
  },
  { timestamps: true }
);

export const BlogPost = mongoose.model<IBlogPost>('BlogPost', blogPostSchema);
export const Event = mongoose.model<IEvent>('Event', eventSchema);
export const GalleryImage = mongoose.model<IGalleryImage>('GalleryImage', galleryImageSchema);
export const Testimonial = mongoose.model<ITestimonial>('Testimonial', testimonialSchema);
export const MenuCategory = mongoose.model<IMenuCategory>('MenuCategory', menuCategorySchema);
export const MenuItem = mongoose.model<IMenuItem>('MenuItem', menuItemSchema);
