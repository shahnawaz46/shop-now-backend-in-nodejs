import { Order } from "../model/order.model.js";
import { Product, sizeDescription } from "../model/product.model.js";
import { User } from "../model/user.model.js";

export const migration = async () => {
  try {
    // await Order.updateMany({}, { $set: { deliveredDate: null } });
    // await Order.updateMany(
    //   {},
    //   { $set: { paymentMethod: 'cod', paymentStatus: 'pending' } }
    // );
    // await Order.updateMany({}, { $set: { status: 'order confirmed' } });
    // await Product.updateMany({}, { $set: { totalSales: 0 } });
    // await Product.updateMany({}, { $set: { reviews: [] } });
    // await User.updateMany({}, { $set: { dob: '2000-09-22' } });
    // await User.updateMany({}, { $set: { isEmailVerified: true } });
    // await User.updateMany(
    //   {},
    //   {
    //     $set: {
    //       lastLogin: {
    //         date: new Date().toISOString(),
    //         device: 'mobile',
    //         ipAddress: '123.00.1.2',
    //         location: 'Delhi, India',
    //         browser: 'chrome',
    //       },
    //     },
    //   }
    // );

    // By default, updateMany does not trigger Mongoose validation. To enforce validation,
    // use the runValidators: true option. This ensures that your enum and other schema rules are respected during updates.
    // await Product.updateMany(
    //   {},
    //   {
    //     $set: {
    //       size: sizeDescription.map((item) => item.size),
    //     },
    //   },
    //   { runValidators: true }
    // );
    console.log("migration done");
  } catch (err) {
    console.log("Migration Error: ", err);
  }
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
  console.log("field updated");
};

export const updateOrderModel = async () => {
  try {
    // const order = await Order.find({}).select('items');
    // order.forEach(async (order) => {
    //   order.items.forEach(async (product) => {
    //     await Product.findByIdAndUpdate(product.product, {
    //       $inc: { totalSales: 1 },
    //     });
    //   });
    // });

    // await Order.updateMany({}, { $rename: { status: 'orderStatus' } });

    // await Order.updateMany(
    //   { paymentMethod: 'card', paymentStatus: 'failed' },
    //   { orderStatus: 'failed' },
    //   { runValidators: true }
    // );
    console.log("Updated");
  } catch (err) {
    console.log(err);
  }
};

export const updatePublicId = async () => {
  // update public_id
  try {
    // Fetch all products
    const Users = await User.find();
    // for (const user of Users) {
    //   if (newOBJ[user._id]) {
    //     console.log("YES");
    //     user.profilePicture = newOBJ[user._id];
    //   } else {
    //     user.profilePicture = { URL: null, public_id: null };
    //   }
    //   await user.save();

    //   // console.log(`Updated product ${product._id}`);
    // }
    // console.log(newOBJ);
  } catch (error) {
    console.error("Error updating products:", error);
  }
};

const getPublicIdFromUrl = (url) => {
  const urlObj = new URL(url);
  const pathname = urlObj.pathname;

  const regex = /\/([^\/]+)\/([^\/]+)\.(jpg|jpeg|png|gif|webp|bmp|svg|avif)$/; // Adjust extensions as needed
  const match = pathname.match(regex);
  return match ? `${match[1]}/${match[2]}` : null;
};
