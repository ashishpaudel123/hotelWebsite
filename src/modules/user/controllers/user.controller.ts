import { Request, Response, NextFunction } from 'express';
import * as bcrypt from 'bcryptjs';
import { responseHandler } from '../../../utils/responseHandler';
import { sanitizeRegex } from '../../../utils/regex';
import { User } from '../../../models';

export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit, role, status, search } = req.query;
    const filter: any = { isDeleted: false };
    if (role) filter.role = role;
    if (status) filter.status = status;
    if (search) {
      const sanitizedSearch = sanitizeRegex(search);
      filter.$or = [
        { firstName: { $regex: sanitizedSearch, $options: 'i' } },
        { lastName: { $regex: sanitizedSearch, $options: 'i' } },
        { email: { $regex: sanitizedSearch, $options: 'i' } },
      ];
    }

    const pageNum = page ? parseInt(page as string) : 1;
    const limitNum = limit ? parseInt(limit as string) : 20;
    const skip = (pageNum - 1) * limitNum;

    const [users, total] = await Promise.all([
      User.find(filter)
        .populate('role', 'name slug')
        .select('-password -passwordResetToken -passwordResetExpires')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      User.countDocuments(filter),
    ]);

    return responseHandler.success(res, users, 'Users retrieved successfully', 200, {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    return next(error);
  }
};

export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id)
      .populate('role', 'name slug permissions')
      .select('-password -passwordResetToken -passwordResetExpires')
      .lean();

    if (!user) {
      return responseHandler.notFound(res, 'User');
    }

    return responseHandler.success(res, user, 'User retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.create(req.body);
    const populated = await User.findById(user._id)
      .populate('role', 'name slug')
      .select('-password -passwordResetToken -passwordResetExpires')
      .lean();
    return responseHandler.created(res, populated, 'User created successfully');
  } catch (error) {
    return next(error);
  }
};

export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updatePayload: any = { ...req.body };

    if (updatePayload.password) {
      const hashedPassword = await bcrypt.hash(updatePayload.password, 12);
      updatePayload.password = hashedPassword;
      updatePayload.passwordChangedAt = new Date();
    } else {
      delete updatePayload.password;
    }

    const user = await User.findByIdAndUpdate(id, updatePayload, { new: true })
      .populate('role', 'name slug')
      .select('-password -passwordResetToken -passwordResetExpires')
      .lean();

    if (!user) {
      return responseHandler.notFound(res, 'User');
    }

    return responseHandler.success(res, user, 'User updated successfully');
  } catch (error) {
    return next(error);
  }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await User.findByIdAndUpdate(id, { isDeleted: true, deletedAt: new Date() });
    return responseHandler.success(res, null, 'User deleted successfully');
  } catch (error) {
    return next(error);
  }
};
