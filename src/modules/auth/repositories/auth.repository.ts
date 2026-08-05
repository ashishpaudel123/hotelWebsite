import { Model, Types } from 'mongoose';
import { User, IUser } from '../../../models/User';
import { Role, IRole } from '../../../models/Role';
import { Permission } from '../../../models/Permission';
import { Logger } from '../../../utils/logger';

const logger = new Logger('AuthRepository');

export class AuthRepository {
  private userModel: Model<IUser>;
  private roleModel: Model<IRole>;

  constructor() {
    this.userModel = User;
    this.roleModel = Role;
  }

  async findByEmail(email: string): Promise<IUser | null> {
    try {
      return await this.userModel
        .findOne({ email, isDeleted: false })
        .populate('role', 'name slug permissions')
        .exec();
    } catch (error) {
      logger.error('Error finding user by email', { error, email });
      throw error;
    }
  }

  async findById(id: string): Promise<IUser | null> {
    try {
      return await this.userModel
        .findById(id)
        .populate('role', 'name slug permissions')
        .exec();
    } catch (error) {
      logger.error('Error finding user by ID', { error, id });
      throw error;
    }
  }

  async create(userData: Partial<IUser>): Promise<IUser> {
    try {
      const user = new this.userModel(userData);
      await user.save();
      logger.info('User created successfully', { userId: user._id, email: user.email });
      return user;
    } catch (error) {
      logger.error('Error creating user', { error, userData });
      throw error;
    }
  }

  async updateRefreshToken(userId: string, refreshToken: string | null): Promise<void> {
    try {
      await this.userModel.findByIdAndUpdate(userId, {
        refreshToken,
        updatedAt: new Date(),
      });
      logger.debug('Refresh token updated', { userId });
    } catch (error) {
      logger.error('Error updating refresh token', { error, userId });
      throw error;
    }
  }

  async updatePassword(userId: string, hashedPassword: string): Promise<void> {
    try {
      await this.userModel.findByIdAndUpdate(userId, {
        password: hashedPassword,
        passwordChangedAt: new Date(),
        loginAttempts: 0,
        lockUntil: undefined,
        updatedAt: new Date(),
      });
      logger.info('Password updated successfully', { userId });
    } catch (error) {
      logger.error('Error updating password', { error, userId });
      throw error;
    }
  }

  async incrementLoginAttempts(userId: string): Promise<number> {
    try {
      const user = await this.userModel.findById(userId);
      if (!user) return 0;

      const attempts = user.loginAttempts + 1;
      const lockUntil = attempts >= 5 
        ? new Date(Date.now() + 15 * 60 * 1000) // Lock for 15 minutes
        : undefined;

      await this.userModel.findByIdAndUpdate(userId, {
        loginAttempts: attempts,
        lockUntil,
        updatedAt: new Date(),
      });

      logger.warn('Login attempts incremented', { userId, attempts, lockUntil });
      return attempts;
    } catch (error) {
      logger.error('Error incrementing login attempts', { error, userId });
      throw error;
    }
  }

  async resetLoginAttempts(userId: string): Promise<void> {
    try {
      await this.userModel.findByIdAndUpdate(userId, {
        loginAttempts: 0,
        lockUntil: undefined,
        lastLogin: new Date(),
        updatedAt: new Date(),
      });
      logger.debug('Login attempts reset', { userId });
    } catch (error) {
      logger.error('Error resetting login attempts', { error, userId });
      throw error;
    }
  }

  async findDefaultUserRole(): Promise<IRole | null> {
    try {
      return await this.roleModel.findOne({ slug: 'customer', status: 'active' }).exec();
    } catch (error) {
      logger.error('Error finding default user role', { error });
      throw error;
    }
  }

  async getUserPermissions(userId: string): Promise<string[]> {
    try {
      const user = await this.userModel
        .findById(userId)
        .populate('role', 'permissions')
        .exec();
      
      if (!user || !user.role) return [];
      
      const role = await this.roleModel.findById(user.role).populate('permissions').exec();
      if (!role) return [];

      return (role.permissions as any[]).map((p: any) => p.name);
    } catch (error) {
      logger.error('Error getting user permissions', { error, userId });
      throw error;
    }
  }

  async createPasswordResetToken(userId: string): Promise<string> {
    try {
      const crypto = require('crypto');
      const resetToken = crypto.randomBytes(32).toString('hex');
      
      const hashedToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

      await this.userModel.findByIdAndUpdate(userId, {
        passwordResetToken: hashedToken,
        passwordResetExpires: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
        updatedAt: new Date(),
      });

      logger.info('Password reset token created', { userId });
      return resetToken;
    } catch (error) {
      logger.error('Error creating password reset token', { error, userId });
      throw error;
    }
  }

  async findUserByResetToken(token: string): Promise<IUser | null> {
    try {
      const crypto = require('crypto');
      const hashedToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');

      return await this.userModel.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: new Date() },
        isDeleted: false,
      }).exec();
    } catch (error) {
      logger.error('Error finding user by reset token', { error });
      throw error;
    }
  }

  async clearPasswordResetToken(userId: string): Promise<void> {
    try {
      await this.userModel.findByIdAndUpdate(userId, {
        passwordResetToken: undefined,
        passwordResetExpires: undefined,
        updatedAt: new Date(),
      });
      logger.debug('Password reset token cleared', { userId });
    } catch (error) {
      logger.error('Error clearing password reset token', { error, userId });
      throw error;
    }
  }
}
