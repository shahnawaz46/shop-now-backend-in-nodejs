import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
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
  },
  offer: {
    type: Number,
  },
  productPictures: [
    {
      img: { type: String, required: true },
    },
  ],
  targetAudience: {
    type: String,
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
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  createdBy: {
    AdminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: true,
    },
  },
  updatedAt: Date,
});

export const Product = mongoose.model('Product', productSchema);
