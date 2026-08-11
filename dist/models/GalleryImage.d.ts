import mongoose, { Document, Types } from 'mongoose';
export interface IGalleryImage extends Document {
    _id: Types.ObjectId;
    title: string;
    slug: string;
    category: 'rooms' | 'dining' | 'events' | 'facilities' | 'exterior';
    imageUrl: string;
    altText: string;
    displayOrder: number;
    isVisible: boolean;
    status: 'active' | 'inactive';
    createdAt: Date;
    updatedAt: Date;
}
export declare const GalleryImage: mongoose.Model<IGalleryImage, {}, {}, {}, mongoose.Document<unknown, {}, IGalleryImage, {}, {}> & IGalleryImage & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=GalleryImage.d.ts.map