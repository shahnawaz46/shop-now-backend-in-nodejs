import slugify from 'slugify';

// internal
import { Product } from '../../model/product.model.js';
import {
  deleteProductPictures,
  uploadProductPictures,
} from '../../utils/Cloudinary.js';
import { Order } from '../../model/order.model.js';
import { LIMIT } from '../../constant/pagination.js';
import { generateURL } from '../../utils/GenerateURL.js';

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
      .json({ error: 'Image not Found Please Select Images' });
  }

  const productPictures = [];
  for (const file of req.files) {
    const result = await uploadProductPictures(file.path);
    productPictures.push(result);
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
        '_id productName actualPrice sellingPrice stocks categoryId targetAudience description productPictures'
      )
      .populate({ path: 'categoryId', select: '_id categoryName' });

    // after product is added here i am again calculating productData details
    const productData = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalStocks: { $sum: '$stocks' },
          totalProducts: { $sum: 1 },
          menProductsCount: {
            $sum: {
              $cond: [{ $eq: ['$targetAudience', 'Men'] }, 1, 0],
            },
          },
          womenProductsCount: {
            $sum: {
              $cond: [{ $eq: ['$targetAudience', 'Women'] }, 1, 0],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          totalStocks: 1,
          totalProducts: 1,
          menProductsCount: 1,
          womenProductsCount: 1,
        },
      },
    ]);

    return res.status(200).json({
      message: 'Product Added Successfully',
      product,
      productData: productData?.[0] || {},
    });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ error: 'Something Gone Wrong Please Try Again' });
  }
};

// getting all products along with the other details like total sales, total stock, total revenue etc
export const getAllProducts = async (req, res) => {
  const { page = 1 } = req.query;
  try {
    const allProducts = await Product.find({})
      .select(
        '_id productName actualPrice sellingPrice stocks categoryId targetAudience description productPictures totalSales'
      )
      .populate({ path: 'categoryId', select: '_id categoryName' })
      .sort({ createdAt: -1 })
      .skip((page - 1) * LIMIT)
      .limit(LIMIT);

    // generate next url for pagination
    const nextURL = generateURL(req, `page=${parseInt(page) + 1}`, true);

    return res.status(200).json({
      next: allProducts.length < LIMIT ? null : nextURL,
      products: allProducts,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ error: 'Something Gone Wrong Please Try Again' });
  }
};

export const productSalesDetails = async (req, res) => {
  try {
    // first calculating total stocks, total products and category distribution
    const productData = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalStocks: { $sum: '$stocks' },
          totalProducts: { $sum: 1 },
          menProductsCount: {
            $sum: {
              $cond: [{ $eq: ['$targetAudience', 'Men'] }, 1, 0],
            },
          },
          womenProductsCount: {
            $sum: {
              $cond: [{ $eq: ['$targetAudience', 'Women'] }, 1, 0],
            },
          },
        },
      },
    ]);

    // $facet Operator allows us to run multiple pipelines in parallel and return multiple sets of data in a single aggregation.
    // 1st facets is orderStats(for getting totalOrders, pendingOrder, etc)
    // and 2nd facets is monthlySales(for getting product's monthly sales)
    const orderData = await Order.aggregate([
      {
        $facet: {
          orderStats: [
            {
              $match: { status: 'delivered' }, // match orders with 'delivered' status
            },
            {
              $group: {
                _id: null,
                totalRevenue: { $sum: '$totalPrice' }, // sum total price of all order
                totalSellings: { $sum: 1 }, // sum total order(status delivered) of all order
              },
            },
            {
              // $project is used for Reshapes a document stream by renaming, adding, or removing fields
              // $project stage is used for return only the fields you need in the result.
              // 1 means add and 0 means remove fields
              $project: {
                _id: 0,
              },
            },
          ],
          monthlySales: [
            {
              $match: { status: 'delivered' }, // match orders with 'delivered' status
            },
            {
              $group: {
                _id: { $month: '$createdAt' }, // group by month
                // sales: { $sum: '$totalPrice' }, // sum total price for each month
                sales: { $sum: 1 }, // count total sales for each month
              },
            },
            {
              $sort: { _id: 1 }, // Sort by month (ascending order)
            },
            {
              $project: {
                _id: 0,
                month: '$_id',
                sales: 1,
              },
            },
          ],
        },
      },
    ]);

    // destructure
    const { orderStats, monthlySales } = orderData[0];

    // months name for graph
    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];

    // first initializing graph data with sales 0 of each months
    const initialGraphData = monthNames.map((month) => ({
      month,
      sales: 0,
    }));

    // then assigning sales if data is present
    monthlySales.forEach((data) => {
      const monthIndex = data.month - 1;
      initialGraphData[monthIndex].sales = data.sales;
    });

    const productSales = {
      totalProducts: productData?.[0]?.totalProducts || 0,
      totalStocks: productData?.[0]?.totalStocks || 0,
      menProductsCount: productData?.[0]?.menProductsCount || 0,
      womenProductsCount: productData?.[0]?.womenProductsCount || 0,
      totalRevenue: orderStats[0]?.totalRevenue || 0,
      totalSellings: orderStats[0]?.totalSellings || 0,
      graph: initialGraphData,
    };

    return res.status(200).json({ ...productSales });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ error: 'Something Gone Wrong Please Try Again' });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    // first find product so i can get productPictures public_id
    const deletedProduct = await Product.findOne({ _id: req.body.productId });

    if (!deleteProduct) {
      return res
        .status(404)
        .json({ error: 'Product not found please check again' });
    }

    // then i am deleting productPictures from cloudinary
    await deleteProductPictures(deletedProduct.productPictures);

    // finally i am deleting product from mongodb
    await Product.findByIdAndDelete({
      _id: deletedProduct._id,
    });

    // after product is deleted here i am again calculating productData details
    const productData = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalStocks: { $sum: '$stocks' },
          totalProducts: { $sum: 1 },
          menProductsCount: {
            $sum: {
              $cond: [{ $eq: ['$targetAudience', 'Men'] }, 1, 0],
            },
          },
          womenProductsCount: {
            $sum: {
              $cond: [{ $eq: ['$targetAudience', 'Women'] }, 1, 0],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          totalStocks: 1,
          totalProducts: 1,
          menProductsCount: 1,
          womenProductsCount: 1,
        },
      },
    ]);

    return res.status(200).json({
      message: 'Product Deleted Successfully',
      productData: productData?.[0] || {},
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error: 'Something Gone Wrong Please Try Again' });
  }
};

