import { Request, Response, NextFunction } from 'express';
import { responseHandler } from '../../../utils/responseHandler';
import { Blog, Event, MenuCategory, MenuItem, GalleryImage, Testimonial } from '../../../models';

export const getBlogs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, limit } = req.query;
    const filter: any = {};
    if (status) filter.status = status;
    filter.status = filter.status || 'published';

    const blogs = await Blog.find(filter)
      .sort({ publishedAt: -1, createdAt: -1 })
      .limit(limit ? parseInt(limit as string) : 50)
      .lean();

    return responseHandler.success(res, blogs, 'Blogs retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

export const getBlogBySlug = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;
    const blog = await Blog.findOne({ slug, status: 'published' }).lean();
    if (!blog) {
      return responseHandler.notFound(res, 'Blog');
    }
    return responseHandler.success(res, blog, 'Blog retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

export const getEvents = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.query;
    const filter: any = {};
    if (status) filter.status = status;

    const events = await Event.find(filter).sort({ startDate: 1 }).lean();
    return responseHandler.success(res, events, 'Events retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

export const getMenuCategories = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await MenuCategory.find({ isActive: true }).sort({ displayOrder: 1 }).lean();
    return responseHandler.success(res, categories, 'Menu categories retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

export const getMenuItems = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { categoryId, isAvailable } = req.query;
    const filter: any = { status: 'active' };
    if (categoryId) filter.category = categoryId;
    if (isAvailable !== undefined) filter.isAvailable = isAvailable === 'true';

    const items = await MenuItem.find(filter).populate('category', 'name slug').lean();
    return responseHandler.success(res, items, 'Menu items retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

export const getGallery = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category, isVisible } = req.query;
    const filter: any = { status: 'active' };
    if (category) filter.category = category;
    if (isVisible !== undefined) filter.isVisible = isVisible === 'true';

    const images = await GalleryImage.find(filter).sort({ displayOrder: 1 }).lean();
    return responseHandler.success(res, images, 'Gallery retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

export const getTestimonials = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { featured, isVisible } = req.query;
    const filter: any = {};
    if (featured !== undefined) filter.featured = featured === 'true';
    if (isVisible !== undefined) filter.isVisible = isVisible === 'true';

    const testimonials = await Testimonial.find(filter).sort({ featured: -1 }).lean();
    return responseHandler.success(res, testimonials, 'Testimonials retrieved successfully');
  } catch (error) {
    return next(error);
  }
};
