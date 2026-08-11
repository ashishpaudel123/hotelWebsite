import mongoose, { Document, Types } from 'mongoose';
export interface IHomepageSection extends Document {
    _id: Types.ObjectId;
    sectionKey: string;
    title?: string;
    subtitle?: string;
    content?: string;
    media: string[];
    isVisible: boolean;
    displayOrder: number;
    backgroundColor?: string;
    textColor?: string;
    customClasses?: string;
    status: 'active' | 'inactive';
    createdAt: Date;
    updatedAt: Date;
}
export declare const HomepageSection: mongoose.Model<IHomepageSection, {}, {}, {}, mongoose.Document<unknown, {}, IHomepageSection, {}, {}> & IHomepageSection & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=HomepageSection.d.ts.map