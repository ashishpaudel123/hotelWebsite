const { UserService } = require('../services/user.service');
const catchAsync = require('../../../utils/catchAsync');
const AppError = require('../../../utils/appError');

const userService = new UserService();

class UserController {
  // Get all users with pagination, filtering, and sorting
  getAllUsers = catchAsync(async (req, res) => {
    const { page = 1, limit = 10, search, role, status, sortBy = 'createdAt', order = 'DESC' } = req.query;
    
    const filters = {};
    if (search) {
      filters.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    if (role) filters.role = role;
    if (status) filters.status = status;

    const options = {
      page: Number(page),
      limit: Number(limit),
      sortBy,
      order,
    };

    const result = await userService.getAllUsers(filters, options);
    
    res.status(200).json({
      success: true,
      message: 'Users retrieved successfully',
      data: result,
    });
  });

  // Get single user by ID
  getUserById = catchAsync(async (req, res) => {
    const { id } = req.params;
    const user = await userService.getUserById(id);
    
    res.status(200).json({
      success: true,
      message: 'User retrieved successfully',
      data: user,
    });
  });

  // Create new user
  createUser = catchAsync(async (req, res) => {
    const userData = req.body;
    
    if (!userData.email || !userData.password) {
      throw new AppError('Email and password are required', 400);
    }

    const user = await userService.createUser(userData);
    
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: user,
    });
  });

  // Update user
  updateUser = catchAsync(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;
    
    delete updateData.password;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    const user = await userService.updateUser(id, updateData);
    
    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: user,
    });
  });

  // Delete user (soft delete)
  deleteUser = catchAsync(async (req, res) => {
    const { id } = req.params;
    await userService.deleteUser(id);
    
    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
      data: null,
    });
  });

  // Toggle user status (active/block)
  toggleUserStatus = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['active', 'blocked'].includes(status)) {
      throw new AppError('Invalid status. Must be "active" or "blocked"', 400);
    }

    const user = await userService.updateUser(id, { status });
    
    res.status(200).json({
      success: true,
      message: `User ${status} successfully`,
      data: user,
    });
  });

  // Assign role to user
  assignRole = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { roleId } = req.body;
    
    if (!roleId) {
      throw new AppError('Role ID is required', 400);
    }

    const user = await userService.assignRole(id, roleId);
    
    res.status(200).json({
      success: true,
      message: 'Role assigned successfully',
      data: user,
    });
  });
}

module.exports = new UserController();
