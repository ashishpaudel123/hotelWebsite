"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHomepageSections = exports.getThemeSettings = exports.getWebsiteSettings = void 0;
const responseHandler_1 = require("../../../utils/responseHandler");
const models_1 = require("../../../models");
const getWebsiteSettings = async (_req, res, next) => {
    try {
        let settings = await models_1.WebsiteSettings.findOne().lean();
        if (!settings) {
            settings = {
                _id: '',
                siteName: 'Luxury Hotel',
                tagline: 'Experience luxury and comfort',
                logo: '',
                contactInfo: { address: '', phone: '', email: '', businessHours: '9:00 AM - 5:00 PM' },
                socialMedia: {},
                currency: 'USD',
                timezone: 'UTC',
                language: 'en',
                maintenanceMode: false,
                updatedAt: new Date(),
                createdAt: new Date(),
            };
        }
        return responseHandler_1.responseHandler.success(res, settings, 'Settings retrieved successfully');
    }
    catch (error) {
        return next(error);
    }
};
exports.getWebsiteSettings = getWebsiteSettings;
const getThemeSettings = async (_req, res, next) => {
    try {
        const theme = {
            primaryColor: '222.2 47.4% 11.2%',
            secondaryColor: '210 40% 96.1%',
            accentColor: '210 40% 96.1%',
            fontFamilyHeading: 'Playfair Display',
            fontFamilyBody: 'Inter',
            layoutWidth: 'wide',
            headerStyle: 'default',
            footerStyle: 'default',
            showScrollToTop: true,
            animationEnabled: true,
            darkModeDefault: false,
        };
        return responseHandler_1.responseHandler.success(res, theme, 'Theme retrieved successfully');
    }
    catch (error) {
        return next(error);
    }
};
exports.getThemeSettings = getThemeSettings;
const getHomepageSections = async (req, res, next) => {
    try {
        const { status, isVisible } = req.query;
        const filter = {};
        if (status)
            filter.status = status;
        if (isVisible !== undefined)
            filter.isVisible = isVisible === 'true';
        const sections = await models_1.HomepageSection.find(filter).sort({ displayOrder: 1 }).lean();
        return responseHandler_1.responseHandler.success(res, sections, 'Homepage sections retrieved successfully');
    }
    catch (error) {
        return next(error);
    }
};
exports.getHomepageSections = getHomepageSections;
//# sourceMappingURL=website.controller.js.map