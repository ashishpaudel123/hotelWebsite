const express = require('express');
const dashboardController = require('../controllers/dashboard.controller');

const router = express.Router();

router.get('/stats', dashboardController.getStats);
router.get('/bookings/:status', dashboardController.getBookingsByStatus);
router.get('/activity', dashboardController.getRecentActivity);

module.exports = router;
