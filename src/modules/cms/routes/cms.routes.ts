import { Router } from 'express';
import {
  getBlogs,
  getBlogBySlug,
  getEvents,
  getMenuCategories,
  getMenuItems,
  getGallery,
  getTestimonials,
} from '../controllers/cms.controller';

const router = Router();

router.get('/blogs', getBlogs);
router.get('/blogs/slug/:slug', getBlogBySlug);
router.get('/events', getEvents);
router.get('/menu-categories', getMenuCategories);
router.get('/menu-items', getMenuItems);
router.get('/gallery', getGallery);
router.get('/testimonials', getTestimonials);

export default router;
