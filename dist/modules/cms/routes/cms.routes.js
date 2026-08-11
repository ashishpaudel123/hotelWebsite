"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cms_controller_1 = require("../controllers/cms.controller");
const router = (0, express_1.Router)();
router.get('/blogs', cms_controller_1.getBlogs);
router.get('/blogs/slug/:slug', cms_controller_1.getBlogBySlug);
router.get('/events', cms_controller_1.getEvents);
router.get('/menu-categories', cms_controller_1.getMenuCategories);
router.get('/menu-items', cms_controller_1.getMenuItems);
router.get('/gallery', cms_controller_1.getGallery);
router.get('/testimonials', cms_controller_1.getTestimonials);
exports.default = router;
//# sourceMappingURL=cms.routes.js.map