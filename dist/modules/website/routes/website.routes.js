"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const website_controller_1 = require("../controllers/website.controller");
const router = (0, express_1.Router)();
router.get('/settings', website_controller_1.getWebsiteSettings);
router.get('/theme', website_controller_1.getThemeSettings);
router.get('/homepage-sections', website_controller_1.getHomepageSections);
exports.default = router;
//# sourceMappingURL=website.routes.js.map