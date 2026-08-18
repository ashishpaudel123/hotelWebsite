const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, unique: true, required: true, lowercase: true },
    excerpt: String,
    content: { type: String, required: true },
    featuredImage: String,
    images: [String],
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    category: String,
    tags: [String],
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft'
    },
    publishedAt: Date,
    views: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    seo: {
      metaTitle: String,
      metaDescription: String,
      metaKeywords: [String]
    }
  },
  { timestamps: true }
);

module.exports = mongoose.models.Blog || mongoose.model("Blog", blogSchema);
