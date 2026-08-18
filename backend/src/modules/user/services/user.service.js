const User = require('../models/User');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

class UserService {
  // Get all users with pagination, filtering, and sorting
  async getAllUsers(filters = {}, options = {}) {
    const { page = 1, limit = 10, sortBy = 'createdAt', order = 'DESC' } = options;
    
    const query = {};
    if (filters.$or) query.$or = filters.$or;
    if (filters.role) query.role = filters.role;
    if (filters.status) query.status = filters.status;

    const sortOptions = {};
    sortOptions[sortBy] = order === 'DESC' ? -1 : 1;

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find(query)
        .populate('role', 'name description')
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))
        .select('+password'),
      User.countDocuments(query)
    ]);

    return {
      data: users,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    };
  }

  // Get single user by ID
  async getUserById(id) {
    const user = await User.findById(id)
      .populate('role', 'name description permissions')
      .select('+password');

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user;
  }

  // Get user by email
  async getUserByEmail(email) {
    const user = await User.findOne({ email }).select('+password');
    return user;
  }

  // Create new user
  async createUser(userData) {
    // Check if user already exists
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw new AppError('User with this email already exists', 400);
    }

    const user = await User.create(userData);
    
    // Populate role if exists
    if (user.role) {
      await user.populate('role', 'name description');
    }

    return user;
  }

  // Update user
  async updateUser(id, updateData) {
    const user = await User.findByIdAndUpdate(
      id,
      updateData,
      { 
        new: true, 
        runValidators: true 
      }
    ).populate('role', 'name description');

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user;
  }

  // Delete user (soft delete by setting status to blocked)
  async deleteUser(id) {
    const user = await User.findByIdAndUpdate(
      id,
      { status: 'blocked' },
      { new: true }
    );

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user;
  }

  // Assign role to user
  async assignRole(userId, roleId) {
    const user = await User.findByIdAndUpdate(
      userId,
      { role: roleId },
      { new: true }
    ).populate('role', 'name description permissions');

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user;
  }

  // Update last login
  async updateLastLogin(userId) {
    await User.findByIdAndUpdate(userId, {
      lastLogin: new Date()
    });
  }

  // Verify email
  async verifyEmail(userId) {
    const user = await User.findByIdAndUpdate(
      userId,
      { emailVerified: true },
      { new: true }
    );

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user;
  }

  // Create password reset token
  async createPasswordResetToken(email) {
    const user = await User.findOne({ email });
    
    if (!user) {
      throw new AppError('No user found with this email', 404);
    }

    // Generate reset token (you should implement proper token generation)
    const resetToken = Buffer.from(`${user._id}-${Date.now()}`).toString('base64');
    
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
    await user.save();

    return resetToken;
  }

  // Reset password
  async resetPassword(token, newPassword) {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      throw new AppError('Invalid or expired reset token', 400);
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return user;
  }
}

module.exports = { UserService };
