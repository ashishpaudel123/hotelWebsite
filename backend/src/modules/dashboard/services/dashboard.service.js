const Booking = require('../../../models/Booking');
const User = require('../../../models/User');
const Room = require('../../../models/Room');
const Payment = require('../../../models/Payment');

class DashboardService {
  async getDashboardStats() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));

    const [
      totalBookings,
      pendingBookings,
      confirmedBookings,
      checkedInBookings,
      completedBookings,
      cancelledBookings,
      
      totalRevenue,
      monthlyRevenue,
      weeklyRevenue,
      pendingPayments,
      completedPayments,
      
      totalRooms,
      availableRooms,
      occupiedRooms,
      maintenanceRooms,
      
      totalUsers,
      activeUsers,
      blockedUsers,
      
      recentBookings,
      topRooms
    ] = await Promise.all([
      // Booking counts
      Booking.countDocuments(),
      Booking.countDocuments({ status: 'pending' }),
      Booking.countDocuments({ status: 'confirmed' }),
      Booking.countDocuments({ status: 'checked-in' }),
      Booking.countDocuments({ status: 'completed' }),
      Booking.countDocuments({ status: 'cancelled' }),
      
      // Revenue stats
      Payment.aggregate([{ $match: { status: 'completed' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      Payment.aggregate([{ $match: { status: 'completed', createdAt: { $gte: startOfMonth } } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      Payment.aggregate([{ $match: { status: 'completed', createdAt: { $gte: startOfWeek } } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      Payment.countDocuments({ status: 'pending' }),
      Payment.countDocuments({ status: 'completed' }),
      
      // Room stats
      Room.countDocuments(),
      Room.countDocuments({ status: 'available', isActive: true }),
      Room.countDocuments({ status: 'occupied' }),
      Room.countDocuments({ status: 'maintenance' }),
      
      // User stats
      User.countDocuments(),
      User.countDocuments({ status: 'active' }),
      User.countDocuments({ status: 'blocked' }),
      
      // Recent bookings (last 5)
      Booking.find().sort({ createdAt: -1 }).limit(5).populate('guest room'),
      
      // Top rooms by bookings
      Booking.aggregate([
        { $group: { _id: '$room', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
        { $lookup: { from: 'rooms', localField: '_id', foreignField: '_id', as: 'room' } },
        { $unwind: '$room' }
      ])
    ]);

    return {
      bookings: {
        total: totalBookings,
        pending: pendingBookings,
        confirmed: confirmedBookings,
        checkedIn: checkedInBookings,
        completed: completedBookings,
        cancelled: cancelledBookings
      },
      revenue: {
        total: totalRevenue[0]?.total || 0,
        monthly: monthlyRevenue[0]?.total || 0,
        weekly: weeklyRevenue[0]?.total || 0,
        pendingPayments,
        completedPayments
      },
      rooms: {
        total: totalRooms,
        available: availableRooms,
        occupied: occupiedRooms,
        maintenance: maintenanceRooms,
        occupancyRate: totalRooms > 0 ? ((occupiedRooms / totalRooms) * 100).toFixed(2) : 0
      },
      users: {
        total: totalUsers,
        active: activeUsers,
        blocked: blockedUsers
      },
      recentBookings,
      topRooms
    };
  }

  async getBookingsByStatus(status) {
    return await Booking.find({ status })
      .populate('guest', 'firstName lastName email phone')
      .populate('room', 'name slug')
      .sort({ createdAt: -1 });
  }

  async getRecentActivity(limit = 10) {
    const [recentBookings, recentUsers] = await Promise.all([
      Booking.find().sort({ createdAt: -1 }).limit(limit).populate('guest room'),
      User.find().sort({ createdAt: -1 }).limit(limit).select('firstName lastName email createdAt')
    ]);

    return {
      bookings: recentBookings,
      users: recentUsers
    };
  }
}

module.exports = { DashboardService };
