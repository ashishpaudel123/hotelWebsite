const express = require('express');
const userController = require('../controllers/user.controller');
// const { authenticate, authorize } = require('../../../middleware/auth.middleware');

const router = express.Router();

// Public routes
// router.post('/register', userController.register);
// router.post('/login', userController.login);
// router.post('/forgot-password', userController.forgotPassword);
// router.post('/reset-password/:token', userController.resetPassword);

// Protected routes (require authentication)
router.route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router.route('/:id')
  .get(userController.getUserById)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

router.patch('/:id/status', userController.toggleUserStatus);
router.post('/:id/assign-role', userController.assignRole);

module.exports = router;
