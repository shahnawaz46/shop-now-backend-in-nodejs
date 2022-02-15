const mongoose = require("mongoose")


const tempProductSchema = new mongoose.Schema({
    productName: {
        type: String,
        required: true,
        trim: true
    },
    slug: {
        type: String,
        required: true,
        unique: true
    },
    actualPrice: {
        type: Number,
        required: true
    },
    sellingPrice: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    stocks: {
        type: Number,
        required: true
    },
    offer: {
        type: Number
    },
    productPictures: [
        {
            img: { type: String, required: true }
        }
    ],
    reviews: [
        {
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'users'
            },
            rating: Number,
            message: String,
            create_date: Date,
            update_date: Date
        }
    ],
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'categories',
        required: true
    },
    createdBy: {
        AdminId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'admin',
            required: true
        }
    },
    updatedAt: Date
})


const TempProductCollection = mongoose.model("tempProducts", tempProductSchema)

module.exports = TempProductCollection;