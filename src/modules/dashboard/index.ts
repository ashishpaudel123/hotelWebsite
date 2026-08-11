import { Router } from 'express';
import dashboardRoutes from './routes/dashboard.routes';

const router = Router();

router.use('/', dashboardRoutes);

export { router as dashboardRoutes };
