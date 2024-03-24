import { v4 as uuidv4 } from 'uuid';

// internal
import { Order } from '../../model/order.model.js';
import { Cart } from '../../model/cart.model.js';

export const addOrder = async (req, res) => {
  try {
    const userId = req.data._id;
    const { addressId, items, totalPrice, paymentMethod } = req.body;
    const orderDetails = {
      address: addressId,
      customer: userId,
      orderId: uuidv4(),
      items,
      totalPrice,
      paymentMethod,
    };

    await Order.create(orderDetails);
    await Cart.findOneAndUpdate(
      { userId: req.data._id },
      { $set: { cartItems: [] } }
    );
    return res.status(201).json({ msg: 'Order Done' });
  } catch (error) {
    console.log(error);
    return res
      .status(400)
      .json({ error: 'Something Gone Wrong Please Try Again' });
  }
};

export const getOrder = async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.data._id })
      .populate('items.product', 'productName productPictures')
      .populate('address', 'address locality cityDistrictTown pinCode state');

    return res.status(200).json({ orders });
  } catch (error) {
    console.log(error);
    return res
      .status(400)
      .json({ error: 'Something Gone Wrong Please Try Again' });
  }
};
