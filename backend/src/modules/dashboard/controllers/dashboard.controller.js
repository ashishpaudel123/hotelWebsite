const { DashboardService } = require('../services/dashboard.service');
const catchAsync = require('../../../utils/catchAsync');

const dashboardService = new DashboardService();

class DashboardController {
  getStats = catchAsync(async (req, res) => {
    const stats = await dashboardService.getDashboardStats();
    res.status(200).json({ success: true, data: stats });
  });

  getBookingsByStatus = catchAsync(async (req, res) => {
    const { status } = req.params;
    const bookings = await dashboardService.getBookingsByStatus(status);
    res.status(200).json({ success: true, data: bookings });
  });

  getRecentActivity = catchAsync(async (req, res) => {
    const { limit = 10 } = req.query;
    const activity = await dashboardService.getRecentActivity(Number(limit));
    res.status(200).json({ success: true, data: activity });
  });
}

module.exports = new DashboardController();
