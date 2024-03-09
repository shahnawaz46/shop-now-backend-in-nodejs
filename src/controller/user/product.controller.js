// internal
import { Product } from '../../model/product.model.js';
import { Category } from '../../model/category.model.js';
import { TrendingProduct } from '../../model/trendingProduct.model.js';

// fetching all products based on targetAudience (Men, Women)
export const getAllProducts = async (req, res) => {
  // slug can be Men and Women
  const { slug } = req.params;
  try {
    const allProducts = await Product.find({
      targetAudience: slug,
    }).select('productName productPictures actualPrice sellingPrice');

    if (allProducts.length > 0) return res.status(200).json({ allProducts });
    return res.status(404).json({ error: 'product not found' });
  } catch (error) {
    return res
      .status(400)
      .json({ error: 'Something Gone Wrong Please Try Again' });
  }
};

// fetching filtered products (sub category products and price range)
export const getFilteredProducts = async (req, res) => {
  const { category, price, targetAudience } = req.query;
  console.log(category, price, targetAudience);
  try {
    if (price) {
      const [minPrice, maxPrice] = price.split('-');
      // if maxPrice is 2500(default value) that's means user only selected minPrice So, i am returning all the products that is greater than minPrice.
      // if maxPrice is not 2500(default value) then i am returning all the products that price is between minPrice and maxPrice
      const sellingPrice =
        maxPrice === 2500
          ? { $gte: minPrice }
          : {
              $gte: minPrice,
              $lte: maxPrice,
            };

      if (category) {
        // first i am fetching subCategory, because i need subCategory-Id for fetching products based on subCategory
        const subCategory = await Category.findOne({
          slug: category,
        });
        // here i am fetching products based on subCategory id and price
        const subCategoryProducts = await Product.find({
          categoryId: subCategory._id,
          sellingPrice,
        }).select('productName productPictures actualPrice sellingPrice');
        return res.status(200).json({ subCategoryProducts });
      }
      const subCategoryProducts = await Product.find({
        sellingPrice,
        targetAudience,
      }).select('productName productPictures actualPrice sellingPrice');
      return res.status(200).json({ subCategoryProducts });
    }

    // if price is not selected then fetching products based on subCategory only.
    if (category) {
      const subCategory = await Category.findOne({ slug: category });
      const subCategoryProducts = await Product.find({
        categoryId: subCategory._id,
      }).select('productName productPictures actualPrice sellingPrice');
      return res.status(200).json({ subCategoryProducts });
    }
  } catch (error) {
    return res
      .status(400)
      .json({ error: 'Something Gone Wrong Please Try Again' });
  }
};

// fetching single product based on productId and also fetching review data from different model by using populate method.
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

// fetching featured products based on rating if the rating is greater than 2
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

// updating topTrendingProducts based on event(like visit).
// when(only) loggedin user will click on any product then i am updating topTrendingProducts count
export const updateTopTrendingProduct = async (req, res) => {
  try {
    const { productId, userId, eventType } = req.body;
    if (!userId || !productId) {
      return res.status(200).json({ msg: 'unsuccessfully' });
    }
    await TrendingProduct.findOneAndUpdate(
      { productId, userId },
      { $set: { productId, userId, eventType } },
      { upsert: true }
    );

    return res.status(200).json({ msg: 'successfully' });
  } catch (err) {
    return res.status(400).json({
      error: 'Something Went Wrong Please Try Again',
      msg: err.message,
    });
  }
};

export const getTopTrendingProducts = async (req, res) => {
  const trendDuration = 30;
  // 24 -> hours, 60 -> minutes, 60 -> seconds, 1000 -> milliseconds
  // calcuting the last 14 days
  const cutoffDate = new Date(Date.now() - trendDuration * 24 * 60 * 60 * 1000);

  try {
    const products = await TrendingProduct.aggregate([
      {
        $match: { updatedAt: { $gt: cutoffDate }, eventType: 'visit' },
      },
      {
        $group: {
          _id: '$productId',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $lookup: {
          from: 'products', // model name
          localField: '_id',
          foreignField: '_id',
          as: 'productDetails',
        },
      },
      {
        $unwind: '$productDetails',
      },
      {
        $group: {
          _id: '$productDetails.targetAudience',
          trendingProducts: {
            $push: {
              productId: '$_id',
              totalCount: '$count',
              productPicture: {
                $arrayElemAt: ['$productDetails.productPictures', 0], // Extract the first image from the productPictures array and also renaming the field from productPictures to productPicture.
              },
            },
          },
        },
      },
      {
        $project: {
          _id: 0, // removing the _id field
          targetAudience: '$_id', // renaming the _id field to targetAudience field
          trendingProducts: {
            $slice: ['$trendingProducts', 15], // here i am slicing the 15 products
          },
        },
      },
    ]);
    return res.status(200).json({ products });
  } catch (err) {
    // console.log(err);
    return res.status(400).json({
      error: 'Something Went Wrong Please Try Again',
      msg: err.message,
    });
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
    // console.log(err);
    return res
      .status(400)
      .json({ error: 'Something Went Wrong Please Try Again' });
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
