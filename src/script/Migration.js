import { Order } from '../model/order.model.js';
import { Product } from '../model/product.model.js';

export const migration = async () => {
  // await Order.updateMany({}, { $set: { deliveredDate: null } });
  // await Order.updateMany(
  //   {},
  //   { $set: { paymentMethod: 'cod', paymentStatus: 'pending' } }
  // );
  await Product.updateMany({}, { $set: { createdAt: null } });
  console.log('migration done');
};

export const updateFields = async () => {
  //  await Order.updateMany({}, { $set: { status: 'order confirmed' } });
  //   await Product.updateMany({}, { $set: { reviews: [] } });
  console.log('field updated');
};
