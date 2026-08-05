export interface Room {
  _id: string;
  roomNumber: string;
  roomType: {
    _id: string;
    name: string;
    slug: string;
    description: string;
    basePrice: number;
    maxOccupancy: number;
    images: string[];
    amenities: string[];
  };
  floor: number;
  status: 'available' | 'occupied' | 'maintenance' | 'dirty';
}

export interface WebsiteSettings {
  siteName: string;
  tagline: string;
  logo: string;
  contactInfo: {
    phone: string;
    email: string;
    address: string;
  };
  socialMedia: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
  };
  currency: string;
  timezone: string;
}

export interface HomepageSection {
  _id: string;
  sectionKey: string;
  title: string;
  subtitle?: string;
  content: string;
  media?: string[];
  isVisible: boolean;
  displayOrder: number;
  backgroundColor?: string;
  textColor?: string;
}

export interface ThemeSettings {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamilyHeading: string;
  fontFamilyBody: string;
}

export interface SEO {
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  ogImage?: string;
}

export interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage: string;
  publishedAt: string;
  author: string;
  seo: SEO;
}

export interface Event {
  _id: string;
  title: string;
  slug: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  bannerImage: string;
  price?: number;
}

export interface MenuItem {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  images: string[];
  dietaryTags: string[];
  allergens: string[];
}

export interface GalleryImage {
  _id: string;
  title: string;
  imageUrl: string;
  category: string;
}

export interface Testimonial {
  _id: string;
  customerName: string;
  rating: number;
  comment: string;
  featured: boolean;
}
