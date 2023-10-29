// components
const ProductCollection = require('../../model/product');
const CategoryCollection = require('../../model/category');
const TrendingProductCollection = require('../../model/trendingProduct');

exports.getAllProducts = async (req, res) => {
  const { slug } = req.params;
  try {
    const allProducts = await ProductCollection.find({
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
exports.getFilteredProducts = async (req, res) => {
  const { category, price, targetAudience } = req.query;

  try {
    if (price) {
      const [minPrice, maxPrice] = price.split('-');
      const sellingPrice =
        maxPrice === 2500
          ? { $gte: minPrice }
          : {
              $gte: minPrice,
              $lte: maxPrice,
            };

      if (category) {
        const subCategory = await CategoryCollection.findOne({
          slug: category,
        });
        const subCategoryProducts = await ProductCollection.find({
          categoryId: subCategory._id,
          sellingPrice,
        }).select('productName productPictures actualPrice sellingPrice');
        return res.status(200).json({ subCategoryProducts });
      }
      const subCategoryProducts = await ProductCollection.find({
        sellingPrice,
        targetAudience,
      }).select('productName productPictures actualPrice sellingPrice');
      return res.status(200).json({ subCategoryProducts });
    }
    if (category) {
      const subCategory = await CategoryCollection.findOne({ slug: category });
      const subCategoryProducts = await ProductCollection.find({
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

exports.getSingleProductById = async (req, res) => {
  const { productId } = req.params;
  try {
    const product = await ProductCollection.findOne({
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

exports.getFeaturedProducts = async (req, res) => {
  try {
    const allProducts = await ProductCollection.find({}).populate('categoryId');
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

exports.updateTopTrendingProduct = async (req, res) => {
  try {
    const { productId, userId, eventType } = req.body;
    if (!userId || !productId) {
      return res.status(200).json({ msg: 'unsuccessfully' });
    }
    await TrendingProductCollection.findOneAndUpdate(
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

exports.getTopTrendingProducts = async (req, res) => {
  const trendDuration = 30;
  // 24 -> hours, 60 -> minutes, 60 -> seconds, 1000 -> milliseconds
  // calcuting the last 14 days
  const cutoffDate = new Date(Date.now() - trendDuration * 24 * 60 * 60 * 1000);

  try {
    const products = await TrendingProductCollection.aggregate([
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

exports.topRatingProducts = async (req, res) => {
  try {
    // Finding top 20 products that have highest rating by using aggregate pipeline.
    const products = await ProductCollection.aggregate([
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

exports.writeProductReview = async (req, res) => {
  const { product_id, message, rating, date } = req.body;
  try {
    const product = await ProductCollection.findOne({ _id: product_id });
    if (product) {
      const reviewIsAlready = product.reviews.find(
        (value) => value.userId == req.data._id
      );
      if (reviewIsAlready) {
        await ProductCollection.findOneAndUpdate(
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
        await ProductCollection.findOneAndUpdate(
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
