import mongoose, { Document, Types } from 'mongoose';
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
export declare const WebsiteSettings: mongoose.Model<IWebsiteSettings, {}, {}, {}, mongoose.Document<unknown, {}, IWebsiteSettings, {}, {}> & IWebsiteSettings & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=WebsiteSettings.d.ts.map