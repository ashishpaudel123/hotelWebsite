import mongoose, { Document, Types } from 'mongoose';
export interface IMenuCategory extends Document {
    _id: Types.ObjectId;
    name: string;
    slug: string;
    description?: string;
    displayOrder: number;
    image?: string;
    isActive: boolean;
    restaurantLocation?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const MenuCategory: mongoose.Model<IMenuCategory, {}, {}, {}, mongoose.Document<unknown, {}, IMenuCategory, {}, {}> & IMenuCategory & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=MenuCategory.d.ts.map