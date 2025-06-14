import slugify from "slugify";

// internal
import { Product } from "../../model/product.model.js";
import { Order } from "../../model/order.model.js";
import { LIMIT } from "../../utils/Constant.js";
import { generateURL } from "../../utils/GenerateURL.js";
import sendMail from "../../services/mail.service.js";
import { errorTemplate } from "../../template/ErrorMailTemplate.js";
import {
  uploadMediaOnImageKit,
  deleteBulkMediaOnImageKit,
} from "../../services/imageKit.service.js";

export const addProduct = async (req, res) => {
  const {
    productName,
    actualPrice,
    sellingPrice,
    description,
    stocks,
    targetAudience,
    categoryId,
  } = req.body;

  // if no images uploaded by user then throw error
  if (!req.files || req.files.length === 0) {
    return res
      .status(404)
      .json({ error: "Image not Found Please Select Images" });
  }

  const productPictures = [];
  for (const file of req.files) {
    const result = await uploadMediaOnImageKit({
      file: file.buffer,
      fileName: file.originalname,
      folder: "/ShopNow_Products",
      tags: ["product", "shopnow", "cloths", "men", "women"],
      transformation: { pre: "quality: 80" },
      checks: `"file.size" < "1mb"`,
    });

    productPictures.push({
      img: result?.url,
      fileId: result.fileId,
    });
  }

  try {
    const newProduct = await Product.create({
      productName,
      slug: slugify(productName),
      actualPrice,
      sellingPrice,
      description,
      stocks,
      targetAudience,
      productPictures,
      categoryId,
      createdBy: { AdminId: req.data._id },
    });

    const product = await Product.findById(newProduct._id)
      .select(
        "_id productName actualPrice sellingPrice stocks categoryId targetAudience description productPictures totalSales"
      )
      .populate({ path: "categoryId", select: "_id categoryName" });

    // after product is added here i am again calculating productData details
    const productData = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalStocks: { $sum: "$stocks" },
          totalProducts: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          totalStocks: 1,
          totalProducts: 1,
        },
      },
    ]);

    return res.status(200).json({
      message: "Product Added Successfully",
      product,
      productData: productData?.[0] || {},
    });
  } catch (error) {
    // send error to email
    if (process.env.NODE_ENV === "production") {
      sendMail(
        process.env.ADMIN_EMAIL,
        "(Admin Panel) Error in Add Product",
        errorTemplate(generateURL(req, "", true), error.message)
      );
    } else {
      console.log(error);
    }

    return res.status(500).json({
      error:
        "Oops! Something went wrong. We're working to fix it. Please try again shortly.",
    });
  }
};

// getting all products along with the other details like total sales, total stock, total revenue etc
export const getAllProducts = async (req, res) => {
  const { page = 1 } = req.query;
  try {
    const allProducts = await Product.find({})
      .select(
        "_id productName actualPrice sellingPrice stocks categoryId targetAudience description productPictures totalSales"
      )
      .populate({ path: "categoryId", select: "_id categoryName" })
      .sort({ createdAt: -1 })
      .skip((page - 1) * LIMIT)
      .limit(LIMIT);

    // generate next url for pagination
    const nextURL = generateURL(req, `page=${parseInt(page) + 1}`, true);

    return res.status(200).json({
      next: allProducts.length < LIMIT ? null : nextURL,
      products: allProducts,
    });
  } catch (error) {
    // send error to email
    if (process.env.NODE_ENV === "production") {
      sendMail(
        process.env.ADMIN_EMAIL,
        "(Admin Panel) Error in Get All Products",
        errorTemplate(generateURL(req, "", true), error.message)
      );
    } else {
      console.log(error);
    }

    return res.status(500).json({
      error:
        "Oops! Something went wrong. We're working to fix it. Please try again shortly.",
    });
  }
};

export const productSalesDetails = async (req, res) => {
  try {
    // first calculating total stocks, total products and category distribution
    const productData = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalStocks: { $sum: "$stocks" },
          totalProducts: { $sum: 1 },
        },
      },
    ]);

    // 2nd calculating totalSellings and totalRevenue
    const orderData = await Order.aggregate([
      {
        $match: { status: "delivered" }, // match orders with 'delivered' status
      },
      {
        $group: {
          _id: null,
          totalSellings: { $sum: 1 }, // sum total order(status delivered) of all order
          totalRevenue: { $sum: "$totalPrice" }, // sum total price of all order
        },
      },
      {
        // $project is used for Reshapes a document stream by renaming, adding, or removing fields
        // $project stage is used for return only the fields you need in the result.
        // 1 means add and 0 means remove fields
        $project: {
          _id: 0,
          totalSellings: 1,
          totalRevenue: 1,
        },
      },
    ]);

    const productSales = {
      totalProducts: productData?.[0]?.totalProducts || 0,
      totalStocks: productData?.[0]?.totalStocks || 0,
      totalRevenue: orderData[0]?.totalRevenue || 0,
      totalSellings: orderData[0]?.totalSellings || 0,
    };

    return res.status(200).json({ ...productSales });
  } catch (error) {
    // send error to email
    if (process.env.NODE_ENV === "production") {
      sendMail(
        process.env.ADMIN_EMAIL,
        "(Admin Panel) Error in Get Product Sales Details",
        errorTemplate(generateURL(req, "", true), error.message)
      );
    } else {
      console.log(error);
    }

    return res.status(500).json({
      error:
        "Oops! Something went wrong. We're working to fix it. Please try again shortly.",
    });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    // first find product so i can get productPictures fileId
    const deletedProduct = await Product.findOne({ _id: req.body.productId });

    if (!deleteProduct) {
      return res
        .status(404)
        .json({ error: "Product not found please check again" });
    }

    // return console.log("deletedProduct:", deletedProduct);

    // then i am deleting productPictures from ImageKit
    const productImages = deletedProduct.productPictures;
    if (productImages && productImages.length > 0) {
      const fileIds = productImages.map((img) => img.fileId);
      await deleteBulkMediaOnImageKit(fileIds);
    }

    // finally i am deleting product from mongodb
    await Product.findByIdAndDelete({
      _id: deletedProduct._id,
    });

    // after product is deleted here i am again calculating productData details
    const productData = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalStocks: { $sum: "$stocks" },
          totalProducts: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          totalStocks: 1,
          totalProducts: 1,
        },
      },
    ]);

    return res.status(200).json({
      message: "Product Deleted Successfully",
      productData: productData?.[0] || {},
    });
  } catch (error) {
    // send error to email
    if (process.env.NODE_ENV === "production") {
      sendMail(
        process.env.ADMIN_EMAIL,
        "(Admin Panel) Error in Delete Product",
        errorTemplate(generateURL(req, "", true), error.message)
      );
    } else {
      console.log(error);
    }

    return res.status(500).json({
      error:
        "Oops! Something went wrong. We're working to fix it. Please try again shortly.",
    });
  }
};

