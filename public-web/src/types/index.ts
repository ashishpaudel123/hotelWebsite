export interface Room {
  _id: string;
  roomNumber: string;
  roomType: {
    _id: string;
    name: string;
    slug: string;
    description: string;
    maxOccupancy: number;
    basePrice: number;
    images: string[];
    amenities: string[];
  };
  floor: number;
  status: 'available' | 'occupied' | 'maintenance' | 'dirty';
  images: string[];
}

export interface WebsiteSettings {
  _id: string;
  siteName: string;
  tagline: string;
  logo: string;
  contactInfo: {
    address: string;
    phone: string;
    email: string;
    emergencyContact?: string;
    businessHours?: string;
  };
  socialMedia: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    youtube?: string;
  };
  currency: string;
  timezone: string;
  language: string;
}

export interface HomepageSection {
  _id: string;
  sectionKey: string;
  title?: string;
  subtitle?: string;
  content?: string;
  media?: string[];
  isVisible: boolean;
  displayOrder: number;
  backgroundColor?: string;
  textColor?: string;
  customClasses?: string;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
  };
  status: 'active' | 'inactive';
}

export interface ThemeSettings {
  _id: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamilyHeading: string;
  fontFamilyBody: string;
  layoutWidth: 'full' | 'boxed';
  headerStyle: 'modern' | 'classic' | 'minimal';
  footerStyle: 'simple' | 'multi-column';
  showScrollToTop: boolean;
  animationEnabled: boolean;
  darkModeDefault: boolean;
}

export interface SEO {
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  ogImage?: string;
  canonicalUrl?: string;
}

export interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  gallery?: string[];
  author: {
    name: string;
    avatar?: string;
  };
  categories: string[];
  tags: string[];
  views: number;
  publishedAt: string;
  seo: SEO;
  status: 'draft' | 'published' | 'archived';
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
  gallery?: string[];
  price?: number;
  registrationLink?: string;
  seo: SEO;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
}

export interface MenuCategory {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  displayOrder: number;
  isActive: boolean;
}

export interface MenuItem {
  _id: string;
  category: {
    _id: string;
    name: string;
    slug: string;
  };
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

export interface GalleryImage {
  _id: string;
  title: string;
  slug: string;
  category: 'rooms' | 'dining' | 'events' | 'facilities' | 'exterior';
  imageUrl: string;
  altText: string;
  displayOrder: number;
  isVisible: boolean;
}

export interface Testimonial {
  _id: string;
  customerName: string;
  customerAvatar?: string;
  designation?: string;
  rating: number;
  comment: string;
  isVisible: boolean;
  featured: boolean;
}

export interface BookingPayload {
  customerId?: string;
  guestDetails: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    country?: string;
    specialRequests?: string;
  };
  checkIn: string;
  checkOut: string;
  rooms: Array<{
    roomId: string;
    roomType: string;
    quantity: number;
  }>;
  source?: string;
}

export interface BookingResult {
  _id: string;
  bookingReference: string;
  checkIn: string;
  checkOut: string;
  status: string;
  paymentStatus: string;
  rooms: Array<{
    roomId: string;
    roomType: string;
    quantity: number;
    price: number;
  }>;
  pricing: {
    subtotal: number;
    tax: number;
    discount: number;
    total: number;
  };
  guestDetails: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    specialRequests?: string;
  };
  customerId?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface AvailabilityResult {
  available: boolean;
  message: string;
}
