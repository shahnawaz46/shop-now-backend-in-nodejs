// internal
import { LIMIT } from '../../constant/pagination.js';
import { Order } from '../../model/order.model.js';
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

export const getOrderStats = async (req, res) => {
  try {
    const orders = await Order.find({});
    return res.status(200).json({ orders });
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

export const updateOrderDeliveryStatus = async (req, res) => {
  try {
    const order = await Order.findOneAndUpdate(
      { orderId: req.body?.orderId },
      req.body
    );

    return res
      .status(200)
      .json({ msg: 'Delivery Status Updated Successfully' });
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
