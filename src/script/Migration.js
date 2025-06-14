import { userInfo } from "os";
import imageKit from "../config/imagekit.config.js";
import { Banner } from "../model/banner.model.js";
import { Order } from "../model/order.model.js";
import { Product, sizeDescription } from "../model/product.model.js";
import { User } from "../model/user.model.js";
import axios from "axios";

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

import { promises as fs } from "fs";

// Function to migrate images from Cloudinary to ImageKit
export const migrateProfilePicturesToImageKit = async () => {
  try {
    // Fetch all users with profile pictures
    await User.updateMany(
      {},
      { $rename: { "profilePicture.public_id": "profilePicture.fileId" } }
    );

    console.log("DONE");
  } catch (err) {
    console.log("migrateProfilePicturesToImageKit: ", err);
  }
};
