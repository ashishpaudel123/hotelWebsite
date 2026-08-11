import { Request, Response, NextFunction } from 'express';
import { responseHandler } from '../../../utils/responseHandler';
import { WebsiteSettings, HomepageSection } from '../../../models';

export const getWebsiteSettings = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    let settings = await WebsiteSettings.findOne().lean();
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
      } as any;
    }
    return responseHandler.success(res, settings, 'Settings retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

export const getThemeSettings = async (_req: Request, res: Response, next: NextFunction) => {
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
    return responseHandler.success(res, theme, 'Theme retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

export const getHomepageSections = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, isVisible } = req.query;
    const filter: any = {};
    if (status) filter.status = status;
    if (isVisible !== undefined) filter.isVisible = isVisible === 'true';

    const sections = await HomepageSection.find(filter).sort({ displayOrder: 1 }).lean();
    return responseHandler.success(res, sections, 'Homepage sections retrieved successfully');
  } catch (error) {
    return next(error);
  }
};
