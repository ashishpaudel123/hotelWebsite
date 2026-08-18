const Room = require('../../../models/Room');
const AppError = require('../../../utils/appError');

class RoomService {
  async getAllRooms(filters = {}, options = {}) {
    const { page = 1, limit = 10, sortBy = 'createdAt', order = 'DESC' } = options;
    
    const query = { isActive: true };
    if (filters.status) query.status = filters.status;
    if (filters.roomType) query.roomType = filters.roomType;
    if (filters.minPrice || filters.maxPrice) {
      query.pricePerNight = {};
      if (filters.minPrice) query.pricePerNight.$gte = Number(filters.minPrice);
      if (filters.maxPrice) query.pricePerNight.$lte = Number(filters.maxPrice);
    }
    if (filters.amenities) {
      query.amenities = { $all: filters.amenities };
    }
    if (filters.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: 'i' } },
        { description: { $regex: filters.search, $options: 'i' } }
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = order === 'DESC' ? -1 : 1;

    const skip = (page - 1) * limit;

    const [rooms, total] = await Promise.all([
      Room.find(query)
        .populate('roomType', 'name description')
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit)),
      Room.countDocuments(query)
    ]);

    return {
      data: rooms,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    };
  }

  async getRoomById(id) {
    const room = await Room.findById(id)
      .populate('roomType', 'name description basePrice amenities');

    if (!room) {
      throw new AppError('Room not found', 404);
    }

    return room;
  }

  async getRoomBySlug(slug) {
    const room = await Room.findOne({ slug })
      .populate('roomType', 'name description basePrice amenities');

    if (!room) {
      throw new AppError('Room not found', 404);
    }

    return room;
  }

  async createRoom(roomData) {
    const existingRoom = await Room.findOne({ slug: roomData.slug });
    if (existingRoom) {
      throw new AppError('Room with this slug already exists', 400);
    }

    const room = await Room.create(roomData);
    await room.populate('roomType', 'name description');
    return room;
  }

  async updateRoom(id, updateData) {
    const room = await Room.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('roomType', 'name description');

    if (!room) {
      throw new AppError('Room not found', 404);
    }

    return room;
  }

  async deleteRoom(id) {
    const room = await Room.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!room) {
      throw new AppError('Room not found', 404);
    }

    return room;
  }

  async getRoomsByStatus(status) {
    const rooms = await Room.find({ status, isActive: true })
      .populate('roomType', 'name description');
    return rooms;
  }

  async getFeaturedRooms(limit = 4) {
    const rooms = await Room.find({ 
      isFeatured: true, 
      isActive: true 
    })
      .populate('roomType', 'name description')
      .limit(limit);
    return rooms;
  }

  async checkAvailability(roomId, checkIn, checkOut) {
    const Booking = require('../../../models/Booking');
    
    const existingBooking = await Booking.findOne({
      room: roomId,
      status: { $in: ['confirmed', 'checked-in'] },
      $or: [
        { checkIn: { $lt: checkOut }, checkOut: { $gt: checkIn } }
      ]
    });

    return !existingBooking;
  }
}

module.exports = { RoomService };
