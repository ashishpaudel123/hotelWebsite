"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardStats = void 0;
const models_1 = require("../../../models");
const responseHandler_1 = require("../../../utils/responseHandler");
const getDashboardStats = async (_req, res, next) => {
    try {
        const [totalBookings, totalRooms, totalRoomTypes, totalUsers, recentBookings, occupancyData] = await Promise.all([
            models_1.Booking.countDocuments(),
            models_1.Room.countDocuments(),
            models_1.RoomType.countDocuments(),
            models_1.User.countDocuments({ isDeleted: false }),
            models_1.Booking.find()
                .populate('customerId', 'firstName lastName email')
                .sort({ createdAt: -1 })
                .limit(5)
                .lean(),
            models_1.Room.aggregate([
                {
                    $group: {
                        _id: '$status',
                        count: { $sum: 1 },
                    },
                },
            ]),
        ]);
        const totalRevenue = await models_1.Booking.aggregate([
            { $match: { paymentStatus: 'paid' } },
            { $group: { _id: null, total: { $sum: '$pricing.total' } } },
        ]);
        const occupancy = occupancyData.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
        }, {});
        return responseHandler_1.responseHandler.success(res, {
            totalBookings,
            totalRooms,
            totalRoomTypes,
            totalUsers,
            revenue: totalRevenue[0]?.total || 0,
            occupancy,
            recentBookings: recentBookings.map((booking) => ({
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
    }
    catch (error) {
        return next(error);
    }
};
exports.getDashboardStats = getDashboardStats;
//# sourceMappingURL=dashboard.controller.js.map