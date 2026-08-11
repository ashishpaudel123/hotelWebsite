import mongoose, { Document, Types } from 'mongoose';
export interface IPermission extends Document {
    _id: Types.ObjectId;
    name: string;
    resource: string;
    action: string;
    description?: string;
    status: 'active' | 'inactive';
    isSystem: boolean;
    createdBy?: Types.ObjectId;
    updatedBy?: Types.ObjectId;
    isDeleted: boolean;
    deletedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Permission: mongoose.Model<IPermission, {}, {}, {}, mongoose.Document<unknown, {}, IPermission, {}, {}> & IPermission & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Permission.d.ts.map