import mongoose from 'mongoose';
import { Logger } from '../utils/logger';

const logger = new Logger('Database');

export const connectDatabase = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/hotel-management';
    
    const options: mongoose.ConnectOptions = {
      maxPoolSize: 10,
      minPoolSize: 5,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      autoIndex: process.env.NODE_ENV === 'development',
    };

    const conn = await mongoose.connect(mongoUri, options);

    logger.info('MongoDB connected successfully', {
      host: conn.connection.host,
      name: conn.connection.name,
      port: conn.connection.port,
    });

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error', { error: err.message });
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('MongoDB connection closed through app termination');
      process.exit(0);
    });

  } catch (error: any) {
    logger.error('Failed to connect to MongoDB', { error: error.message });
    throw error;
  }
};

export const getDatabaseConnection = () => {
  return mongoose.connection;
};
