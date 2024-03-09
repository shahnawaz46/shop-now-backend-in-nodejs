import slugify from 'slugify';
import path from 'path';
import fs from 'fs';

// internal
import { Product } from '../model/product.model.js';
import { Category } from '../model/category.model.js';

export const addProduct = async (req, res) => {
  const {
    productName,
    actualPrice,
    sellingPrice,
    description,
    stocks,
    categoryId,
  } = req.body;
  let productPictures = req.files;

  if (productPictures.length > 0) {
    productPictures = req.files.map((image) => {
      return {
        img: image.filename,
      };
    });
  } else {
    return res
      .status(404)
      .json({ error: 'Image not Found Please Select Images' });
  }

  try {
    const product = new Product({
      productName,
      slug: slugify(productName),
      actualPrice,
      sellingPrice,
      description,
      stocks,
      productPictures,
      categoryId,
      createdBy: { AdminId: req.data._id },
    });

    await product.save((error, product) => {
      if (error) {
        return res
          .status(400)
          .json({ error: 'Product Already Exist Please Use Another Name' });
      }
      if (product) {
        return res.status(200).json({ message: 'Product Added Successfully' });
      }
    });
  } catch (err) {
    return res
      .status(400)
      .json({ error: 'Something Gone Wrong Please Try Again' });
  }
};

// for admin
export const showProducts = async (req, res) => {
  try {
    const allProducts = await Product.find({})
      .select(
        '_id productName actualPrice sellingPrice stocks categoryId description productPictures'
      )
      .populate({ path: 'categoryId', select: '_id categoryName' });
    if (allProducts) {
      return res.status(200).json({ allProducts: allProducts });
    }
    return res
      .status(404)
      .json({ error: 'Products not found please try again' });
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

export const getAllProductBySlug = async (req, res) => {
  const { slug } = req.params;

  try {
    const selectedCategory = await Category.findOne({ slug: slug });
    if (selectedCategory) {
      // this condition will run when user select sub Category like (top wears, bottom wears, etc)
      if (selectedCategory.parentCategoryId) {
        const products = await Product.find({
          categoryId: selectedCategory._id,
        });

        if (products) {
          return res.status(200).json({ products });
        }
        return res.status(404).json({ error: 'product not found' });
      }

      // this condition will run when user select Men's Wardrobe or Women's Wardrobe
      else {
        //  here i am getting list of sub categories
        const allSubCategory = await Category.find({
          parentCategoryId: selectedCategory._id,
        }).select('_id categoryName slug');
        let allProduct = [];
        for (let cat of allSubCategory) {
          const products = await Product.find({
            categoryId: cat._id,
          });

          if (products) {
            allProduct.push(...products);
          }
        }
        if (allProduct) {
          return res
            .status(200)
            .json({ products: allProduct, subCategory: allSubCategory });
        }
        return res.status(404).json({ error: 'product not found' });
      }
    }
    return res.status(404).json({ error: 'product not found' });
  } catch (error) {
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

export const getFeaturedProducts = async (req, res) => {
  try {
    const allProducts = await Product.find({}).populate('categoryId');
    if (allProducts) {
      const featuredProducts = allProducts.filter(
        (product) =>
          product.reviews.reduce((total, value) => value.rating + total, 0) > 2
      );
      return res.status(200).json({ product: featuredProducts });
    }
    return res.status(400).json({ error: 'product not found' });
  } catch (error) {
    return res
      .status(400)
      .json({ error: 'Something Gone Wrong Please Try Again' });
  }
};

export const writeProductReview = async (req, res) => {
  const { product_id, message, rating, date } = req.body;
  try {
    const product = await Product.findOne({ _id: product_id });
    if (product) {
      const reviewIsAlready = product.reviews.find(
        (value) => value.userId == req.data._id
      );
      if (reviewIsAlready) {
        await Product.findOneAndUpdate(
          { _id: product_id, 'reviews.userId': req.data._id },
          {
            $set: {
              'reviews.$.message': message,
              'reviews.$.rating': rating,
              'reviews.$.update_date': date,
            },
          }
        );
        return res.status(200).json({ message: 'Review Edit Successfully' });
      } else {
        await Product.findOneAndUpdate(
          { _id: product_id },
          {
            $push: {
              reviews: {
                userId: req.data._id,
                rating,
                message,
                create_date: date,
                update_date: date,
              },
            },
          }
        );
        return res.status(200).json({ message: 'Review Add Successfully' });
      }
    }
    return res.status(400).json({ error: 'No Product Found' });
  } catch (err) {
    return res
      .status(400)
      .json({ error: 'Something Gone Wrong Please Try Again' });
  }
};

export const topRatingProducts = async (req, res) => {
  try {
    // Finding top 20 products that have highest rating by using aggregate pipeline.
    const products = await Product.aggregate([
      {
        $unwind: '$reviews', // Split the array of reviews into separate documents.
      },
      {
        // The $group stage takes a collection of documents and groups them based on a specified field or fields. This means it gathers together all documents that share the same value(s) in the specified field(s).
        $group: {
          _id: '$_id',
          productPictures: { $first: '$productPictures' },
          averageRating: {
            $avg: '$reviews.rating',
          },
        },
      },
      {
        $sort: { averageRating: -1 },
      },
      {
        $limit: 20,
      },
      {
        // $project is used for Reshapes a document stream by renaming, adding, or removing fields
        // $project stage is used for return only the fields you need in the result.
        $project: {
          _id: 1,
          productPicture: {
            $arrayElemAt: ['$productPictures', 0], // Extract the first image from the productPictures array and also renaming the field from productPictures to productPicture.
          },
          averageRating: 1,
        },
      },
    ]);
    return res.status(200).json({ products });
  } catch (err) {
    console.log(err);
    return res
      .status(400)
      .json({ error: 'Something Went Wrong Please Try Again' });
  }
};
