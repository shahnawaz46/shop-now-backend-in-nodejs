// internal
import { LIMIT } from '../../constant/pagination.js';
import { Order } from '../../model/order.model.js';
import { Product } from '../../model/product.model.js';
import { generateURL } from '../../utils/GenerateURL.js';
import sendMail from '../../services/mail.service.js';
import { errorTemplate } from '../../template/ErrorMailTemplate.js';

export const getAllOrders = async (req, res) => {
  const { page = 1 } = req.query;
  try {
    const orders = await Order.find({})
      .select('orderId customer totalPrice status orderDate paymentStatus')
      .populate('customer', 'firstName lastName')
      .sort({ createdAt: -1 })
      .skip((page - 1) * LIMIT)
      .limit(LIMIT);

    if (!orders) {
      return res.status(404).json({ error: 'No Orders found' });
    }

    const nextURL = generateURL(req, `page=${parseInt(page) + 1}`, true);

    return res
      .status(200)
      .json({ next: orders.length < LIMIT ? null : nextURL, orders });
  } catch (error) {
    // send error to email
    if (process.env.NODE_ENV === 'production') {
      sendMail(
        process.env.ADMIN_EMAIL,
        '(Admin Panel) Error in Get All Orders',
        errorTemplate(generateURL(req, '', true), error.message)
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

export const deleteOrder = async (req, res) => {
  const { orderId } = req.query;
  try {
    await Order.findOneAndDelete({ orderId });
    return res.status(200).json({ msg: 'Order deleted Successfully' });
  } catch (error) {
    // send error to email
    if (process.env.NODE_ENV === 'production') {
      sendMail(
        process.env.ADMIN_EMAIL,
        '(Admin Panel) Error in Get All Orders',
        errorTemplate(generateURL(req, '', true), error.message)
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
    // 1st facets is orderStats(for getting totalOrders, activeOrders, confirmedOrders, etc)
    // and 2nd facets is monthlyOrders(for getting product's monthly orders)
    const orders = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          activeOrders: {
            $sum: {
              $cond: [{ $ne: ['$status', 'delivered'] }, 1, 0],
            },
          },
          confirmedOrders: {
            $sum: {
              $cond: [{ $eq: ['$status', 'order confirmed'] }, 1, 0],
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
          activeOrders: 1,
          confirmedOrders: 1,
          completedOrders: 1,
          processingOrders: 1,
          shippedOrders: 1,
          totalRevenue: 1,
        },
      },
    ]);

    if (orders.length === 0) {
      return res.status(404).json({ error: 'No orders stats available' });
    }

    const orderStatsInfo = {
      ...orders[0],
    };

    return res.status(200).json({ orderStats: orderStatsInfo });
  } catch (error) {
    // send error to email
    if (process.env.NODE_ENV === 'production') {
      sendMail(
        process.env.ADMIN_EMAIL,
        '(Admin Panel) Error in Get Order Stats',
        errorTemplate(generateURL(req, '', true), error.message)
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

export const getOrderGraph = async (req, res) => {
  const currentYear = new Date().getFullYear();

  let year = req.query.year;
  year = year ? parseInt(year) : currentYear;

  try {
    const monthlyOrderGraph = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(`${year}-01-01T00:00:00.000Z`), // start of the current year
            $lt: new Date(`${year + 1}-01-01T00:00:00.000Z`), // start of the next year
          },
        },
      },
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
    ]);

    // graph with initial value
    const monthlyOrdersGraphData = [
      { month: 'Jan', orders: 0 },
      { month: 'Feb', orders: 0 },
      { month: 'Mar', orders: 0 },
      { month: 'Apr', orders: 0 },
      { month: 'May', orders: 0 },
      { month: 'Jun', orders: 0 },
      { month: 'Jul', orders: 0 },
      { month: 'Aug', orders: 0 },
      { month: 'Sep', orders: 0 },
      { month: 'Oct', orders: 0 },
      { month: 'Nov', orders: 0 },
      { month: 'Dec', orders: 0 },
    ];

    // then assigning orders if data is present
    monthlyOrderGraph?.forEach((data) => {
      const monthIndex = data.month - 1;
      monthlyOrdersGraphData[monthIndex].orders = data?.totalOrders;
    });

    return res.status(200).json({ monthlyOrders: monthlyOrdersGraphData });
  } catch (error) {
    // send error to email
    if (process.env.NODE_ENV === 'production') {
      sendMail(
        process.env.ADMIN_EMAIL,
        '(Admin Panel) Error in Get Order Graph',
        errorTemplate(generateURL(req, '', true), error.message)
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

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params?.orderId)
      .populate('items.product', 'productName productPictures')
      .populate('address', 'address locality cityDistrictTown pinCode state');
    return res.status(200).json({ order });
  } catch (error) {
    // send error to email
    if (process.env.NODE_ENV === 'production') {
      sendMail(
        process.env.ADMIN_EMAIL,
        '(Admin Panel) Error in Get Order By Id',
        errorTemplate(generateURL(req, '', true), error.message)
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

export const updateOrderStatus = async (req, res) => {
  try {
    // first updating order status
    const orderUpdated = await Order.findOneAndUpdate(
      { orderId: req.body?.orderId },
      req.body
    );

    // order status is delivered then i am updating product stock
    if (req?.body?.status === 'delivered') {
      if (orderUpdated.paymentMethod === 'cod') {
        orderUpdated.paymentStatus = 'success';
        await orderUpdated.save();
      }

      orderUpdated.items.forEach(async (prod) => {
        const product = await Product.findById(prod.product);
        if (product) {
          product.stocks -= prod.qty;
          product.totalSales += 1;
          await product.save();
        }
      });
    }

    // then calculating orderStats like (totalOrders, activeOrders, confirmedOrders, completedOrder, processingOrders, shippedOrders, totalRevenue)
    const orderStats = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          activeOrders: {
            $sum: {
              $cond: [{ $ne: ['$status', 'delivered'] }, 1, 0],
            },
          },
          confirmedOrders: {
            $sum: {
              $cond: [{ $eq: ['$status', 'order confirmed'] }, 1, 0],
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
          activeOrders: 1,
          confirmedOrders: 1,
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
  } catch (error) {
    // send error to email
    if (process.env.NODE_ENV === 'production') {
      sendMail(
        process.env.ADMIN_EMAIL,
        '(Admin Panel) Error in Update Order Status',
        errorTemplate(generateURL(req, '', true), error.message)
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
  } catch (error) {
    // send error to email
    if (process.env.NODE_ENV === 'production') {
      sendMail(
        process.env.ADMIN_EMAIL,
        '(Admin Panel) Error in Search Order',
        errorTemplate(generateURL(req, '', true), error.message)
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
