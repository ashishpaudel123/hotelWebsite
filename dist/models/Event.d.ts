import mongoose, { Document, Types } from 'mongoose';
export interface IEvent extends Document {
    _id: Types.ObjectId;
    title: string;
    slug: string;
    description: string;
    startDate: Date;
    endDate: Date;
    location: string;
    bannerImage: string;
    gallery: string[];
    price?: number;
    registrationLink?: string;
    seo: {
        metaTitle?: string;
        metaDescription?: string;
        keywords?: string[];
    };
    status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
    createdAt: Date;
    updatedAt: Date;
}
export declare const Event: mongoose.Model<IEvent, {}, {}, {}, mongoose.Document<unknown, {}, IEvent, {}, {}> & IEvent & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Event.d.ts.map