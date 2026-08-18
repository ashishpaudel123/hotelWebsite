const { RoomService } = require('../services/room.service');
const catchAsync = require('../../../utils/catchAsync');
const AppError = require('../../../utils/appError');

const roomService = new RoomService();

class RoomController {
  getAllRooms = catchAsync(async (req, res) => {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      roomType, 
      minPrice, 
      maxPrice, 
      amenities,
      search,
      sortBy = 'createdAt', 
      order = 'DESC' 
    } = req.query;
    
    const filters = {};
    if (status) filters.status = status;
    if (roomType) filters.roomType = roomType;
    if (minPrice || maxPrice) {
      filters.minPrice = minPrice;
      filters.maxPrice = maxPrice;
    }
    if (amenities) {
      filters.amenities = Array.isArray(amenities) ? amenities : [amenities];
    }
    if (search) filters.search = search;

    const options = {
      page: Number(page),
      limit: Number(limit),
      sortBy,
      order,
    };

    const result = await roomService.getAllRooms(filters, options);
    
    res.status(200).json({
      success: true,
      message: 'Rooms retrieved successfully',
      data: result,
    });
  });

  getRoomById = catchAsync(async (req, res) => {
    const { id } = req.params;
    const room = await roomService.getRoomById(id);
    
    res.status(200).json({
      success: true,
      message: 'Room retrieved successfully',
      data: room,
    });
  });

  getRoomBySlug = catchAsync(async (req, res) => {
    const { slug } = req.params;
    const room = await roomService.getRoomBySlug(slug);
    
    res.status(200).json({
      success: true,
      message: 'Room retrieved successfully',
      data: room,
    });
  });

  createRoom = catchAsync(async (req, res) => {
    const roomData = req.body;
    const room = await roomService.createRoom(roomData);
    
    res.status(201).json({
      success: true,
      message: 'Room created successfully',
      data: room,
    });
  });

  updateRoom = catchAsync(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;
    
    const room = await roomService.updateRoom(id, updateData);
    
    res.status(200).json({
      success: true,
      message: 'Room updated successfully',
      data: room,
    });
  });

  deleteRoom = catchAsync(async (req, res) => {
    const { id } = req.params;
    await roomService.deleteRoom(id);
    
    res.status(200).json({
      success: true,
      message: 'Room deleted successfully',
      data: null,
    });
  });

  getRoomsByStatus = catchAsync(async (req, res) => {
    const { status } = req.params;
    const rooms = await roomService.getRoomsByStatus(status);
    
    res.status(200).json({
      success: true,
      message: 'Rooms retrieved successfully',
      data: rooms,
    });
  });

  getFeaturedRooms = catchAsync(async (req, res) => {
    const { limit = 4 } = req.query;
    const rooms = await roomService.getFeaturedRooms(Number(limit));
    
    res.status(200).json({
      success: true,
      message: 'Featured rooms retrieved successfully',
      data: rooms,
    });
  });

  checkAvailability = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { checkIn, checkOut } = req.query;
    
    if (!checkIn || !checkOut) {
      throw new AppError('Check-in and check-out dates are required', 400);
    }

    const isAvailable = await roomService.checkAvailability(
      id, 
      new Date(checkIn), 
      new Date(checkOut)
    );
    
    res.status(200).json({
      success: true,
      message: 'Availability checked successfully',
      data: { available: isAvailable },
    });
  });
}

module.exports = new RoomController();
