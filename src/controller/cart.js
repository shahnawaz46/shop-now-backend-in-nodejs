const CartCollection = require("../model/cart");


exports.addToCart = async (req, res) => {
    try {
        const cartItem = req.body
        // console.log(cartItem)
        const isCartCreated = await CartCollection.findOne({ userId: req.data._id })
       
        if (isCartCreated) {
            // You can use the $ operator to update the first element that matches the query document:
            const isItemAlreadyExist = await CartCollection.findOneAndUpdate(
                { userId: req.data._id, cartItems: { $elemMatch: { productId: cartItem.productId, size: cartItem.size } } },
                {$inc: {'cartItems.$.qty': cartItem.qty}},
            )
            // console.log(isItemAlreadyExist)

            if(isItemAlreadyExist){
                return res.status(200).json({ msg: "Item Updated in Cart Successfully" })
            }

            await CartCollection.findOneAndUpdate({userId:req.data._id},{
                $push:{cartItems:cartItem}
            })
            return res.status(200).json({ msg: "Item Added in Cart Successfully" })
        }

        // when cart is not exist then create a new cart
        else {
            await CartCollection.create({ userId: req.data._id, cartItems: cartItem })
            return res.status(201).json({ msg: "Cart Created Successfully" })
           
        }
    } catch (err) {
        // console.log(err)
        return res.status(400).json({ msg: "Something Gone Wrong Please Try Again" })
    }
}

exports.getCartItem = async (req, res) => {
    try {
        const userCart = await CartCollection.findOne({ userId: req.data._id }).select("cartItems").populate({ path: "cartItems.productId", select: "productName sellingPrice productPictures" })
        if (userCart) {
            const cartItem = userCart.cartItems.map((item)=>{
                return {qty:item.qty, 
                        size:item.size,
                        _id:item.productId._id,
                        productName:item.productId.productName,
                        sellingPrice:item.productId.sellingPrice,
                        productImage:item.productId.productPictures[0]?.img
                    }
            })
            // console.log(cartItem)
            return res.status(200).json({ allCartItem: cartItem })
        }
        return res.status(401).json({ msg: "Not Item in Cart" })

    } catch (err) {
        return res.status(400).json({ msg: "Something Gone Wrong Please Try Again" })
    }
}

exports.removeCartItem = async (req, res) => {
    const {_id, size} = req.body.product
    try {
        await CartCollection.findOneAndUpdate({ userId: req.data._id }, {
            '$pull': { cartItems: { productId: _id, size } }
        })
        return res.status(200).json({ msg: "Cart Item deleted Successfully" })

    } catch (err) {
        return res.status(400).json({ msg: "Something Gone Wrong Please Try Again" })
    }
}