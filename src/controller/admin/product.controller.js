// internal
import { Product } from '../../model/product.model.js';

export const deleteAllReviews = async () => {
  try {
    // Update all product documents to set the 'reviews' array to an empty array
    const result = await Product.updateMany({}, { $set: { reviews: [] } });

    console.log(`Product reviews deleted.`);
  } catch (error) {
    console.error('Error deleting reviews:', error);
  }
};
