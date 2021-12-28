const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    addressId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "UserAddress",
        required: true
    },
    totalAmount:{
        type:Number,
        required:true
    },
    items:[
        {
            productId:{
                type: mongoose.Schema.Types.ObjectId,
                ref: "products",
            },
            payablePrice:{
                type:Number,
                required:true
            },
            purChaseQty:{
                type:Number,
                required:true
            }
        }
    ],
    paymentStatus:{
        type:String,
        enum: ["pending","completed","cancelled","refund"],
        required:true
    },
},{ timeStamps:true });

module.exports = mongoose.model("Orders",orderSchema);