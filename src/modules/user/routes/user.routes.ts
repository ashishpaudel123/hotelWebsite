import { Router } from 'express';
import { getUsers, getUserById, createUser, updateUser, deleteUser } from '../controllers/user.controller';
import { authenticate, checkRole } from '../../../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', checkRole('admin', 'staff'), getUsers);
router.get('/:id', getUserById);
router.post('/', checkRole('admin', 'staff'), createUser);
router.put('/:id', updateUser);
router.delete('/:id', checkRole('admin'), deleteUser);

export default router;
