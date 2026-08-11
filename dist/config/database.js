"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDatabaseConnection = exports.connectDatabase = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const logger_1 = require("../utils/logger");
const logger = new logger_1.Logger('Database');
const connectDatabase = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/hotel-management';
        const options = {
            maxPoolSize: 10,
            minPoolSize: 5,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            autoIndex: process.env.NODE_ENV === 'development',
        };
        const conn = await mongoose_1.default.connect(mongoUri, options);
        logger.info('MongoDB connected successfully', {
            host: conn.connection.host,
            name: conn.connection.name,
            port: conn.connection.port,
        });
        // Handle connection events
        mongoose_1.default.connection.on('error', (err) => {
            logger.error('MongoDB connection error', { error: err.message });
        });
        mongoose_1.default.connection.on('disconnected', () => {
            logger.warn('MongoDB disconnected');
        });
        // Graceful shutdown
        process.on('SIGINT', async () => {
            await mongoose_1.default.connection.close();
            logger.info('MongoDB connection closed through app termination');
            process.exit(0);
        });
    }
    catch (error) {
        logger.error('Failed to connect to MongoDB', { error: error.message });
        throw error;
    }
};
exports.connectDatabase = connectDatabase;
const getDatabaseConnection = () => {
    return mongoose_1.default.connection;
};
exports.getDatabaseConnection = getDatabaseConnection;
//# sourceMappingURL=database.js.map