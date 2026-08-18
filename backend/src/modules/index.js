const express = require('express');
const router = express.Router();

// Import module routes
const authRoutes = require('./auth/routes/auth.routes');
const bookingRoutes = require('./booking/routes/booking.routes');
const paymentRoutes = require('./payment/routes/payment.routes');
const userRoutes = require('./user/routes/user.routes');
const roomRoutes = require('./room/routes/room.routes');
const cmsRoutes = require('./cms/routes/cms.routes');
const dashboardRoutes = require('./dashboard/routes/dashboard.routes');

// Mount modules
router.use('/auth', authRoutes);
router.use('/bookings', bookingRoutes);
router.use('/payments', paymentRoutes);
router.use('/users', userRoutes);
router.use('/rooms', roomRoutes);
router.use('/cms', cmsRoutes);
router.use('/dashboard', dashboardRoutes);

module.exports = router;