export const editProduct = async (req, res) => {
  let { _id, ...rest } = req.body;

  // if images edited by user then removing previous image and uploading new image
  if (req.files && req.files.length > 0) {
    const product = await Product.findById(_id);

    // first removing previous productPictures from ImageKit
    const productImages = product.productPictures;
    if (productImages && productImages.length > 0) {
      const fileIds = productImages.map((img) => img.fileId);
      await deleteBulkMediaOnImageKit(fileIds);
    }

    // then uploading new product pictures
    const productPictures = [];
    for (const file of req.files) {
      const result = await uploadMediaOnImageKit({
        file: file.buffer,
        fileName: file.originalname,
        folder: "/ShopNow_Products",
        tags: ["product", "shopnow", "cloths", "men", "women"],
        transformation: { pre: "quality: 80" },
        checks: `"file.size" < "1mb"`,
      });

      productPictures.push({
        img: result?.url,
        fileId: result.fileId,
      });
    }

    // then updating state for upload in mongodb
    rest = { ...rest, productPictures: productPictures };
  }

  // if user update productName then here i am also updating slug of that product
  if (rest?.productName) {
    rest = { ...rest, slug: slugify(rest?.productName) };
  }

  try {
    // finally updting mongodb
    const product = await Product.findByIdAndUpdate({ _id }, rest, {
      new: true,
    })
      .select(
        "_id productName actualPrice sellingPrice stocks categoryId targetAudience description productPictures totalSales"
      )
      .populate({ path: "categoryId", select: "_id categoryName" });

    // if both stock and target audience are not present in the payload/req then there is no need to calculate productData
    if (!rest?.stocks && !rest?.targetAudience) {
      return res.status(200).json({
        message: "Product Edit Successfully",
        product,
      });
    }

    // after product is edited i am again calculating productData details
    const productData = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalStocks: { $sum: "$stocks" },
          totalProducts: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          totalStocks: 1,
          totalProducts: 1,
        },
      },
    ]);

    return res.status(200).json({
      message: "Product Edit Successfully",
      product,
      productData: productData?.[0] || {},
    });
  } catch (error) {
    // send error to email
    if (process.env.NODE_ENV === "production") {
      sendMail(
        process.env.ADMIN_EMAIL,
        "(Admin Panel) Error in Edit/update Product",
        errorTemplate(generateURL(req, "", true), error.message)
      );
    } else {
      console.log(error);
    }

    return res.status(500).json({
      error:
        "Oops! Something went wrong. We're working to fix it. Please try again shortly.",
    });
  }
};

export const getSingleProductById = async (req, res) => {
  const { productId } = req.params;
  try {
    const product = await Product.findOne({
      _id: productId,
    }).populate("reviews.userId", "firstName lastName profilePicture");
    if (product) {
      return res.status(200).json({ product });
    }
    return res.status(404).json({ error: "product not found" });
  } catch (error) {
    // send error to email
    if (process.env.NODE_ENV === "production") {
      sendMail(
        process.env.ADMIN_EMAIL,
        "(Admin Panel) Error in Get Single Product By Id",
        errorTemplate(generateURL(req, "", true), error.message)
      );
    } else {
      console.log(error);
    }

    return res.status(500).json({
      error:
        "Oops! Something went wrong. We're working to fix it. Please try again shortly.",
    });
  }
};

export const searchProducts = async (req, res) => {
  const { query, page = 1 } = req.query;

  try {
    // 'i': This option makes the regex search case-insensitive ex: PANT, Pant, pant
    const products = await Product.find({
      $or: [{ productName: { $regex: query, $options: "i" } }],
    })
      .select(
        "_id productName actualPrice sellingPrice stocks categoryId targetAudience description productPictures"
      )
      .populate("categoryId", "_id categoryName")
      .skip((page - 1) * LIMIT)
      .limit(LIMIT);

    const nextURL = generateURL(req, `query=${query}&page=${page + 1}`, true);

    return res
      .status(200)
      .json({ next: products.length < LIMIT ? null : nextURL, products });
  } catch (error) {
    // send error to email
    if (process.env.NODE_ENV === "production") {
      sendMail(
        process.env.ADMIN_EMAIL,
        "(Admin Panel) Error in Search Products",
        errorTemplate(generateURL(req, "", true), error.message)
      );
    } else {
      console.log(error);
    }

    return res.status(500).json({
      error:
        "Oops! Something went wrong. We're working to fix it. Please try again shortly.",
    });
  }
};