export const editProduct = async (req, res) => {
  let { _id, ...rest } = req.body;

  // if images edited by user then removing previous image and uploading new image
  if (req.files && req.files.length > 0) {
    const product = await Product.findById(_id);

    // first removing previous productPictures from cloudinary
    await deleteProductPictures(product.productPictures);

    // then uploading new product pictures
    const productPictures = [];
    for (const file of req.files) {
      const result = await uploadProductPictures(file.path);
      productPictures.push(result);
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
        '_id productName actualPrice sellingPrice stocks categoryId targetAudience description productPictures'
      )
      .populate({ path: 'categoryId', select: '_id categoryName' });

    // if both stock and target audience are not present in the payload/req then there is no need to calculate productData
    if (!rest?.stocks && !rest?.targetAudience) {
      return res.status(200).json({
        message: 'Product Edit Successfully',
        product,
      });
    }

    // after product is edited i am again calculating productData details
    const productData = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalStocks: { $sum: '$stocks' },
          totalProducts: { $sum: 1 },
          menProductsCount: {
            $sum: {
              $cond: [{ $eq: ['$targetAudience', 'Men'] }, 1, 0],
            },
          },
          womenProductsCount: {
            $sum: {
              $cond: [{ $eq: ['$targetAudience', 'Women'] }, 1, 0],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          totalStocks: 1,
          totalProducts: 1,
          menProductsCount: 1,
          womenProductsCount: 1,
        },
      },
    ]);

    return res.status(200).json({
      message: 'Product Edit Successfully',
      product,
      productData: productData?.[0] || {},
    });
  } catch (err) {
    return res
      .status(500)
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
      .status(500)
      .json({ error: 'Something Gone Wrong Please Try Again' });
  }
};

export const searchProducts = async (req, res) => {
  const { query, page = 1 } = req.query;

  try {
    // 'i': This option makes the regex search case-insensitive ex: PANT, Pant, pant
    const products = await Product.find({
      $or: [{ productName: { $regex: query, $options: 'i' } }],
    })
      .select(
        '_id productName actualPrice sellingPrice stocks categoryId description productPictures'
      )
      .populate('categoryId', '_id categoryName')
      .skip((page - 1) * LIMIT)
      .limit(LIMIT);

    const nextURL = generateURL(req, `query=${query}&page=${page + 1}`, true);

    return res
      .status(200)
      .json({ next: products.length < LIMIT ? null : nextURL, products });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ error: 'Something Gone Wrong Please Try Again' });
  }
};
