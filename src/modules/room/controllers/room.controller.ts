import { Request, Response, NextFunction } from 'express';
import { responseHandler } from '../../../utils/responseHandler';
import { Room, RoomType } from '../../../models';

export const getRooms = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, roomTypeId } = req.query;
    const filter: any = {};
    if (status) filter.status = status;
    if (roomTypeId) filter.roomType = roomTypeId;

    const rooms = await Room.find(filter)
      .populate('roomType', 'name slug description maxOccupancy basePrice images amenities')
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    return responseHandler.success(res, rooms, 'Rooms retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

export const getRoomBySlug = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;

    const roomType = await RoomType.findOne({ slug, status: 'active' }).lean();
    if (!roomType) {
      return responseHandler.notFound(res, 'Room type');
    }

    const rooms = await Room.find({ roomType: roomType._id, status: 'available' })
      .populate('roomType', 'name slug description maxOccupancy basePrice images amenities')
      .lean();

    return responseHandler.success(res, rooms, 'Rooms retrieved successfully');
  } catch (error) {
    return next(error);
  }
};
