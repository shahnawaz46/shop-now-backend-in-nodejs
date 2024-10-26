// internal
import { Cart } from '../../model/cart.model.js';
import { generateURL } from '../../utils/GenerateURL.js';
import sendMail from '../../services/mail.service.js';
import { errorTemplate } from '../../template/ErrorMailTemplate.js';

export const addToCart = async (req, res) => {
  try {
    const cartItem = req.body;
    // console.log(cartItem)
    const isCartCreated = await Cart.findOne({ userId: req.data._id });

    if (isCartCreated) {
      // You can use the $ operator to update the first element that matches the query document:
      const isItemAlreadyExist = await Cart.findOneAndUpdate(
        {
          userId: req.data._id,
          cartItems: {
            $elemMatch: { productId: cartItem.productId, size: cartItem.size },
          },
        },
        { $inc: { 'cartItems.$.qty': cartItem.qty } }
      );
      // console.log(isItemAlreadyExist)

      if (isItemAlreadyExist) {
        return res
          .status(200)
          .json({ msg: 'Item Updated in Cart Successfully' });
      }

      await Cart.findOneAndUpdate(
        { userId: req.data._id },
        {
          $push: { cartItems: cartItem },
        }
      );
      return res.status(200).json({ msg: 'Item Added in Cart Successfully' });
    }

    // when cart is not exist then create a new cart
    else {
      await Cart.create({ userId: req.data._id, cartItems: cartItem });
      return res.status(201).json({ msg: 'Cart Created Successfully' });
    }
  } catch (error) {
    // send error to email
    sendMail(
      process.env.ADMIN_EMAIL,
      'Error in Add to Cart',
      errorTemplate(generateURL(req), error.message)
    );
    return res.status(500).json({
      error:
        "Oops! Something went wrong. We're working to fix it. Please try again shortly.",
    });
  }
};

export const getCartItem = async (req, res) => {
  try {
    const userCart = await Cart.findOne({ userId: req.data._id })
      .select('cartItems')
      .populate({
        path: 'cartItems.productId',
        select: 'productName sellingPrice productPictures',
      });
    if (userCart) {
      const cartItem = userCart.cartItems.map((item) => {
        return {
          qty: item.qty,
          size: item.size,
          _id: item.productId._id,
          productName: item.productId.productName,
          sellingPrice: item.productId.sellingPrice,
          productImage: item.productId.productPictures[0]?.img,
        };
      });
      // console.log(cartItem)
      return res.status(200).json({ allCartItem: cartItem });
    }
    return res.status(401).json({ msg: 'Not Item in Cart' });
  } catch (error) {
    // send error to email
    sendMail(
      process.env.ADMIN_EMAIL,
      'Error in Get Cart Items',
      errorTemplate(generateURL(req), error.message)
    );
    return res.status(500).json({
      error:
        "Oops! Something went wrong. We're working to fix it. Please try again shortly.",
    });
  }
};

export const removeCartItem = async (req, res) => {
  const { _id, size } = req.body.product;
  try {
    await Cart.findOneAndUpdate(
      { userId: req.data._id },
      {
        $pull: { cartItems: { productId: _id, size } },
      }
    );
    return res.status(200).json({ msg: 'Cart Item deleted Successfully' });
  } catch (error) {
    // send error to email
    sendMail(
      process.env.ADMIN_EMAIL,
      'Error in Remove Cart Items',
      errorTemplate(generateURL(req), error.message)
    );
    return res.status(500).json({
      error:
        "Oops! Something went wrong. We're working to fix it. Please try again shortly.",
    });
  }
};
