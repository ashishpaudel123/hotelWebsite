import { Router } from 'express';
import { getCoupons, createCoupon } from '../controllers/coupon.controller';
import { authenticate, checkRole } from '../../../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', checkRole('admin', 'staff'), getCoupons);
router.post('/', checkRole('admin'), createCoupon);

export default router;
