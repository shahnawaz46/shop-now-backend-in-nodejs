import mongoose from 'mongoose';

const bannerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    show: {
      type: Boolean,
      required: true,
      default: true,
    },
    screen: {
      type: String,
      required: true,
      enum: ['computer', 'mobile'],
    },
    image: {
      URL: { type: String, required: true },
      public_id: { type: String, required: true },
    },
  },
  { timestamps: true }
);

export const Banner = mongoose.model('Banner', bannerSchema);
