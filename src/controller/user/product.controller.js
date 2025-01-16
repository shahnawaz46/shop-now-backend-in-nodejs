// internal
import { Product } from '../../model/product.model.js';
import { Category } from '../../model/category.model.js';
import { Order } from '../../model/order.model.js';
import { TrendingProduct } from '../../model/trendingProduct.model.js';
import { LIMIT } from '../../constant/pagination.js';
import { generateURL } from '../../utils/GenerateURL.js';
import sendMail from '../../services/mail.service.js';
import { errorTemplate } from '../../template/ErrorMailTemplate.js';

// find method in Mongoose takes three arguments:
// 1st -> filter
// 2nd(Optional) -> Specifies which fields to include or exclude from the retrieved documents. By default (null) means including all fields.
// 3rd(Optinal) -> Where you can define sorting, limiting, and other options for the find operation

// fetching all products based on targetAudience (Men, Women)
export const getAllProducts = async (req, res) => {
  // slug can be Men and Women
  const { slug } = req.params;
  const { page = 1 } = req.query;

  try {
    const allProducts = await Product.find(
      {
        targetAudience: slug,
      },
      // selecting these field to be return from database
      {
        productName: 1,
        productPictures: { $slice: 1 }, // Get the first element using projection operator
        actualPrice: 1,
        sellingPrice: 1,
      }
    )
      .skip((page - 1) * LIMIT)
      .limit(LIMIT);

    // generate nextUrl for pagination
    const nextRoute = generateURL(req, `page=${Number(page) + 1}`);

    return res.status(200).json({
      products: {
        next: allProducts.length < LIMIT ? null : nextRoute,
        data: allProducts,
      },
    });
  } catch (error) {
    // send error to email
    sendMail(
      process.env.ADMIN_EMAIL,
      'Error in Get All Products',
      errorTemplate(generateURL(req), error.message)
    );
    return res.status(500).json({
      error:
        "Oops! Something went wrong. We're working to fix it. Please try again shortly.",
    });
  }
};

// fetching filtered products (sub category products and price range)
export const getFilteredProducts = async (req, res) => {
  const { category, price, targetAudience, page = 1 } = req.query;
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
        })
          .select('productName productPictures actualPrice sellingPrice')
          .skip((page - 1) * LIMIT)
          .limit(LIMIT);

        // generate nextUrl for pagination
        const nextRoute = generateURL(
          req,
          `category=${category}&price=${price}&targetAudience=${targetAudience}&page=${
            Number(page) + 1
          }`
        );

        return res.status(200).json({
          products: {
            next: subCategoryProducts.length < LIMIT ? null : nextRoute,
            subCategoryProducts,
          },
        });
      }

      // if price is selected but category is not selected
      const subCategoryProducts = await Product.find({
        sellingPrice,
        targetAudience,
      })
        .select('productName productPictures actualPrice sellingPrice')
        .skip((page - 1) * LIMIT)
        .limit(LIMIT);

      // generate nextUrl for pagination
      const nextRoute = generateURL(
        req,
        `price=${price}&targetAudience=${targetAudience}&page=${
          Number(page) + 1
        }`
      );

      return res.status(200).json({
        next: subCategoryProducts.length < LIMIT ? null : nextRoute,
        subCategoryProducts,
      });
    }

    // if price is not selected only category is seleced then fetching products based on subCategory only.
    if (category) {
      const subCategory = await Category.findOne({ slug: category });
      const subCategoryProducts = await Product.find({
        categoryId: subCategory._id,
      })
        .select('productName productPictures actualPrice sellingPrice')
        .skip((page - 1) * LIMIT)
        .limit(LIMIT);

      // generate nextUrl for pagination
      const nextRoute = generateURL(
        req,
        `category=${category}&targetAudience=${targetAudience}&page=${
          Number(page) + 1
        }`
      );

      return res.status(200).json({
        next: subCategoryProducts.length < LIMIT ? null : nextRoute,
        subCategoryProducts,
      });
    }
  } catch (error) {
    // send error to email
    sendMail(
      process.env.ADMIN_EMAIL,
      'Error in Get Filtered Products',
      errorTemplate(generateURL(req), error.message)
    );
    return res.status(500).json({
      error:
        "Oops! Something went wrong. We're working to fix it. Please try again shortly.",
    });
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
    // send error to email
    sendMail(
      process.env.ADMIN_EMAIL,
      'Error in Get Single Product',
      errorTemplate(generateURL(req), error.message)
    );
    return res.status(500).json({
      error:
        "Oops! Something went wrong. We're working to fix it. Please try again shortly.",
    });
  }
};

