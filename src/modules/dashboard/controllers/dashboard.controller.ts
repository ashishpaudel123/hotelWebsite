import { Request, Response, NextFunction } from 'express';
import { Booking, Room, RoomType, User } from '../../../models';
import { responseHandler } from '../../../utils/responseHandler';

export const getDashboardStats = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const [totalBookings, totalRooms, totalRoomTypes, totalUsers, recentBookings, occupancyData] = await Promise.all([
      Booking.countDocuments(),
      Room.countDocuments(),
      RoomType.countDocuments(),
      User.countDocuments({ isDeleted: false }),
      Booking.find()
        .populate('customerId', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      Room.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const totalRevenue = await Booking.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$pricing.total' } } },
    ]);

    const occupancy = occupancyData.reduce((acc: Record<string, number>, item: any) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    return responseHandler.success(res, {
      totalBookings,
      totalRooms,
      totalRoomTypes,
      totalUsers,
      revenue: totalRevenue[0]?.total || 0,
      occupancy,
      recentBookings: recentBookings.map((booking: any) => ({
        _id: booking._id,
        bookingReference: booking.bookingReference,
        customer: booking.customerId ? `${booking.customerId.firstName} ${booking.customerId.lastName}` : 'Guest',
        email: booking.customerId?.email || '',
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        status: booking.status,
        total: booking.pricing?.total || 0,
      })),
    }, 'Dashboard stats retrieved successfully');
  } catch (error) {
    return next(error);
  }
};
