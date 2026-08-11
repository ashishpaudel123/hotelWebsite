import mongoose, { Document, Types } from 'mongoose';
export interface IRole extends Document {
    _id: Types.ObjectId;
    name: string;
    slug: string;
    description?: string;
    permissions: Types.ObjectId[];
    accessLevel: number;
    canApproveBookings: boolean;
    canManagePayments: boolean;
    canManageUsers: boolean;
    canManageCMS: boolean;
    canManageSettings: boolean;
    status: 'active' | 'inactive';
    isSystem: boolean;
    createdBy?: Types.ObjectId;
    updatedBy?: Types.ObjectId;
    isDeleted: boolean;
    deletedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Role: mongoose.Model<IRole, {}, {}, {}, mongoose.Document<unknown, {}, IRole, {}, {}> & IRole & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Role.d.ts.map