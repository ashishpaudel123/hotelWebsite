import dotenv from 'dotenv';
dotenv.config();

import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { authRoutes } from './modules/auth';
import { roomRoutes } from './modules/room';
import { websiteRoutes } from './modules/website';
import { cmsRoutes } from './modules/cms';
import { bookingRoutes } from './modules/booking';
import { couponRoutes } from './modules/coupon';
import { userRoutes } from './modules/user';
import { dashboardRoutes } from './modules/dashboard';
import { paymentRoutes } from './modules/payment';
import { errorHandler } from './utils/errors';
import { apiLimiter, authLimiter } from './middleware/rateLimit.middleware';
import { Logger } from './utils/logger';
import { connectDatabase } from './config/database';

import './models/User';
import './models/Role';
import './models/Permission';
import './models/RoomType';
import './models/Room';
import './models/WebsiteSettings';
import './models/HomepageSection';
import './models/Blog';
import './models/Event';
import './models/MenuCategory';
import './models/MenuItem';
import './models/GalleryImage';
import './models/Testimonial';
import './models/Booking';
import './models/Payment';
import './models/Coupon';

const logger = new Logger('Server');

export const app: Application = express();

app.use(helmet());

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(compression());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  }));
}

app.use('/api', apiLimiter);

app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.use('/api/v1/auth', authLimiter, authRoutes);
app.use('/api/v1/rooms', roomRoutes);
app.use('/api/v1/website', websiteRoutes);
app.use('/api/v1/cms', cmsRoutes);
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/coupons', couponRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/payments', paymentRoutes);

app.get('/', (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Hotel Management & Booking System API',
    version: 'v1',
    documentation: '/api/docs',
    health: '/health',
  });
});

app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'RES_001',
      message: `Route ${req.method} ${req.path} not found`,
    },
    timestamp: new Date().toISOString(),
  });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

export const startServer = async (): Promise<void> => {
  await connectDatabase();

  const server = app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`, {
      env: process.env.NODE_ENV,
      port: PORT,
    });
  });

  server.on('error', (err) => {
    console.error('Server error:', err);
  });
};

process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  logger.error('Unhandled Rejection at:', { promise, reason });
});

process.on('uncaughtException', (error: any) => {
  logger.error('Uncaught Exception:', { error });
});

if (require.main === module) {
  startServer();
}

export default app;
