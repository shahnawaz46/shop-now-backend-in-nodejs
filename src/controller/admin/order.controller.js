import moment from 'moment';

// internal
import { LIMIT } from '../../constant/pagination.js';
import { Order } from '../../model/order.model.js';
import { Product } from '../../model/product.model.js';
import { generateURL } from '../../utils/GenerateURL.js';

export const getAllOrders = async (req, res) => {
  const { page = 1 } = req.query;
  try {
    const orders = await Order.find({})
      .select('orderId customer totalPrice status orderDate')
      .populate('customer', 'firstName lastName')
      .skip((page - 1) * LIMIT)
      .limit(LIMIT);

    if (!orders) {
      return res.status(404).json({ error: 'No Orders found' });
    }

    const nextURL = generateURL(req, `page=${parseInt(page) + 1}`, true);

    return res
      .status(200)
      .json({ next: orders.length < LIMIT ? null : nextURL, orders });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ error: 'Something Gone Wrong Please Try Again' });
  }
};

// ? Get daily orders for the last 7 days
//  const startDate = moment().subtract(6, 'days').startOf('day'); // 7 days including today
//  const endDate = moment().endOf('day');

// dailyOrders: [
//   {
//     $match: {
//       orderDate: {
//         $gte: startDate.toDate(),
//         $lte: endDate.toDate(),
//       },
//     },
//   },
//   {
//     $group: {
//       _id: {
//         $dateToString: { format: '%m/%d', date: '$orderDate' },
//       },
//       orders: { $sum: 1 },
//     },
//   },
//   {
//     $sort: { _id: 1 }, // Sort by date ascending
//   },
//   {
//     $project: {
//       _id: 0,
//       date: '$_id', // Return formatted date
//       orders: 1,
//     },
//   },
// ],

//? Fill in missing dates with zero orders
//  const result = [];
//  for (let i = 0; i < 7; i++) {
//    const date = moment().subtract(i, 'days').format('MM/DD');
//    const orderCount =
//      orders?.[0]?.dailyOrders?.find((order) => order.date === date)
//        ?.orders || 0;
//    console.log(date, orderCount);
//    result.push({ date, orders: orderCount });
//  }

export const getOrderStats = async (req, res) => {
  try {
    // $facet Operator allows us to run multiple pipelines in parallel and return multiple sets of data in a single aggregation.
    // 1st facets is orderStats(for getting totalOrders, pendingOrder, etc)
    // and 2nd facets is dailyOrders(for getting last 7 day sales)
    const orders = await Order.aggregate([
      {
        $facet: {
          orderStats: [
            {
              $group: {
                _id: null,
                totalOrders: { $sum: 1 },
                pendingOrders: {
                  $sum: {
                    $cond: [{ $ne: ['$status', 'delivered'] }, 1, 0],
                  },
                },
                completedOrders: {
                  $sum: {
                    $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0],
                  },
                },
                processingOrders: {
                  $sum: {
                    $cond: [{ $eq: ['$status', 'processing'] }, 1, 0],
                  },
                },
                shippedOrders: {
                  $sum: {
                    $cond: [{ $eq: ['$status', 'shipped'] }, 1, 0],
                  },
                },
                totalRevenue: {
                  $sum: {
                    $cond: [
                      { $eq: ['$status', 'delivered'] },
                      '$totalPrice',
                      0,
                    ],
                  },
                },
              },
            },
            {
              $project: {
                _id: 0,
                totalOrders: 1,
                pendingOrders: 1,
                completedOrders: 1,
                processingOrders: 1,
                shippedOrders: 1,
                totalRevenue: 1,
              },
            },
          ],
          monthlyOrders: [
            {
              $group: {
                _id: { $month: '$createdAt' }, // group by month
                totalOrders: { $sum: 1 }, // count total orders for each month
              },
            },
            {
              $sort: { _id: 1 }, // Sort by month (ascending order)
            },
            {
              $project: {
                _id: 0,
                month: '$_id',
                totalOrders: 1,
              },
            },
          ],
        },
      },
    ]);

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
    const monthlyOrdersGraphData = monthNames.map((month) => ({
      month,
      orders: 0,
    }));

    // then assigning orders if data is present
    orders[0]?.monthlyOrders?.forEach((data) => {
      const monthIndex = data.month - 1;
      monthlyOrdersGraphData[monthIndex].orders = data?.totalOrders;
    });

    if (orders && orders.length > 0) {
      const orderStats = {
        ...orders[0]?.orderStats?.[0],
        monthlyOrders: monthlyOrdersGraphData,
      };
      return res.status(200).json({ orderStats });
    }

    return res.status(404).json({ error: 'No orders stats found' });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ error: 'Something Gone Wrong Please Try Again' });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params?.orderId)
      .populate('items.product', 'productName productPictures')
      .populate('address', 'address locality cityDistrictTown pinCode state');
    return res.status(200).json({ order });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ error: 'Something Gone Wrong Please Try Again' });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    // first updating order status
    const orderUpdated = await Order.findOneAndUpdate(
      { orderId: req.body?.orderId },
      req.body
    );

    // order status is delivered then i am updating product stock
    if (req?.body?.status === 'delivered') {
      orderUpdated.items.forEach(async (prod) => {
        const product = await Product.findById(prod.product);
        if (product) {
          product.stocks -= prod.qty;
          await product.save();
        }
      });
    }

    // then calculating orderStats like (totalOrders, pendingOrders, completedOrder, processingOrders, shippedOrders, totalRevenue)
    const orderStats = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          pendingOrders: {
            $sum: {
              $cond: [{ $ne: ['$status', 'delivered'] }, 1, 0],
            },
          },
          completedOrders: {
            $sum: {
              $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0],
            },
          },
          processingOrders: {
            $sum: {
              $cond: [{ $eq: ['$status', 'processing'] }, 1, 0],
            },
          },
          shippedOrders: {
            $sum: {
              $cond: [{ $eq: ['$status', 'shipped'] }, 1, 0],
            },
          },
          totalRevenue: {
            $sum: {
              $cond: [{ $eq: ['$status', 'delivered'] }, '$totalPrice', 0],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          totalOrders: 1,
          pendingOrders: 1,
          completedOrders: 1,
          processingOrders: 1,
          shippedOrders: 1,
          totalRevenue: 1,
        },
      },
    ]);

    return res.status(200).json({
      msg: 'Order Status Updated Successfully',
      orderStats: orderStats?.[0] || {},
    });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ error: 'Something Gone Wrong Please Try Again' });
  }
};

export const searchOrders = async (req, res) => {
  const { query, page = 1 } = req.query;

  try {
    // 'i': This option makes the regex search case-insensitive ex: PANT, Pant, pant
    // search based on orderId
    const orders = await Order.find({
      $or: [{ orderId: { $regex: query, $options: 'i' } }],
    })
      .select('orderId customer totalPrice status orderDate')
      .populate('customer', 'firstName lastName')
      .skip((page - 1) * LIMIT)
      .limit(LIMIT);

    const nextURL = generateURL(req, `query=${query}&page=${page + 1}`, true);

    return res
      .status(200)
      .json({ next: orders.length < LIMIT ? null : nextURL, orders });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ error: 'Something Gone Wrong Please Try Again' });
  }
};
