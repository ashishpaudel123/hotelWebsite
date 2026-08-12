import { Router } from 'express';
import {
  getWebsiteSettings,
  getThemeSettings,
  getHomepageSections,
  getBlogs,
  getBlogBySlug,
  getEvents,
  getGalleryImages,
  getTestimonials,
  getMenuItems,
  getMenuCategories,
} from '../controllers/cms.controller';

const router = Router();

// Website / CMS
router.get('/website/settings', (req, res, next) => getWebsiteSettings(req, res, next));
router.get('/website/theme', (req, res, next) => getThemeSettings(req, res, next));
router.get('/website/homepage-sections', (req, res, next) => getHomepageSections(req, res, next));

// Blogs
router.get('/blogs', (req, res, next) => getBlogs(req, res, next));
router.get('/blogs/slug/:slug', (req, res, next) => getBlogBySlug(req, res, next));

// Events
router.get('/events', (req, res, next) => getEvents(req, res, next));

// Gallery
router.get('/gallery', (req, res, next) => getGalleryImages(req, res, next));

// Testimonials
router.get('/testimonials', (req, res, next) => getTestimonials(req, res, next));

// Menu
router.get('/menu-items', (req, res, next) => getMenuItems(req, res, next));
router.get('/menu-categories', (req, res, next) => getMenuCategories(req, res, next));

export default router;
