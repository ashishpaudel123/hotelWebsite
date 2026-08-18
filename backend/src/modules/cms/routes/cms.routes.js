const express = require('express');
const cmsController = require('../controllers/cms.controller');

const router = express.Router();

// Blog routes
router.route('/blogs')
  .get(cmsController.getAllBlogs)
  .post(cmsController.createBlog);
router.route('/blogs/:slug')
  .get(cmsController.getBlogBySlug);
router.route('/blogs/:id')
  .patch(cmsController.updateBlog)
  .delete(cmsController.deleteBlog);

// Event routes
router.route('/events')
  .get(cmsController.getAllEvents)
  .post(cmsController.createEvent);
router.route('/events/:id')
  .patch(cmsController.updateEvent)
  .delete(cmsController.deleteEvent);

// Gallery routes
router.route('/galleries')
  .get(cmsController.getAllGalleries)
  .post(cmsController.createGallery);
router.route('/galleries/:id')
  .patch(cmsController.updateGallery)
  .delete(cmsController.deleteGallery);

// Testimonial routes
router.route('/testimonials')
  .get(cmsController.getAllTestimonials)
  .post(cmsController.createTestimonial);
router.route('/testimonials/:id')
  .patch(cmsController.updateTestimonial)
  .delete(cmsController.deleteTestimonial);

// Menu Item routes
router.route('/menu-items')
  .get(cmsController.getAllMenuItems)
  .post(cmsController.createMenuItem);
router.route('/menu-items/:id')
  .patch(cmsController.updateMenuItem)
  .delete(cmsController.deleteMenuItem);

// Homepage Section routes
router.route('/homepage-sections')
  .get(cmsController.getAllHomepageSections)
  .post(cmsController.createHomepageSection);
router.route('/homepage-sections/:id')
  .patch(cmsController.updateHomepageSection)
  .delete(cmsController.deleteHomepageSection);

// Website Settings routes
router.route('/website-settings')
  .get(cmsController.getWebsiteSettings)
  .patch(cmsController.updateWebsiteSettings);

module.exports = router;
