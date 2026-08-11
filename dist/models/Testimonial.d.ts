import mongoose, { Document, Types } from 'mongoose';
export interface ITestimonial extends Document {
    _id: Types.ObjectId;
    customerName: string;
    customerAvatar?: string;
    designation?: string;
    rating: number;
    comment: string;
    isVisible: boolean;
    featured: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Testimonial: mongoose.Model<ITestimonial, {}, {}, {}, mongoose.Document<unknown, {}, ITestimonial, {}, {}> & ITestimonial & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Testimonial.d.ts.map