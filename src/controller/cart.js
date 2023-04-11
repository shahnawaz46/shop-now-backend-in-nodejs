const CartCollection = require("../model/cart");


exports.addToCart = async (req, res) => {
    try {
        const cartItem = req.body
        const cartData = await CartCollection.findOne({ userId: req.data._id })
        if (cartData) {

            for (let item of cartItem) {
                let isItemAvailableInCart = cartData.cartItems.find((value) => value.productId == item.productId && value.size === item.size)

                if (isItemAvailableInCart) {
                    const qty = isItemAvailableInCart.qty + item.qty
                    if (qty == 0) {
                        return res.status(400).json({ error: "Minimum 1 Product Required" })
                    }

                    // You can use the $–operator to update the first element that matches the query document:
                    await CartCollection.findOneAndUpdate({ userId: req.data._id, cartItems: { $elemMatch: { productId: item.productId, size: item.size } } }, {
                        $set: {
                            "cartItems.$.qty": qty
                        }
                    })

                } else {
                    await CartCollection.findOneAndUpdate({ userId: req.data._id }, {
                        '$push': {
                            "cartItems": item
                        }
                    })
                }
            }
            return res.status(200).json({ message: "Product Add to Cart Successfully" })
        }

        // when cart is not exist then create a new cart
        else {
            const product = new CartCollection({ userId: req.data._id, cartItems: cartItem })
            await product.save((error, product) => {
                if (error) {
                    return res.status(400).json({ error: "New user Cart not Created" })
                }
                if (product) {
                    return res.status(201).json({ message: "New user Cart Created and product added" })
                }
            })
        }
    } catch (err) {
        return res.status(400).json({ error: "Something Gone Wrong Please Try Again" })
    }
}

exports.getCartItem = async (req, res) => {
    try {
        const userCart = await CartCollection.findOne({ userId: req.data._id }).select("cartItems").populate({ path: "cartItems.productId", select: "productName sellingPrice actualPrice productPictures" })
        if (userCart) {
            return res.status(200).json({ allCartItem: userCart.cartItems })
        }
        return res.status(401).json({ error: "Not Item in Cart" })

    } catch (err) {
        return res.status(400).json({ error: "Something Gone Wrong Please Try Again" })
    }
}

exports.removeCartItem = async (req, res) => {
    try {
        await CartCollection.findOneAndUpdate({ userId: req.data._id }, {
            '$pull': { cartItems: { productId: req.body.productId, size: req.body.size } }
        })
        return res.status(200).json({ message: "Cart Item deleted Successfully" })

    } catch (err) {
        return res.status(400).json({ error: "Something Gone Wrong Please Try Again" })
    }
}