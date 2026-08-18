const mongoose = require("mongoose");

const homepageSectionSchema = new mongoose.Schema(
  {
    sectionType: {
      type: String,
      required: true,
      enum: ['hero', 'featured-rooms', 'about', 'services', 'testimonials', 'gallery', 'cta', 'blog', 'events', 'custom']
    },
    title: String,
    subtitle: String,
    content: String,
    backgroundImage: String,
    images: [String],
    button: {
      text: String,
      link: String
    },
    items: [{
      title: String,
      description: String,
      icon: String,
      image: String,
      link: String
    }],
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    settings: mongoose.Schema.Types.Mixed
  },
  { timestamps: true }
);

module.exports = mongoose.models.HomepageSection || mongoose.model("HomepageSection", homepageSectionSchema);
