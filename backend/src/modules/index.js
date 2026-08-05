const express = require('express');
const router = express.Router();
const bookingRoutes = require('./booking/routes/booking.routes');
const paymentRoutes = require('./payment/routes/payment.routes');

// Mount modules
router.use('/bookings', bookingRoutes);
router.use('/payments', paymentRoutes);

module.exports = router;
