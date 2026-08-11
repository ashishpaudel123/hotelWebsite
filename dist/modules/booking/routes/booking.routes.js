"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const booking_controller_1 = require("../controllers/booking.controller");
const auth_middleware_1 = require("../../../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.post('/check-availability', booking_controller_1.checkAvailability);
router.post('/', auth_middleware_1.authenticate, booking_controller_1.createBooking);
router.get('/', auth_middleware_1.authenticate, (0, auth_middleware_1.checkRole)('admin', 'staff'), booking_controller_1.getBookings);
router.get('/reference/:ref', booking_controller_1.getBookingByReference);
router.post('/:id/cancel', auth_middleware_1.authenticate, booking_controller_1.cancelBooking);
router.use(auth_middleware_1.authenticate);
router.get('/:id', booking_controller_1.getBookingById);
router.patch('/:id/status', (0, auth_middleware_1.checkRole)('admin', 'staff'), booking_controller_1.updateBookingStatus);
exports.default = router;
//# sourceMappingURL=booking.routes.js.map