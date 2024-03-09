import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    categoryName: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    parentCategoryId: {
      type: String,
    },
  },
  { timestamps: true }
);

export const Category = mongoose.model('Category', categorySchema);
