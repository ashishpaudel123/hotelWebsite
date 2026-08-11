import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IWebsiteSettings extends Document {
  _id: Types.ObjectId;
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
  createdAt: Date;
  updatedAt: Date;
}

const websiteSettingsSchema = new Schema<IWebsiteSettings>({
  siteName: { type: String, required: true, trim: true },
  tagline: { type: String, trim: true },
  logo: { type: String, default: '' },
  contactInfo: {
    address: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    fax: { type: String },
    emergencyContact: { type: String },
    businessHours: { type: String, default: '9:00 AM - 5:00 PM' },
  },
  socialMedia: {
    facebook: { type: String },
    instagram: { type: String },
    twitter: { type: String },
    linkedin: { type: String },
    youtube: { type: String },
    tiktok: { type: String },
  },
  currency: { type: String, default: 'USD' },
  timezone: { type: String, default: 'UTC' },
  language: { type: String, default: 'en' },
  maintenanceMode: { type: Boolean, default: false },
  maintenanceMessage: { type: String },
}, { timestamps: true });

export const WebsiteSettings = mongoose.model<IWebsiteSettings>('WebsiteSettings', websiteSettingsSchema);
