const mongoose = require("mongoose");

const websiteSettingSchema = new mongoose.Schema(
  {
    siteName: { type: String, default: 'Hotel Booking System' },
    siteUrl: String,
    logo: String,
    favicon: String,
    contactEmail: String,
    contactPhone: String,
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String
    },
    socialMedia: {
      facebook: String,
      twitter: String,
      instagram: String,
      linkedin: String,
      youtube: String
    },
    seo: {
      metaTitle: String,
      metaDescription: String,
      metaKeywords: [String],
      ogImage: String
    },
    analytics: {
      googleAnalyticsId: String,
      facebookPixelId: String
    }
  },
  { timestamps: true }
);

module.exports = mongoose.models.WebsiteSetting || mongoose.model("WebsiteSetting", websiteSettingSchema);
