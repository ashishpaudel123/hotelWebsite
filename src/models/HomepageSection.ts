import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IHomepageSection extends Document {
  _id: Types.ObjectId;
  sectionKey: string;
  title?: string;
  subtitle?: string;
  content?: string;
  media: string[];
  isVisible: boolean;
  displayOrder: number;
  backgroundColor?: string;
  textColor?: string;
  customClasses?: string;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

const homepageSectionSchema = new Schema<IHomepageSection>({
  sectionKey: { type: String, required: true, trim: true },
  title: { type: String, trim: true },
  subtitle: { type: String, trim: true },
  content: { type: String },
  media: [{ type: String }],
  isVisible: { type: Boolean, default: true },
  displayOrder: { type: Number, default: 0 },
  backgroundColor: { type: String },
  textColor: { type: String },
  customClasses: { type: String },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
}, { timestamps: true });

homepageSectionSchema.index({ sectionKey: 1 });
homepageSectionSchema.index({ status: 1, isVisible: 1 });

export const HomepageSection = mongoose.model<IHomepageSection>('HomepageSection', homepageSectionSchema);
