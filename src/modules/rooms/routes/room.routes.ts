import { Router } from 'express';
import { getRooms, getRoomBySlug } from '../controllers/room.controller';

const router = Router();

router.get('/rooms', (req, res, next) => getRooms(req, res, next));
router.get('/rooms/slug/:slug', (req, res, next) => getRoomBySlug(req, res, next));

export default router;
