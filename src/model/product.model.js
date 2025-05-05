import mongoose from 'mongoose';

export const sizeDescription = new Map([
  [
    'XS',
    'Your body measurements for Extra Small are Bust: 32 in, Waist: 24 in, Hip: 34 in',
  ],
  [
    'S',
    'Your body measurements for Small are Bust: 33-34 in, Waist: 25-26 in, Hip: 35-36 in',
  ],
  [
    'M',
    'Your body measurements for Medium are Bust: 35-36 in, Waist: 27-28 in, Hip: 37-38 in',
  ],
  [
    'L',
    'Your body measurements for Large are Bust: 37-38 in, Waist: 29-30 in, Hip: 39-40 in',
  ],
  [
    'XL',
    'Your body measurements for Extra Large are Bust: 40-41 in, Waist: 32-33 in, Hip: 42-43 in',
  ],
]);

const sizeKeys = Array.from(sizeDescription.keys());

const productSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    actualPrice: {
      type: Number,
      required: true,
    },
    sellingPrice: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    stocks: {
      type: Number,
      required: true,
      min: 0,
    },
    totalSales: {
      type: Number,
      default: 0,
    },
    size: {
      type: [String],
      required: true,
      enum: sizeKeys,
    },
    offer: {
      type: Number,
    },
    productPictures: [
      {
        img: { type: String, required: true },
        public_id: { type: String, required: true },
      },
    ],
    targetAudience: {
      type: String,
      required: true,
      enum: ['Men', 'Women', 'Kids'],
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    reviews: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        rating: Number,
        message: String,
        create_date: Date,
        update_date: Date,
      },
    ],
    createdBy: {
      AdminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: true,
      },
    },
  },
  { timestamps: true }
);

export const Product = mongoose.model('Product', productSchema);
