import { v4 as uuidv4 } from 'uuid';
import Razorpay from 'razorpay';
import crypto from 'crypto';

// internal
import { Order } from '../../model/order.model.js';
import { Cart } from '../../model/cart.model.js';

// razor pay instance
const key_id = process.env.RAZOR_PAY_KEY;
const key_secret = process.env.RAZOR_PAY_SECRET;
const instance = new Razorpay({ key_id, key_secret });

export const createOrder = async (req, res) => {
  try {
    const userId = req.data._id;
    const { addressId, items, totalPrice, paymentMethod, process } = req.body;
    const orderDetails = {
      address: addressId,
      customer: userId,
      orderId: uuidv4(),
      items,
      totalPrice,
      paymentMethod,
    };

    await Order.create(orderDetails); // creating order to the database

    // if customer place order through cart and paymentMethod is cod then the cart will be emptied after a successful order.
    // otherwise it means user have purchased product directly so cart will be remain same
    if (paymentMethod === 'cod' && process === 'checkout') {
      await Cart.findOneAndUpdate(
        { userId: req.data._id },
        { $set: { cartItems: [] } }
      );
    }

    // if paymentMethod is card then creating order with the help of razor pay to proceed payment
    let razorPayOrder;
    if (paymentMethod === 'card') {
      const options = {
        amount: totalPrice * 100, // Convert totalPrice to paisa
        currency: 'INR',
        receipt: orderDetails.orderId,
      };

      razorPayOrder = await instance.orders.create(options);
    }

    return paymentMethod === 'cod'
      ? res.status(201).json({ msg: 'Order Done' })
      : paymentMethod === 'card'
      ? res.status(201).json({
          process: process,
          orderId: orderDetails.orderId,
          razorOrderId: razorPayOrder.id,
          amount: razorPayOrder.amount,
          key: key_id,
        })
      : res.status(400).json({ error: 'Not Allowed' });
  } catch (error) {
    return res
      .status(400)
      .json({ error: 'Something Gone Wrong Please Try Again' });
  }
};

export const paymentVerification = async (req, res) => {
  const {
    razorpay_payment_id,
    razorpay_order_id,
    razorpay_signature,
    process,
  } = req.body;

  // generating signature as razorpay mention for verify payment
  const generated_signature = crypto
    .createHmac('sha256', key_secret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  try {
    // if signature matched then updating order document (paymentStatus and paymentDetails)
    if (generated_signature === razorpay_signature) {
      // if customer place order through  checkout cart then the cart will be emptied after a successful order.
      // otherwise it means user have purchased product directly so cart will be remain same
      if (process === 'checkout') {
        await Cart.findOneAndUpdate(
          { userId: req.data._id },
          { $set: { cartItems: [] } }
        );
      }

      await Order.findOneAndUpdate(
        { orderId: req.params.orderId },
        {
          $set: {
            paymentStatus: 'success',
            paymentDetails: {
              razorpay_payment_id,
              razorpay_order_id,
              razorpay_signature,
            },
          },
        }
      );
      return res.status(200).json({ msg: 'Payment successfull' });
    } else {
      // if payment not verified then updating paymentStatus to failed
      await Order.findOneAndUpdate(
        { orderId: req.params.orderId },
        {
          $set: {
            paymentStatus: 'failed',
            paymentDetails: {
              razorpay_payment_id,
              razorpay_order_id,
              razorpay_signature,
            },
          },
        }
      );
      return res.status(400).json({ error: 'Payment Not Verified' });
    }
  } catch (err) {
    return res
      .status(400)
      .json({ error: 'Something Gone Wrong Please Try Again' });
  }
};

export const paymentFailed = async (req, res) => {
  const { orderId, razorpay_order_id, razorpay_payment_id } = req.body;
  try {
    await Order.findOneAndUpdate(
      { orderId },
      {
        $set: {
          paymentStatus: 'failed',
          paymentDetails: { razorpay_order_id, razorpay_payment_id },
        },
      }
    );
    return res.status(201).json({ msg: 'payment failed' });
  } catch (err) {
    return res
      .status(400)
      .json({ error: 'Something Gone Wrong Please Try Again' });
  }
};

export const getOrder = async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.data._id })
      .populate('items.product', 'productName productPictures')
      .populate('address', 'address locality cityDistrictTown pinCode state')
      .sort({ createdAt: -1 });

    return res.status(200).json({ orders });
  } catch (error) {
    console.log(error);
    return res
      .status(400)
      .json({ error: 'Something Gone Wrong Please Try Again' });
  }
};
