import mongoose, { Document, Types } from 'mongoose';
export interface IUser extends Document {
    _id: Types.ObjectId;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
    avatar?: string;
    role?: Types.ObjectId;
    status: 'active' | 'inactive' | 'suspended' | 'deleted';
    lastLogin?: Date;
    loginAttempts: number;
    lockUntil?: Date;
    refreshToken?: string;
    passwordChangedAt?: Date;
    passwordResetToken?: string;
    passwordResetExpires?: Date;
    preferences?: {
        language?: string;
        timezone?: string;
        notifications?: {
            email?: boolean;
            sms?: boolean;
            push?: boolean;
        };
    };
    createdBy?: Types.ObjectId;
    updatedBy?: Types.ObjectId;
    isDeleted: boolean;
    deletedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare const User: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser, {}, {}> & IUser & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=User.d.ts.map