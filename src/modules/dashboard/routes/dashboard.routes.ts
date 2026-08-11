import { Router } from 'express';
import { getDashboardStats } from '../controllers/dashboard.controller';
import { authenticate, checkRole } from '../../../middleware/auth.middleware';

const router = Router();

router.get('/stats', authenticate, checkRole('admin', 'staff'), getDashboardStats);

export default router;
