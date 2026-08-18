const Blog = require('../../../models/Blog');
const Event = require('../../../models/Event');
const Gallery = require('../../../models/Gallery');
const Testimonial = require('../../../models/Testimonial');
const MenuItem = require('../../../models/MenuItem');
const HomepageSection = require('../../../models/HomepageSection');
const WebsiteSetting = require('../../../models/WebsiteSetting');
const AppError = require('../../../utils/appError');

class CMSService {
  // Blog methods
  async getAllBlogs(filters = {}, options = {}) {
    const { page = 1, limit = 10, status = 'published', category, search } = options;
    
    const query = {};
    if (status) query.status = status;
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    const [blogs, total] = await Promise.all([
      Blog.find(query)
        .populate('author', 'firstName lastName email')
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Blog.countDocuments(query)
    ]);

    return { data: blogs, pagination: { currentPage: parseInt(page), totalPages: Math.ceil(total / limit), totalItems: total } };
  }

  async getBlogBySlug(slug) {
    const blog = await Blog.findOne({ slug }).populate('author', 'firstName lastName avatar');
    if (!blog) throw new AppError('Blog not found', 404);
    
    // Increment views
    blog.views += 1;
    await blog.save();
    
    return blog;
  }

  async createBlog(blogData) {
    return await Blog.create(blogData);
  }

  async updateBlog(id, updateData) {
    const blog = await Blog.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    if (!blog) throw new AppError('Blog not found', 404);
    return blog;
  }

  async deleteBlog(id) {
    const blog = await Blog.findByIdAndDelete(id);
    if (!blog) throw new AppError('Blog not found', 404);
    return blog;
  }

  // Event methods
  async getAllEvents(filters = {}, options = {}) {
    const { page = 1, limit = 10, status = 'published', eventType, upcoming } = options;
    
    const query = {};
    if (status) query.status = status;
    if (eventType) query.eventType = eventType;
    if (upcoming === 'true') query.startDate = { $gte: new Date() };

    const skip = (page - 1) * limit;
    const [events, total] = await Promise.all([
      Event.find(query).sort({ startDate: 1 }).skip(skip).limit(parseInt(limit)),
      Event.countDocuments(query)
    ]);

    return { data: events, pagination: { currentPage: parseInt(page), totalPages: Math.ceil(total / limit), totalItems: total } };
  }

  async createEvent(eventData) { return await Event.create(eventData); }
  async updateEvent(id, updateData) {
    const event = await Event.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    if (!event) throw new AppError('Event not found', 404);
    return event;
  }
  async deleteEvent(id) {
    const event = await Event.findByIdAndDelete(id);
    if (!event) throw new AppError('Event not found', 404);
    return event;
  }

  // Gallery methods
  async getAllGalleries(category, isActive = true) {
    const query = { isActive };
    if (category) query.category = category;
    return await Gallery.find(query).sort({ order: 1 });
  }

  async createGallery(galleryData) { return await Gallery.create(galleryData); }
  async updateGallery(id, updateData) {
    const gallery = await Gallery.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    if (!gallery) throw new AppError('Gallery not found', 404);
    return gallery;
  }
  async deleteGallery(id) {
    const gallery = await Gallery.findByIdAndDelete(id);
    if (!gallery) throw new AppError('Gallery not found', 404);
    return gallery;
  }

  // Testimonial methods
  async getAllTestimonials(status = 'approved', isFeatured) {
    const query = { status };
    if (isFeatured !== undefined) query.isFeatured = isFeatured;
    return await Testimonial.find(query).sort({ createdAt: -1 });
  }

  async createTestimonial(testimonialData) { return await Testimonial.create(testimonialData); }
  async updateTestimonial(id, updateData) {
    const testimonial = await Testimonial.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    if (!testimonial) throw new AppError('Testimonial not found', 404);
    return testimonial;
  }
  async deleteTestimonial(id) {
    const testimonial = await Testimonial.findByIdAndDelete(id);
    if (!testimonial) throw new AppError('Testimonial not found', 404);
    return testimonial;
  }

  // Menu Item methods
  async getAllMenuItems(category, isAvailable = true) {
    const query = { isAvailable };
    if (category) query.category = category;
    return await MenuItem.find(query).sort({ order: 1, category: 1 });
  }

  async createMenuItem(itemData) { return await MenuItem.create(itemData); }
  async updateMenuItem(id, updateData) {
    const item = await MenuItem.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    if (!item) throw new AppError('Menu item not found', 404);
    return item;
  }
  async deleteMenuItem(id) {
    const item = await MenuItem.findByIdAndDelete(id);
    if (!item) throw new AppError('Menu item not found', 404);
    return item;
  }

  // Homepage Section methods
  async getAllHomepageSections(isActive = true) {
    const query = { isActive };
    return await HomepageSection.find(query).sort({ order: 1 });
  }

  async createHomepageSection(sectionData) { return await HomepageSection.create(sectionData); }
  async updateHomepageSection(id, updateData) {
    const section = await HomepageSection.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    if (!section) throw new AppError('Homepage section not found', 404);
    return section;
  }
  async deleteHomepageSection(id) {
    const section = await HomepageSection.findByIdAndDelete(id);
    if (!section) throw new AppError('Homepage section not found', 404);
    return section;
  }

  // Website Settings methods
  async getWebsiteSettings() {
    let settings = await WebsiteSetting.findOne();
    if (!settings) {
      settings = await WebsiteSetting.create({ siteName: 'Hotel Booking System' });
    }
    return settings;
  }

  async updateWebsiteSettings(updateData) {
    let settings = await WebsiteSetting.findOne();
    if (!settings) {
      settings = await WebsiteSetting.create(updateData);
    } else {
      settings = await WebsiteSetting.findByIdAndUpdate(settings._id, updateData, { new: true, runValidators: true });
    }
    return settings;
  }
}

module.exports = { CMSService };
