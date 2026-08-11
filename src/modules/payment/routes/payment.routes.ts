import { Router } from 'express';
import { createPayment, getPaymentByBookingId } from '../controllers/payment.controller';
import { authenticate } from '../../../middleware/auth.middleware';

const router = Router();

router.post('/', authenticate, createPayment);
router.get('/booking/:bookingId', authenticate, getPaymentByBookingId);

export default router;
