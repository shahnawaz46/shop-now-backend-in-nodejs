// internal
import { Cart } from "../../model/cart.model.js";
import { generateURL } from "../../utils/GenerateURL.js";
import sendMail from "../../services/mail.service.js";
import { errorTemplate } from "../../template/ErrorMailTemplate.js";
import { filterCartItems } from "../../utils/Carts.js";

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
        { $inc: { "cartItems.$.qty": cartItem.qty } }
      );
      // console.log(isItemAlreadyExist)

      if (isItemAlreadyExist) {
        return res
          .status(200)
          .json({ msg: "Item Updated in Cart Successfully" });
      }

      await Cart.findOneAndUpdate(
        { userId: req.data._id },
        {
          $push: { cartItems: cartItem },
        }
      );
      return res.status(200).json({ msg: "Item Added in Cart Successfully" });
    }

    // when cart is not exist then create a new cart
    else {
      await Cart.create({ userId: req.data._id, cartItems: cartItem });
      return res.status(201).json({ msg: "Cart Created Successfully" });
    }
  } catch (error) {
    // send error to email
    if (process.env.NODE_ENV === "production") {
      sendMail(
        process.env.ADMIN_EMAIL,
        "Error in Add to Cart",
        errorTemplate(generateURL(req), error.message)
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

export const getCartItem = async (req, res) => {
  try {
    const userCart = await Cart.findOne({ userId: req.data._id })
      .select("cartItems")
      .populate({
        path: "cartItems.productId",
        select: "productName sellingPrice productPictures",
      });

    if (!userCart) return res.status(401).json({ msg: "Not Item in Cart" });

    const cartItem = filterCartItems(userCart.cartItems);
    return res.status(200).json({ allCartItem: cartItem });
  } catch (error) {
    // send error to email
    if (process.env.NODE_ENV === "production") {
      sendMail(
        process.env.ADMIN_EMAIL,
        "Error in Get Cart Items",
        errorTemplate(generateURL(req), error.message)
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

export const removeCartItem = async (req, res) => {
  const { productId, size } = req.body.product;
  try {
    await Cart.findOneAndUpdate(
      { userId: req.data._id },
      {
        $pull: { cartItems: { productId, size } },
      }
    );
    return res.status(200).json({ msg: "Cart Item deleted Successfully" });
  } catch (error) {
    // send error to email
    if (process.env.NODE_ENV === "production") {
      sendMail(
        process.env.ADMIN_EMAIL,
        "Error in Remove Cart Items",
        errorTemplate(generateURL(req), error.message)
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

export const mergeCartItems = async (req, res) => {
  try {
    const cartItems = req.body;

    if (!cartItems)
      return res.status(404).json({ error: "Cart Items not available" });
    if (cartItems.length === 0)
      return res.status(404).json({ error: "Cart Items not available" });

    const isCartCreated = await Cart.findOne({ userId: req.data._id });

    // when cart doesn't exist, then create a new cart
    if (!isCartCreated) {
      await Cart.create({
        userId: req.data._id,
        cartItems: cartItems,
      });
    }

    // when cart exist, then update(push or increment quantity)
    if (isCartCreated) {
      for (let cartItem of cartItems) {
        const isItemAlreadyExist = await Cart.findOneAndUpdate(
          {
            userId: req.data._id,
            cartItems: {
              $elemMatch: {
                productId: cartItem.productId,
                size: cartItem.size,
              },
            },
          },
          { $inc: { "cartItems.$.qty": cartItem.qty } } // We can use the $ operator to update the first element that matches the query document
        );

        if (!isItemAlreadyExist) {
          await Cart.findOneAndUpdate(
            { userId: req.data._id },
            {
              $push: { cartItems: cartItem },
            }
          );
        }
      }
    }

    const userCart = await Cart.findOne({ userId: req.data._id })
      .select("cartItems")
      .populate({
        path: "cartItems.productId",
        select: "productName sellingPrice productPictures",
      });

    const cartItem = filterCartItems(userCart.cartItems);
    return res.status(200).json({ allCartItem: cartItem });
  } catch (error) {
    // send error to email
    if (process.env.NODE_ENV === "production") {
      sendMail(
        process.env.ADMIN_EMAIL,
        "Error in Add to Cart",
        errorTemplate(generateURL(req), error.message)
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
