import slugify from 'slugify';
import path from 'path';
import fs from 'fs';

// internal
import { Product } from '../../model/product.model.js';
import { Category } from '../../model/category.model.js';
import { uploadProductPictures } from '../../utils/Cloudinary.js';

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
  if (req.files.length === 0) {
    return res
      .status(404)
      .json({ error: 'Image not Found Please Select Images' });
  }

  const productPictures = [];
  for (const file of req.files) {
    const result = await uploadProductPictures(file.path);
    productPictures.push({ img: result });
  }

  try {
    const product = await Product.create({
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

    return res.status(200).json({ message: 'Product Added Successfully' });
  } catch (err) {
    console.log(err);
    return res
      .status(400)
      .json({ error: 'Something Gone Wrong Please Try Again' });
  }
};

// for admin
export const getAllProducts = async (req, res) => {
  try {
    const allProducts = await Product.find({})
      .select(
        '_id productName actualPrice sellingPrice stocks categoryId description productPictures'
      )
      .populate({ path: 'categoryId', select: '_id categoryName' });

    return res.status(200).json({ allProducts });
  } catch (err) {
    return res
      .status(400)
      .json({ error: 'Something Gone Wrong Please Try Again' });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete({
      _id: req.body.productId,
    });
    deletedProduct.productPictures.forEach((image) => {
      fs.unlinkSync(
        path.join(
          __dirname + '../../../' + '/public/productImages' + `/${image.img}`
        )
      );
    });
    return res.status(200).json({ message: 'Product Deleted Successfully' });
  } catch (error) {
    return res
      .status(400)
      .json({ error: 'Something Gone Wrong Please Try Again' });
  }
};

export const editProduct = async (req, res) => {
  const {
    _id,
    productName,
    actualPrice,
    sellingPrice,
    description,
    stocks,
    productPictures,
    categoryId,
  } = req.body;
  try {
    const product = {
      productName,
      slug: slugify(productName),
      actualPrice,
      sellingPrice,
      description,
      stocks,
      productPictures,
      categoryId,
      createdBy: { AdminId: req.data._id },
    };
    await Product.findByIdAndUpdate({ _id }, product);
    return res.status(200).json({ message: 'Product Edit Successfully' });
  } catch (err) {
    return res
      .status(400)
      .json({ error: 'Something Gone Wrong Please Try Again' });
  }
};

export const getSingleProductById = async (req, res) => {
  const { productId } = req.params;
  try {
    const product = await Product.findOne({
      _id: productId,
    }).populate('reviews.userId', 'firstName lastName profilePicture');
    if (product) {
      return res.status(200).json({ product });
    }
    return res.status(404).json({ error: 'product not found' });
  } catch (error) {
    return res
      .status(400)
      .json({ error: 'Something Gone Wrong Please Try Again' });
  }
};
