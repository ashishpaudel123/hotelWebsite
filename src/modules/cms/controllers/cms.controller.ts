import { Request, Response, NextFunction } from 'express';
import {
  WebsiteSettings,
  ThemeSettings,
  HomepageSection,
} from '../../../models/website';
import {
  BlogPost as BlogPostModel,
  Event as EventModel,
  GalleryImage as GalleryImageModel,
  Testimonial as TestimonialModel,
  MenuCategory as MenuCategoryModel,
  MenuItem as MenuItemModel,
} from '../../../models/content';

// GET /api/v1/website/settings
export const getWebsiteSettings = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const settings = await WebsiteSettings.findOne().sort({ createdAt: -1 }).lean();
    return res.json(settings || {});
  } catch (error) {
    return next(error);
  }
};

// GET /api/v1/website/theme
export const getThemeSettings = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const theme = await ThemeSettings.findOne().sort({ createdAt: -1 }).lean();
    return res.json(theme || {});
  } catch (error) {
    return next(error);
  }
};

// GET /api/v1/website/homepage-sections?status=active&isVisible=true
export const getHomepageSections = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const sections = await HomepageSection.find({ status: 'active', isVisible: true })
      .sort({ displayOrder: 1 })
      .lean();
    return res.json(sections);
  } catch (error) {
    return next(error);
  }
};

// GET /api/v1/blogs?status=published&limit=6
export const getBlogs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const status = (req.query.status as string) || 'published';
    const limit = parseInt((req.query.limit as string) || '6', 10);
    const blogs = await BlogPostModel.find({ status })
      .sort({ publishedAt: -1 })
      .limit(limit)
      .lean();
    return res.json({ data: blogs });
  } catch (error) {
    return next(error);
  }
};

// GET /api/v1/blogs/slug/:slug
export const getBlogBySlug = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const blog = await BlogPostModel.findOne({ slug: req.params.slug }).lean();
    if (!blog) {
      return res.status(404).json({ success: false, error: { message: 'Blog not found' } });
    }
    return res.json(blog);
  } catch (error) {
    return next(error);
  }
};

// GET /api/v1/events?status=upcoming
export const getEvents = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const status = (req.query.status as string) || 'upcoming';
    const events = await EventModel.find({ status }).sort({ startDate: 1 }).lean();
    return res.json({ data: events });
  } catch (error) {
    return next(error);
  }
};

// GET /api/v1/gallery?isVisible=true&category=rooms
export const getGalleryImages = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filter: any = { isVisible: true };
    if (req.query.category) {
      filter.category = req.query.category;
    }
    const images = await GalleryImageModel.find(filter).sort({ displayOrder: 1 }).lean();
    return res.json({ data: images });
  } catch (error) {
    return next(error);
  }
};

// GET /api/v1/testimonials?isVisible=true&featured=true
export const getTestimonials = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filter: any = { isVisible: true };
    if (req.query.featured === 'true') {
      filter.featured = true;
    }
    const testimonials = await TestimonialModel.find(filter).lean();
    return res.json({ data: testimonials });
  } catch (error) {
    return next(error);
  }
};

// GET /api/v1/menu-items?isAvailable=true
export const getMenuItems = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filter: any = {};
    if (req.query.isAvailable === 'true') {
      filter.isAvailable = true;
    }
    const items = await MenuItemModel.find(filter).populate('category').lean();
    return res.json({ data: items });
  } catch (error) {
    return next(error);
  }
};

// GET /api/v1/menu-categories?isActive=true
export const getMenuCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filter: any = {};
    if (req.query.isActive === 'true') {
      filter.isActive = true;
    }
    const categories = await MenuCategoryModel.find(filter).sort({ displayOrder: 1 }).lean();
    return res.json({ data: categories });
  } catch (error) {
    return next(error);
  }
};
