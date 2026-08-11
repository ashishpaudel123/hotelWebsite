import mongoose, { Document, Types } from 'mongoose';
export interface IBlog extends Document {
    _id: Types.ObjectId;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    coverImage: string;
    gallery: string[];
    author: {
        name: string;
        avatar?: string;
    };
    categories: string[];
    tags: string[];
    views: number;
    publishedAt?: Date;
    status: 'draft' | 'published' | 'archived';
    seo: {
        metaTitle?: string;
        metaDescription?: string;
        keywords?: string[];
    };
    createdAt: Date;
    updatedAt: Date;
}
export declare const Blog: mongoose.Model<IBlog, {}, {}, {}, mongoose.Document<unknown, {}, IBlog, {}, {}> & IBlog & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Blog.d.ts.map