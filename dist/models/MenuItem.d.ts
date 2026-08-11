import mongoose, { Document, Types } from 'mongoose';
export interface IMenuItem extends Document {
    _id: Types.ObjectId;
    category: Types.ObjectId;
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
    status: 'active' | 'inactive';
    createdAt: Date;
    updatedAt: Date;
}
export declare const MenuItem: mongoose.Model<IMenuItem, {}, {}, {}, mongoose.Document<unknown, {}, IMenuItem, {}, {}> & IMenuItem & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=MenuItem.d.ts.map