// updating topTrendingProducts based on event(like visit).
// if loggedin user click on any product then i am updating topTrendingProducts count
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
  } catch (error) {
    // send error to email
    sendMail(
      process.env.ADMIN_EMAIL,
      'Error in Update Top Trending Product',
      errorTemplate(generateURL(req), error.message)
    );
    return res.status(500).json({
      error:
        "Oops! Something went wrong. We're working to fix it. Please try again shortly.",
    });
  }
};

// pipeline for get trending products
const trendingProductsPipeLine = async (cutoffDate = null) => {
  const pipeLine = [
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
  ];

  // if cutoffDate is present then i am fetching topTrendingProducts based on cutoffDate(it can be last 14 days, 30 days)
  if (cutoffDate) {
    pipeLine.unshift({
      $match: { updatedAt: { $gt: cutoffDate }, eventType: 'visit' },
    });
  } else {
    pipeLine.unshift({
      $match: { eventType: 'visit' },
    });
  }

  const products = await TrendingProduct.aggregate(pipeLine);
  return products;
};

export const getTopTrendingProducts = async (req, res) => {
  const trendDuration = 30;
  // 24 -> hours, 60 -> minutes, 60 -> seconds, 1000 -> milliseconds
  // calcuting the last 30 days
  const cutoffDate = new Date(Date.now() - trendDuration * 24 * 60 * 60 * 1000);

  try {
    const productResult = await trendingProductsPipeLine(cutoffDate);
    //  If there are at least 5 trending products in the last 30 days, then returning that products
    if (productResult[0]?.trendingProducts?.length >= 5) {
      return res.status(200).json({ products: productResult });
    }
    // Otherwise, fetching all-time trending products
    else {
      const productResult = await trendingProductsPipeLine();
      return res.status(200).json({ products: productResult });
    }
  } catch (error) {
    // send error to email
    sendMail(
      process.env.ADMIN_EMAIL,
      'Error in Get Top Trending Products',
      errorTemplate(generateURL(req), error.message)
    );
    return res.status(500).json({
      error:
        "Oops! Something went wrong. We're working to fix it. Please try again shortly.",
    });
  }
};

// fetchig topRated products based on reviews/rating
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
        // 1 means add and 0 means remove fields
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
  } catch (error) {
    // send error to email
    sendMail(
      process.env.ADMIN_EMAIL,
      'Error in Get Top Rating Products',
      errorTemplate(generateURL(req), error.message)
    );
    return res.status(500).json({
      error:
        "Oops! Something went wrong. We're working to fix it. Please try again shortly.",
    });
  }
};

// fetching top selling products
export const getTopSellingProducts = async (req, res) => {
  const { category, price, page = 1 } = req.query;

  // logic for price range
  let priceQuery;
  if (price) {
    const [minPrice, maxPrice] = price.split('-');
    // if maxPrice is 2500(default value) that's means user selected only minPrice So, i am returning all the products that is greater than minPrice.
    // if maxPrice is not 2500(default value) then i am returning all the products that price is between minPrice and maxPrice
    priceQuery =
      maxPrice == 2500
        ? { 'productDetails.sellingPrice': { $gte: Number(minPrice) } }
        : {
            'productDetails.sellingPrice': {
              $gte: Number(minPrice),
              $lt: Number(maxPrice),
            },
          };
  }

  try {
    const product = await Order.aggregate([
      { $match: { status: 'delivered' } },
      {
        $unwind: '$items',
      },
      {
        $group: {
          _id: '$items.product',
          totalSale: { $sum: 1 },
        },
      },
      {
        $sort: {
          totalSale: -1, // primary sort by totalSale
          _id: 1, // secondary sort by _id for consistency
        },
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
        $match: {
          $and: [
            category ? { 'productDetails.targetAudience': category } : {},
            price ? priceQuery : {},
          ],
        },
      },
      {
        $project: {
          totalSale: 1,
          productName: '$productDetails.productName',
          actualPrice: '$productDetails.actualPrice',
          sellingPrice: '$productDetails.sellingPrice',
          productPictures: {
            $slice: ['$productDetails.productPictures', 1],
          },
        },
      },
      { $skip: (page - 1) * LIMIT },
      {
        $limit: LIMIT,
      },
    ]);

    // creating route for send to client for fetching more data(pagination)
    const isExist =
      category && price
        ? `category=${category}&price=${price}&page=${Number(page) + 1}`
        : category
        ? `category=${category}&page=${Number(page) + 1}`
        : price
        ? `price=${price}&page=${Number(page) + 1}`
        : `page=${Number(page) + 1}`;

    // generate nextUrl for pagination
    const nextRoute = generateURL(req, isExist);

    return res.status(200).json({
      products: {
        next: product.length < LIMIT ? null : nextRoute,
        item: product,
      },
    });
  } catch (error) {
    // send error to email
    sendMail(
      process.env.ADMIN_EMAIL,
      'Error in Get Top Selling Products',
      errorTemplate(generateURL(req), error.message)
    );
    return res.status(500).json({
      error:
        "Oops! Something went wrong. We're working to fix it. Please try again shortly.",
    });
  }
};

