export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status: 'active' | 'inactive' | 'blocked';
  avatar?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  permissions: string[];
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  _id: string;
  name: string;
  resource: string;
  action: string;
  description?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface RoomType {
  _id: string;
  name: string;
  slug: string;
  description: string;
  maxOccupancy: number;
  basePrice: number;
  currency: string;
  images: string[];
  amenities: string[];
  status: 'active' | 'inactive';
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Room {
  _id: string;
  roomNumber: string;
  roomTypeId: RoomType;
  floor: number;
  building?: string;
  status: 'available' | 'occupied' | 'maintenance' | 'dirty';
  currentBooking?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  _id: string;
  bookingReference: string;
  customerId?: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  guestDetails?: {
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
    roomTypeId: string | { _id: string; name: string; basePrice: number };
    quantity: number;
    pricePerNight: number;
    totalNights: number;
  }>;
  pricing: {
    subtotal: number;
    tax: number;
    discount: number;
    total: number;
    currency?: string;
  };
  status: 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled' | 'failed';
  paymentStatus: 'unpaid' | 'partial' | 'paid' | 'refunded';
  source?: 'website' | 'mobile_app' | 'walk_in' | 'ota';
  specialRequests?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MenuItem {
  _id: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  discountedPrice?: number;
  images: string[];
  ingredients: string[];
  allergens: string[];
  dietaryTags: string[];
  isAvailable: boolean;
  preparationTime: number;
  spicyLevel: number;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface MenuCategory {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  displayOrder: number;
  image?: string;
  isActive: boolean;
  restaurantLocation?: string;
  createdAt: string;
  updatedAt: string;
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
  gallery: string[];
  price?: number;
  registrationLink?: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface GalleryItem {
  _id: string;
  title: string;
  slug: string;
  category: 'rooms' | 'dining' | 'events' | 'facilities' | 'exterior';
  images: string[];
  isVisible: boolean;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface Blog {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  gallery: string[];
  author: {
    _id: string;
    name: string;
  };
  categories: string[];
  tags: string[];
  views: number;
  publishedAt?: string;
  status: 'draft' | 'published' | 'archived';
  seo: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface Coupon {
  _id: string;
  code: string;
  description?: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minBookingAmount: number;
  maxDiscountAmount?: number;
  validFrom: string;
  validTo: string;
  usageLimit?: number;
  usageCount: number;
  perUserLimit?: number;
  applicableRoomTypes: string[];
  status: 'active' | 'inactive' | 'expired';
  createdAt: string;
  updatedAt: string;
}

export interface HomepageSection {
  _id: string;
  sectionKey: string;
  title: string;
  subtitle?: string;
  content: any;
  media: string[];
  isVisible: boolean;
  displayOrder: number;
  backgroundColor?: string;
  textColor?: string;
  customClasses?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface WebsiteSettings {
  _id: string;
  siteName: string;
  tagline?: string;
  logo: string;
  contactInfo: {
    address: string;
    phone: string;
    email: string;
    fax?: string;
    emergencyContact?: string;
    businessHours: string;
  };
  socialMedia: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    youtube?: string;
    tiktok?: string;
  };
  currency: string;
  timezone: string;
  language: string;
  maintenanceMode: boolean;
  maintenanceMessage?: string;
  updatedAt: string;
}

export interface ThemeSettings {
  _id: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamilyHeading: string;
  fontFamilyBody: string;
  layoutWidth: 'narrow' | 'wide' | 'full';
  headerStyle: 'default' | 'transparent' | 'centered';
  footerStyle: 'default' | 'minimal' | 'extended';
  showScrollToTop: boolean;
  animationEnabled: boolean;
  darkModeDefault: boolean;
  updatedAt: string;
}

export interface EmailTemplate {
  _id: string;
  key: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  variables: string[];
  isEnabled: boolean;
  cc?: string[];
  bcc?: string[];
  updatedAt: string;
}

export interface NotificationTemplate {
  _id: string;
  key: string;
  channel: 'sms' | 'push' | 'in-app';
  title: string;
  message: string;
  actionUrl?: string;
  isEnabled: boolean;
  updatedAt: string;
}

export interface AnalyticsData {
  date: string;
  metricType: string;
  value: number;
  metadata?: Record<string, any>;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  message?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, any>;
}
