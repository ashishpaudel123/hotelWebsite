"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRoomBySlug = exports.getRooms = void 0;
const responseHandler_1 = require("../../../utils/responseHandler");
const models_1 = require("../../../models");
const getRooms = async (req, res, next) => {
    try {
        const { status, roomTypeId } = req.query;
        const filter = {};
        if (status)
            filter.status = status;
        if (roomTypeId)
            filter.roomType = roomTypeId;
        const rooms = await models_1.Room.find(filter)
            .populate('roomType', 'name slug description maxOccupancy basePrice images amenities')
            .sort({ createdAt: -1 })
            .limit(100)
            .lean();
        return responseHandler_1.responseHandler.success(res, rooms, 'Rooms retrieved successfully');
    }
    catch (error) {
        return next(error);
    }
};
exports.getRooms = getRooms;
const getRoomBySlug = async (req, res, next) => {
    try {
        const { slug } = req.params;
        const roomType = await models_1.RoomType.findOne({ slug, status: 'active' }).lean();
        if (!roomType) {
            return responseHandler_1.responseHandler.notFound(res, 'Room type');
        }
        const rooms = await models_1.Room.find({ roomType: roomType._id, status: 'available' })
            .populate('roomType', 'name slug description maxOccupancy basePrice images amenities')
            .lean();
        return responseHandler_1.responseHandler.success(res, rooms, 'Rooms retrieved successfully');
    }
    catch (error) {
        return next(error);
    }
};
exports.getRoomBySlug = getRoomBySlug;
//# sourceMappingURL=room.controller.js.map