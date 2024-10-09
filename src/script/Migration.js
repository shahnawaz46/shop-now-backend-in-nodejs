import { Order } from '../model/order.model.js';
import { Product } from '../model/product.model.js';
import { User } from '../model/user.model.js';

export const migration = async () => {
  // await Order.updateMany({}, { $set: { deliveredDate: null } });
  // await Order.updateMany(
  //   {},
  //   { $set: { paymentMethod: 'cod', paymentStatus: 'pending' } }
  // );
  // await Order.updateMany({}, { $set: { status: 'order confirmed' } });
  // await Product.updateMany({}, { $set: { totalSales: 0 } });
  // await Product.updateMany({}, { $set: { reviews: [] } });
  // await User.updateMany({}, { $set: { dob: '2000-09-22' } });
  console.log('migration done');
};

export const updateUserDetails = async () => {
  // const dobList = [
  //   '2000-10-24',
  //   '1981-01-09',
  //   '1999-11-28',
  //   '2002-03-18',
  //   '2001-09-01',
  //   '1992-12-02',
  //   '2000-05-22',
  //   '2005-01-19',
  //   '2004-05-29',
  //   '2007-01-19',
  // ];
  // const users = await User.find({});
  // users.forEach(async (user, index) => {
  //   const userUpdate = await User.findById(user._id);
  //   userUpdate.dob = dobList[index];
  //   await userUpdate.save();
  //   console.log(`${userUpdate.email} updated`);
  // });
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
