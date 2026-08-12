import { Request, Response, NextFunction } from 'express';
import { Room, RoomType } from '../../../models/room';

// GET /api/v1/rooms?status=available&roomTypeId=...
export const getRooms = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filter: any = {};
    if (req.query.status) {
      filter.status = req.query.status;
    }
    if (req.query.roomTypeId) {
      filter.roomType = req.query.roomTypeId;
    }

    const rooms = await Room.find(filter)
      .populate('roomType')
      .sort({ roomNumber: 1 })
      .lean();
    return res.json({ data: rooms });
  } catch (error) {
    return next(error);
  }
};

// GET /api/v1/rooms/slug/:slug  (slug belongs to the room type)
export const getRoomBySlug = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const roomType = await RoomType.findOne({ slug: req.params.slug }).lean();
    if (!roomType) {
      return res.status(404).json({ success: false, error: { message: 'Room not found' } });
    }

    const room = await Room.findOne({ roomType: roomType._id }).populate('roomType').lean();
    if (!room) {
      return res.status(404).json({ success: false, error: { message: 'Room not found' } });
    }
    return res.json(room);
  } catch (error) {
    return next(error);
  }
};
