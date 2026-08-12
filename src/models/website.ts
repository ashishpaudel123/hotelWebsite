import mongoose, { Document, Schema } from 'mongoose';

// -----------------------------------------------------------------------------
// Website Settings
// -----------------------------------------------------------------------------
export interface IWebsiteSettings extends Document {
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

const websiteSettingsSchema = new Schema<IWebsiteSettings>(
  {
    siteName: { type: String, default: 'Grand Luxury Hotel' },
    tagline: { type: String, default: 'Experience luxury and comfort' },
    logo: { type: String, default: '' },
    contactInfo: {
      address: { type: String, default: '123 Luxury Avenue, Kathmandu, Nepal' },
      phone: { type: String, default: '+977-1-4000000' },
      email: { type: String, default: 'info@grandluxuryhotel.com' },
      emergencyContact: { type: String, default: '+977-1-4000001' },
      businessHours: { type: String, default: '24 Hours' },
    },
    socialMedia: {
      facebook: { type: String, default: '' },
      instagram: { type: String, default: '' },
      twitter: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      youtube: { type: String, default: '' },
    },
    currency: { type: String, default: 'USD' },
    timezone: { type: String, default: 'Asia/Kathmandu' },
    language: { type: String, default: 'en' },
  },
  { timestamps: true }
);

// -----------------------------------------------------------------------------
// Theme Settings
// -----------------------------------------------------------------------------
export interface IThemeSettings extends Document {
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

const themeSettingsSchema = new Schema<IThemeSettings>(
  {
    primaryColor: { type: String, default: '222.2 47.4% 11.2%' },
    secondaryColor: { type: String, default: '210 40% 96.1%' },
    accentColor: { type: String, default: '210 40% 96.1%' },
    fontFamilyHeading: { type: String, default: 'Playfair Display' },
    fontFamilyBody: { type: String, default: 'Inter' },
    layoutWidth: { type: String, enum: ['full', 'boxed'], default: 'full' },
    headerStyle: { type: String, enum: ['modern', 'classic', 'minimal'], default: 'modern' },
    footerStyle: { type: String, enum: ['simple', 'multi-column'], default: 'multi-column' },
    showScrollToTop: { type: Boolean, default: true },
    animationEnabled: { type: Boolean, default: true },
    darkModeDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// -----------------------------------------------------------------------------
// Homepage Section
// -----------------------------------------------------------------------------
export interface IHomepageSection extends Document {
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

const homepageSectionSchema = new Schema<IHomepageSection>(
  {
    sectionKey: { type: String, required: true },
    title: { type: String },
    subtitle: { type: String },
    content: { type: String },
    media: { type: [String], default: [] },
    isVisible: { type: Boolean, default: true },
    displayOrder: { type: Number, default: 0 },
    backgroundColor: { type: String },
    textColor: { type: String },
    customClasses: { type: String },
    seo: {
      metaTitle: { type: String },
      metaDescription: { type: String },
    },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  { timestamps: true }
);

export const WebsiteSettings = mongoose.model<IWebsiteSettings>('WebsiteSettings', websiteSettingsSchema);
export const ThemeSettings = mongoose.model<IThemeSettings>('ThemeSettings', themeSettingsSchema);
export const HomepageSection = mongoose.model<IHomepageSection>('HomepageSection', homepageSectionSchema);
