const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    description: String,
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true,
    },
    discountValue: {
      type: Number,
      required: true,
    },
    minBookingAmount: {
      type: Number,
      default: 0,
    },
    maxDiscountAmount: {
      type: Number,
    },
    validFrom: {
      type: Date,
      required: true,
    },
    validTo: {
      type: Date,
      required: true,
    },
    usageLimit: {
      type: Number,
      default: null,
    },
    usageCount: {
      type: Number,
      default: 0,
    },
    perUserLimit: {
      type: Number,
      default: 1,
    },
    applicableRoomTypes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "RoomType",
      },
    ],
    status: {
      type: String,
      enum: ["active", "inactive", "expired"],
      default: "active",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: Date,
  },
  {
    timestamps: true,
  },
);

// Indexes
couponSchema.index({ code: 1 });
couponSchema.index({ status: 1, validTo: 1 });
couponSchema.index({ validFrom: 1, validTo: 1 });

// Pre-save hook to update status based on dates
couponSchema.pre("save", function (next) {
  const now = new Date();
  if (this.validTo < now) {
    this.status = "expired";
  }
  next();
});

module.exports =
  mongoose.models.Coupon || mongoose.model("Coupon", couponSchema);
