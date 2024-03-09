import mongoose from 'mongoose';

const trendingProdutSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'products',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: true,
    },
    eventType: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const TrendingProduct = mongoose.model(
  'TrendingProduct',
  trendingProdutSchema
);
