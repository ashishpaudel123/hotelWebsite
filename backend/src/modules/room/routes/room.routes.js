const express = require('express');
const roomController = require('../controllers/room.controller');

const router = express.Router();

// Public routes
router.get('/featured', roomController.getFeaturedRooms);
router.get('/status/:status', roomController.getRoomsByStatus);
router.get('/:slug', roomController.getRoomBySlug);

// All routes
router.route('/')
  .get(roomController.getAllRooms)
  .post(roomController.createRoom);

router.route('/:id')
  .get(roomController.getRoomById)
  .patch(roomController.updateRoom)
  .delete(roomController.deleteRoom);

router.get('/:id/availability', roomController.checkAvailability);

module.exports = router;
