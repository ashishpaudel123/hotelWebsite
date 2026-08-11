import { Router } from 'express';
import { getBookings, getBookingById, createBooking, updateBookingStatus, checkAvailability, getBookingByReference, cancelBooking } from '../controllers/booking.controller';
import { authenticate, checkRole } from '../../../middleware/auth.middleware';

const router = Router();

router.post('/check-availability', checkAvailability);
router.post('/', authenticate, createBooking);
router.get('/', authenticate, checkRole('admin', 'staff'), getBookings);
router.get('/reference/:ref', getBookingByReference);
router.post('/:id/cancel', authenticate, cancelBooking);

router.use(authenticate);

router.get('/:id', getBookingById);
router.patch('/:id/status', checkRole('admin', 'staff'), updateBookingStatus);

export default router;
