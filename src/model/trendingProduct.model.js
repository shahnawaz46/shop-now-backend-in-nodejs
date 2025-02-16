import mongoose from 'mongoose';

const trendingProdutSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    eventType: {
      type: String,
      required: true,
      enum: ['visit', 'buy'],
    },
  },
  { timestamps: true }
);

export const TrendingProduct = mongoose.model(
  'TrendingProduct',
  trendingProdutSchema
);
