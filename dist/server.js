"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startServer = exports.app = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const morgan_1 = __importDefault(require("morgan"));
const auth_1 = require("./modules/auth");
const room_1 = require("./modules/room");
const website_1 = require("./modules/website");
const cms_1 = require("./modules/cms");
const booking_1 = require("./modules/booking");
const coupon_1 = require("./modules/coupon");
const user_1 = require("./modules/user");
const dashboard_1 = require("./modules/dashboard");
const payment_1 = require("./modules/payment");
const errors_1 = require("./utils/errors");
const rateLimit_middleware_1 = require("./middleware/rateLimit.middleware");
const logger_1 = require("./utils/logger");
const database_1 = require("./config/database");
require("./models/User");
require("./models/Role");
require("./models/Permission");
require("./models/RoomType");
require("./models/Room");
require("./models/WebsiteSettings");
require("./models/HomepageSection");
require("./models/Blog");
require("./models/Event");
require("./models/MenuCategory");
require("./models/MenuItem");
require("./models/GalleryImage");
require("./models/Testimonial");
require("./models/Booking");
require("./models/Payment");
require("./models/Coupon");
const logger = new logger_1.Logger('Server');
exports.app = (0, express_1.default)();
exports.app.use((0, helmet_1.default)());
exports.app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
exports.app.use(express_1.default.json({ limit: '10mb' }));
exports.app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
exports.app.use((0, compression_1.default)());
if (process.env.NODE_ENV === 'development') {
    exports.app.use((0, morgan_1.default)('dev'));
}
else {
    exports.app.use((0, morgan_1.default)('combined', {
        stream: {
            write: (message) => logger.info(message.trim()),
        },
    }));
}
exports.app.use('/api', rateLimit_middleware_1.apiLimiter);
exports.app.get('/health', (_req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});
exports.app.use('/api/v1/auth', rateLimit_middleware_1.authLimiter, auth_1.authRoutes);
exports.app.use('/api/v1/rooms', room_1.roomRoutes);
exports.app.use('/api/v1/website', website_1.websiteRoutes);
exports.app.use('/api/v1/cms', cms_1.cmsRoutes);
exports.app.use('/api/v1/bookings', booking_1.bookingRoutes);
exports.app.use('/api/v1/coupons', coupon_1.couponRoutes);
exports.app.use('/api/v1/users', user_1.userRoutes);
exports.app.use('/api/v1/dashboard', dashboard_1.dashboardRoutes);
exports.app.use('/api/v1/payments', payment_1.paymentRoutes);
exports.app.get('/', (_req, res) => {
    res.json({
        success: true,
        message: 'Hotel Management & Booking System API',
        version: 'v1',
        documentation: '/api/docs',
        health: '/health',
    });
});
exports.app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: {
            code: 'RES_001',
            message: `Route ${req.method} ${req.path} not found`,
        },
        timestamp: new Date().toISOString(),
    });
});
exports.app.use(errors_1.errorHandler);
const PORT = process.env.PORT || 5000;
const startServer = async () => {
    await (0, database_1.connectDatabase)();
    const server = exports.app.listen(PORT, () => {
        logger.info(`Server running on port ${PORT}`, {
            env: process.env.NODE_ENV,
            port: PORT,
        });
    });
    server.on('error', (err) => {
        console.error('Server error:', err);
    });
};
exports.startServer = startServer;
process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', { promise, reason });
});
process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', { error });
});
if (require.main === module) {
    (0, exports.startServer)();
}
exports.default = exports.app;
//# sourceMappingURL=server.js.map