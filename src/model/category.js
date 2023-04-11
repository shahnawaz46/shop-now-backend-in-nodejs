const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
    categoryName: {
        type: String,
        required: true,
        trim: true
    },
    slug: {
        type: String,
        required: true,
        unique: true
    },
    parentCategoryId: {
        type: String
    }

}, { timestamps: true })



const CategoryCollection = mongoose.model("categories", categorySchema);

module.exports = CategoryCollection;