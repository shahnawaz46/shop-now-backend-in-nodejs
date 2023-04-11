const Order = require('../model/order');

exports.addOrder = async (req,res) =>{
    try{
        req.body.userId = req.data._id
        const order = new Order(req.body)
        await order.save((error,order)=>{
            if(error){
                return res.status(400).json({ error })
            }
            if(order){
                return res.status(201).json({ order })
            }
        })
    }catch(error){
        return res.status(400).json({ error: "Something Gone Wrong Please Try Again" })
    }
}

exports.getOrder = async (req,res) =>{
    try{
        const findOrder = await Order.find({ user: req.user._id }).select(" _id paymentStatus items ").populate("items.productId","_id name productPictures")
        if(findOrder){
            return res.status(200).json({ findOrder })
        }else{
            return res.status(400).json({error:'Order is empty'})
        }
    }catch(error){
        return res.status(400).json({ error: "Something Gone Wrong Please Try Again" })
    }
}