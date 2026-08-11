import { Router } from 'express';
import { getWebsiteSettings, getThemeSettings, getHomepageSections } from '../controllers/website.controller';

const router = Router();

router.get('/settings', getWebsiteSettings);
router.get('/theme', getThemeSettings);
router.get('/homepage-sections', getHomepageSections);

export default router;
