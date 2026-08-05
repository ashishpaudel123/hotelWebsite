const express = require('express');
const router = express.Router();
const bookingController = require('./controllers/booking.controller');
const authMiddleware = require('../../middleware/auth.middleware');

// Public routes
router.post('/check-availability', bookingController.post('/check-availability'));
router.get('/reference/:ref', bookingController.get('/reference/:ref'));

// Protected routes
router.use(authMiddleware.authenticate);

router.post('/', bookingController.post('/'));
router.get('/', bookingController.get('/'));
router.get('/:id', bookingController.get('/:id'));
router.patch('/:id/status', bookingController.patch('/:id/status'));
router.post('/:id/cancel', bookingController.post('/:id/cancel'));
router.get('/statistics', bookingController.get('/statistics'));

module.exports = router;
