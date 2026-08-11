"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTestimonials = exports.getGallery = exports.getMenuItems = exports.getMenuCategories = exports.getEvents = exports.getBlogBySlug = exports.getBlogs = void 0;
const responseHandler_1 = require("../../../utils/responseHandler");
const models_1 = require("../../../models");
const getBlogs = async (req, res, next) => {
    try {
        const { status, limit } = req.query;
        const filter = {};
        if (status)
            filter.status = status;
        filter.status = filter.status || 'published';
        const blogs = await models_1.Blog.find(filter)
            .sort({ publishedAt: -1, createdAt: -1 })
            .limit(limit ? parseInt(limit) : 50)
            .lean();
        return responseHandler_1.responseHandler.success(res, blogs, 'Blogs retrieved successfully');
    }
    catch (error) {
        return next(error);
    }
};
exports.getBlogs = getBlogs;
const getBlogBySlug = async (req, res, next) => {
    try {
        const { slug } = req.params;
        const blog = await models_1.Blog.findOne({ slug, status: 'published' }).lean();
        if (!blog) {
            return responseHandler_1.responseHandler.notFound(res, 'Blog');
        }
        return responseHandler_1.responseHandler.success(res, blog, 'Blog retrieved successfully');
    }
    catch (error) {
        return next(error);
    }
};
exports.getBlogBySlug = getBlogBySlug;
const getEvents = async (req, res, next) => {
    try {
        const { status } = req.query;
        const filter = {};
        if (status)
            filter.status = status;
        const events = await models_1.Event.find(filter).sort({ startDate: 1 }).lean();
        return responseHandler_1.responseHandler.success(res, events, 'Events retrieved successfully');
    }
    catch (error) {
        return next(error);
    }
};
exports.getEvents = getEvents;
const getMenuCategories = async (_req, res, next) => {
    try {
        const categories = await models_1.MenuCategory.find({ isActive: true }).sort({ displayOrder: 1 }).lean();
        return responseHandler_1.responseHandler.success(res, categories, 'Menu categories retrieved successfully');
    }
    catch (error) {
        return next(error);
    }
};
exports.getMenuCategories = getMenuCategories;
const getMenuItems = async (req, res, next) => {
    try {
        const { categoryId, isAvailable } = req.query;
        const filter = { status: 'active' };
        if (categoryId)
            filter.category = categoryId;
        if (isAvailable !== undefined)
            filter.isAvailable = isAvailable === 'true';
        const items = await models_1.MenuItem.find(filter).populate('category', 'name slug').lean();
        return responseHandler_1.responseHandler.success(res, items, 'Menu items retrieved successfully');
    }
    catch (error) {
        return next(error);
    }
};
exports.getMenuItems = getMenuItems;
const getGallery = async (req, res, next) => {
    try {
        const { category, isVisible } = req.query;
        const filter = { status: 'active' };
        if (category)
            filter.category = category;
        if (isVisible !== undefined)
            filter.isVisible = isVisible === 'true';
        const images = await models_1.GalleryImage.find(filter).sort({ displayOrder: 1 }).lean();
        return responseHandler_1.responseHandler.success(res, images, 'Gallery retrieved successfully');
    }
    catch (error) {
        return next(error);
    }
};
exports.getGallery = getGallery;
const getTestimonials = async (req, res, next) => {
    try {
        const { featured, isVisible } = req.query;
        const filter = {};
        if (featured !== undefined)
            filter.featured = featured === 'true';
        if (isVisible !== undefined)
            filter.isVisible = isVisible === 'true';
        const testimonials = await models_1.Testimonial.find(filter).sort({ featured: -1 }).lean();
        return responseHandler_1.responseHandler.success(res, testimonials, 'Testimonials retrieved successfully');
    }
    catch (error) {
        return next(error);
    }
};
exports.getTestimonials = getTestimonials;
//# sourceMappingURL=cms.controller.js.map