// fetching newest products
export const getNewestProducts = async (req, res) => {
  const { category, price, page = 1 } = req.query;

  // logic for price range
  let priceQuery;
  if (price) {
    const [minPrice, maxPrice] = price.split('-');
    // if maxPrice is 2500(default value) that's means user only selected minPrice So, i am returning all the products that is greater than minPrice.
    // if maxPrice is not 2500(default value) then i am returning all the products that price is between minPrice and maxPrice
    priceQuery =
      maxPrice == 2500
        ? { sellingPrice: { $gte: Number(minPrice) } }
        : {
            sellingPrice: {
              $gte: Number(minPrice),
              $lt: Number(maxPrice),
            },
          };
  }

  try {
    // filter based on category and price
    const filter =
      category && price
        ? { targetAudience: category, ...priceQuery }
        : category
        ? { targetAudience: category }
        : price
        ? { ...priceQuery }
        : {};

    const newestProducts = await Product.find(
      filter,
      {
        productName: 1,
        productPictures: { $slice: 1 }, // Get the first element using projection operator
        actualPrice: 1,
        sellingPrice: 1,
      },
      { sort: { createdAt: -1 } }
    )
      .skip((page - 1) * LIMIT)
      .limit(LIMIT);

    // creating route for send to client for fetching more data(pagination)
    const isQueryExist =
      category && price
        ? `category=${category}&price=${price}&page=${Number(page) + 1}`
        : category
        ? `category=${category}&page=${Number(page) + 1}`
        : price
        ? `price=${price}&page=${Number(page) + 1}`
        : `page=${Number(page) + 1}`;

    // generate nextUrl for pagination
    const nextRoute = generateURL(req, isQueryExist);

    return res.status(200).json({
      products: {
        next: newestProducts.length < LIMIT ? null : nextRoute,
        item: newestProducts,
      },
    });
  } catch (error) {
    // send error to email
    sendMail(
      process.env.ADMIN_EMAIL,
      'Error in Get Newest Products',
      errorTemplate(generateURL(req), error.message)
    );
    return res.status(500).json({
      error:
        "Oops! Something went wrong. We're working to fix it. Please try again shortly.",
    });
  }
};

// for writing product reviews
export const writeProductReview = async (req, res) => {
  const { product_id, message, rating, date } = req.body;
  try {
    // checking product is exist or not
    const product = await Product.findOne({ _id: product_id });
    // checking review is already added by user or not
    if (product) {
      const reviewIsAlready = product.reviews.find(
        (value) => value.userId == req.data._id
      );

      // if review is already added then i am updating preview review with new review
      // and also returning list of updated review
      if (reviewIsAlready) {
        const review = await Product.findOneAndUpdate(
          { _id: product_id, 'reviews.userId': req.data._id },
          {
            $set: {
              'reviews.$.message': message,
              'reviews.$.rating': rating,
              'reviews.$.update_date': date,
            },
          },
          { new: true }
        )
          .select('reviews')
          .populate('reviews.userId', 'firstName lastName profilePicture');

        return res.status(200).json({
          message: 'Review Edit Successfully',
          allReviews: review.reviews,
        });
      }
      // if there is no review is added by user then pushing new review in product review array
      else {
        const review = await Product.findOneAndUpdate(
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
          },
          { new: true }
        )
          .select('reviews')
          .populate('reviews.userId', 'firstName lastName profilePicture');

        return res.status(200).json({
          message: 'Review Add Successfully',
          allReviews: review.reviews,
        });
      }
    }
    return res.status(400).json({ error: 'No Product Found' });
  } catch (error) {
    // send error to email
    sendMail(
      process.env.ADMIN_EMAIL,
      'Error in Write Product Review',
      errorTemplate(generateURL(req), error.message)
    );
    return res.status(500).json({
      error:
        "Oops! Something went wrong. We're working to fix it. Please try again shortly.",
    });
  }
};
