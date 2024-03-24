import { Order } from '../model/order.model.js';
import { Product } from '../model/product.model.js';

export const migration = async () => {
  // await Order.updateMany({}, { $set: { status: 'order confirmed' } });
  //   await Product.updateMany({}, { $set: { reviews: [] } });
  console.log('migration done');
};
