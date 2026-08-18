const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const authMiddleware = require('../../../middleware/auth.middleware');

// Public routes (webhooks)
router.post('/webhook/esewa', paymentController.post('/webhook/esewa'));
router.post('/webhook/khalti', paymentController.post('/webhook/khalti'));

// Protected routes
router.use(authMiddleware.authenticate);

router.post('/initiate', paymentController.post('/initiate'));
router.get('/', paymentController.get('/'));
router.get('/:transactionId', paymentController.get('/:transactionId'));
router.post('/:id/refund', paymentController.post('/:id/refund'));

module.exports = router;
