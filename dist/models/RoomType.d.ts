import mongoose, { Document, Types } from 'mongoose';
export interface IRoomType extends Document {
    _id: Types.ObjectId;
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
    createdAt: Date;
    updatedAt: Date;
}
export declare const RoomType: mongoose.Model<IRoomType, {}, {}, {}, mongoose.Document<unknown, {}, IRoomType, {}, {}> & IRoomType & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=RoomType.d.ts.map