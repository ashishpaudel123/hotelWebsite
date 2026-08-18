const { CMSService } = require('../services/cms.service');
const catchAsync = require('../../../utils/catchAsync');

const cmsService = new CMSService();

class CMSController {
  // Blog endpoints
  getAllBlogs = catchAsync(async (req, res) => {
    const { page = 1, limit = 10, status, category, search } = req.query;
    const result = await cmsService.getAllBlogs({}, { page, limit, status, category, search });
    res.status(200).json({ success: true, data: result });
  });

  getBlogBySlug = catchAsync(async (req, res) => {
    const blog = await cmsService.getBlogBySlug(req.params.slug);
    res.status(200).json({ success: true, data: blog });
  });

  createBlog = catchAsync(async (req, res) => {
    const blog = await cmsService.createBlog(req.body);
    res.status(201).json({ success: true, message: 'Blog created', data: blog });
  });

  updateBlog = catchAsync(async (req, res) => {
    const blog = await cmsService.updateBlog(req.params.id, req.body);
    res.status(200).json({ success: true, message: 'Blog updated', data: blog });
  });

  deleteBlog = catchAsync(async (req, res) => {
    await cmsService.deleteBlog(req.params.id);
    res.status(200).json({ success: true, message: 'Blog deleted' });
  });

  // Event endpoints
  getAllEvents = catchAsync(async (req, res) => {
    const { page = 1, limit = 10, status, eventType, upcoming } = req.query;
    const result = await cmsService.getAllEvents({}, { page, limit, status, eventType, upcoming });
    res.status(200).json({ success: true, data: result });
  });

  createEvent = catchAsync(async (req, res) => {
    const event = await cmsService.createEvent(req.body);
    res.status(201).json({ success: true, message: 'Event created', data: event });
  });

  updateEvent = catchAsync(async (req, res) => {
    const event = await cmsService.updateEvent(req.params.id, req.body);
    res.status(200).json({ success: true, message: 'Event updated', data: event });
  });

  deleteEvent = catchAsync(async (req, res) => {
    await cmsService.deleteEvent(req.params.id);
    res.status(200).json({ success: true, message: 'Event deleted' });
  });

  // Gallery endpoints
  getAllGalleries = catchAsync(async (req, res) => {
    const galleries = await cmsService.getAllGalleries(req.query.category, req.query.isActive);
    res.status(200).json({ success: true, data: galleries });
  });

  createGallery = catchAsync(async (req, res) => {
    const gallery = await cmsService.createGallery(req.body);
    res.status(201).json({ success: true, message: 'Gallery created', data: gallery });
  });

  updateGallery = catchAsync(async (req, res) => {
    const gallery = await cmsService.updateGallery(req.params.id, req.body);
    res.status(200).json({ success: true, message: 'Gallery updated', data: gallery });
  });

  deleteGallery = catchAsync(async (req, res) => {
    await cmsService.deleteGallery(req.params.id);
    res.status(200).json({ success: true, message: 'Gallery deleted' });
  });

  // Testimonial endpoints
  getAllTestimonials = catchAsync(async (req, res) => {
    const testimonials = await cmsService.getAllTestimonials(req.query.status, req.query.isFeatured);
    res.status(200).json({ success: true, data: testimonials });
  });

  createTestimonial = catchAsync(async (req, res) => {
    const testimonial = await cmsService.createTestimonial(req.body);
    res.status(201).json({ success: true, message: 'Testimonial created', data: testimonial });
  });

  updateTestimonial = catchAsync(async (req, res) => {
    const testimonial = await cmsService.updateTestimonial(req.params.id, req.body);
    res.status(200).json({ success: true, message: 'Testimonial updated', data: testimonial });
  });

  deleteTestimonial = catchAsync(async (req, res) => {
    await cmsService.deleteTestimonial(req.params.id);
    res.status(200).json({ success: true, message: 'Testimonial deleted' });
  });

  // Menu Item endpoints
  getAllMenuItems = catchAsync(async (req, res) => {
    const items = await cmsService.getAllMenuItems(req.query.category, req.query.isAvailable);
    res.status(200).json({ success: true, data: items });
  });

  createMenuItem = catchAsync(async (req, res) => {
    const item = await cmsService.createMenuItem(req.body);
    res.status(201).json({ success: true, message: 'Menu item created', data: item });
  });

  updateMenuItem = catchAsync(async (req, res) => {
    const item = await cmsService.updateMenuItem(req.params.id, req.body);
    res.status(200).json({ success: true, message: 'Menu item updated', data: item });
  });

  deleteMenuItem = catchAsync(async (req, res) => {
    await cmsService.deleteMenuItem(req.params.id);
    res.status(200).json({ success: true, message: 'Menu item deleted' });
  });

  // Homepage Section endpoints
  getAllHomepageSections = catchAsync(async (req, res) => {
    const sections = await cmsService.getAllHomepageSections(req.query.isActive);
    res.status(200).json({ success: true, data: sections });
  });

  createHomepageSection = catchAsync(async (req, res) => {
    const section = await cmsService.createHomepageSection(req.body);
    res.status(201).json({ success: true, message: 'Section created', data: section });
  });

  updateHomepageSection = catchAsync(async (req, res) => {
    const section = await cmsService.updateHomepageSection(req.params.id, req.body);
    res.status(200).json({ success: true, message: 'Section updated', data: section });
  });

  deleteHomepageSection = catchAsync(async (req, res) => {
    await cmsService.deleteHomepageSection(req.params.id);
    res.status(200).json({ success: true, message: 'Section deleted' });
  });

  // Website Settings endpoints
  getWebsiteSettings = catchAsync(async (req, res) => {
    const settings = await cmsService.getWebsiteSettings();
    res.status(200).json({ success: true, data: settings });
  });

  updateWebsiteSettings = catchAsync(async (req, res) => {
    const settings = await cmsService.updateWebsiteSettings(req.body);
    res.status(200).json({ success: true, message: 'Settings updated', data: settings });
  });
}

module.exports = new CMSController();
