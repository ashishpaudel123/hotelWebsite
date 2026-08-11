import mongoose, { Document, Types } from 'mongoose';
import { IRoomType } from './RoomType';
export interface IRoom extends Document {
    _id: Types.ObjectId;
    roomNumber: string;
    roomType: Types.ObjectId | IRoomType;
    floor: number;
    building?: string;
    status: 'available' | 'occupied' | 'maintenance' | 'dirty';
    currentBooking?: Types.ObjectId;
    images: string[];
    createdAt: Date;
    updatedAt: Date;
}
export declare const Room: mongoose.Model<IRoom, {}, {}, {}, mongoose.Document<unknown, {}, IRoom, {}, {}> & IRoom & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Room.d.ts.map