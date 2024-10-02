import { Order } from '../model/order.model.js';
import { Product } from '../model/product.model.js';

export const migration = async () => {
  // await Order.updateMany({}, { $set: { deliveredDate: null } });
  // await Order.updateMany(
  //   {},
  //   { $set: { paymentMethod: 'cod', paymentStatus: 'pending' } }
  // );
  // await Product.updateMany({}, { $set: { totalSales: 0 } });
  console.log('migration done');
};

export const updateFields = async () => {
  //  await Order.updateMany({}, { $set: { status: 'order confirmed' } });
  //   await Product.updateMany({}, { $set: { reviews: [] } });
  console.log('field updated');
};

export const updateOrderSales = async () => {
  // try {
  //   const order = await Order.find({}).select('items');
  //   order.forEach(async (order) => {
  //     order.items.forEach(async (product) => {
  //       await Product.findByIdAndUpdate(product.product, {
  //         $inc: { totalSales: 1 },
  //       });
  //     });
  //   });
  // } catch (err) {
  //   console.log(err);
  // }
};

export const updatePublicIdToEachProductIamges = async () => {
  // update public_id to each product images
  // try {
  //   // Fetch all products
  //   const products = await Product.find();
  //   for (const product of products) {
  //     product.productPictures.forEach((image, index) => {
  //       const publicId = getPublicIdFromUrl(image.img);
  //       if (publicId) {
  //         product.productPictures[index].public_id = publicId;
  //       }
  //     });
  //     await product.save();
  //     console.log(`Updated product ${product._id}`);
  //   }
  // } catch (error) {
  //   console.error('Error updating products:', error);
  // }
};

const getPublicIdFromUrl = (url) => {
  const regex = /\/([^\/]+)\/([^\/]+)\.(jpg|jpeg|png|gif|webp|bmp|svg|avif)$/; // Adjust extensions as needed
  const match = url.match(regex);
  return match ? `${match[1]}/${match[2]}` : null; // match[2] contains the public_id
};
