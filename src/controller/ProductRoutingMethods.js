const slugify = require('slugify');
const path = require("path");
const fs = require("fs")

// components
const ProductCollection = require("../model/ProductCollection");
// const ProductCollection = require("../model/TempProductCollection");
const CategoryCollection = require("../model/CategoryCollection");


exports.addProduct = async (req, res) => {
    const { productName, actualPrice, sellingPrice, description, stocks, categoryId } = req.body
    let productPictures = req.files

    if (productPictures.length > 0) {
        productPictures = req.files.map((image) => {
            return {
                img: image.filename
            }
        })
    } else {
        return res.status(404).json({ error: "Image not Found Please Select Images" })
    }

    try {
        const product = new ProductCollection({
            productName,
            slug: slugify(productName),
            actualPrice,
            sellingPrice,
            description,
            stocks,
            productPictures,
            categoryId,
            createdBy: { AdminId: req.data._id }
        })

        await product.save((error, product) => {
            if (error) {
                return res.status(400).json({ error: "Product Already Exist Please Use Another Name" })
            }
            if (product) {
                return res.status(200).json({ message: "Product Added Successfully" })
            }
        })

    } catch (err) {
        return res.status(400).json({ error: "Something Gone Wrong Please Try Again" })
    }
}


// for admin
exports.showProducts = async (req, res) => {
    try {
        const allProducts = await ProductCollection.find({}).select("_id productName actualPrice sellingPrice stocks categoryId description productPictures").populate({ path: 'categoryId', select: '_id categoryName' })
        if (allProducts) {
            return res.status(200).json({ allProducts: allProducts })
        }
        return res.status(404).json({ error: "Products not found please try again" })

    } catch (err) {
        return res.status(400).json({ error: "Something Gone Wrong Please Try Again" })
    }
}

exports.deleteProduct = async (req, res) => {
    try {
        const deletedProduct = await ProductCollection.findByIdAndDelete({ _id: req.body.productId })
        deletedProduct.productPictures.forEach((image) => {
            fs.unlinkSync(path.join(__dirname + '../../../' + '/public/productImages' + `/${image.img}`))
        })
        return res.status(200).json({ message: "Product Deleted Successfully" })

    } catch (error) {
        return res.status(400).json({ error: "Something Gone Wrong Please Try Again" })
    }
}

exports.editProduct = async (req, res) => {
    const { _id, productName, actualPrice, sellingPrice, description, stocks, productPictures, categoryId } = req.body
    try {
        const product = {
            productName,
            slug: slugify(productName),
            actualPrice,
            sellingPrice,
            description,
            stocks,
            productPictures,
            categoryId,
            createdBy: { AdminId: req.data._id }
        }
        await ProductCollection.findByIdAndUpdate({ _id }, product)
        return res.status(200).json({ message: "Product Edit Successfully" })
    }
    catch (err) {
        return res.status(400).json({ error: "Something Gone Wrong Please Try Again" })
    }
}

exports.getAllProductBySlug = async (req, res) => {
    const { slug } = req.params

    try {
        const selectedCategory = await CategoryCollection.findOne({ slug: slug })
        if (selectedCategory) {

            // this condition will run when user select sub Category like (top wears, bottom wears, etc)
            if (selectedCategory.parentCategoryId) {
                const products = await ProductCollection.find({ categoryId: selectedCategory._id })

                if (products) {
                    return res.status(200).json({ products })
                }
                return res.status(404).json({ error: "product not found" })
            }


            // this condition will run when user select Men's Wardrobe or Women's Wardrobe
            else {
                //  here i am getting list of sub categories
                const allCategoryId = await CategoryCollection.find({ parentCategoryId: selectedCategory._id }).select('_id')
                let allProduct = []
                for (let cat of allCategoryId) {
                    const products = await ProductCollection.find({ categoryId: cat._id })

                    if (products) {
                        allProduct.push(...products)
                    }
                }
                if (allProduct) {
                    return res.status(200).json({ products: allProduct })
                }
                return res.status(404).json({ error: "product not found" })
            }

        }
        return res.status(404).json({ error: "product not found" })

    } catch (error) {
        return res.status(400).json({ error: "Something Gone Wrong Please Try Again" })
    }
}


exports.getSingleProductById = async (req, res) => {
    const { productId } = req.params
    try {
        const product = await ProductCollection.findOne({ _id: productId }).populate("reviews.userId", "firstName lastName profilePicture")
        if (product) {
            return res.status(200).json({ product })
        }
        return res.status(404).json({ error: "product not found" })

    } catch (error) {
        return res.status(400).json({ error: "Something Gone Wrong Please Try Again" })
    }
}

exports.getFeaturedProducts = async (req, res) => {
    try {
        const allProducts = await ProductCollection.find({}).populate("categoryId")
        if (allProducts) {
            const featuredProducts = allProducts.filter((product) => product.reviews.reduce((total, value) => value.rating + total, 0) > 2)
            return res.status(200).json({ product: featuredProducts })
        }
        return res.status(400).json({ error: "product not found" })
    } catch (error) {
        return res.status(400).json({ error: "Something Gone Wrong Please Try Again" })
    }
}

exports.writeProductReview = async (req, res) => {
    const { product_id, message, rating, date } = req.body
    try {
        const product = await ProductCollection.findOne({ _id: product_id })
        if (product) {
            const reviewIsAlready = product.reviews.find((value) => value.userId == req.data._id)
            if (reviewIsAlready) {
                await ProductCollection.findOneAndUpdate({ _id: product_id, "reviews.userId": req.data._id }, {
                    $set: {
                        "reviews.$.message": message,
                        "reviews.$.rating": rating,
                        "reviews.$.update_date": date
                    }
                })
                return res.status(200).json({ message: "Review Edit Successfully" })
            } else {
                await ProductCollection.findOneAndUpdate({ _id: product_id }, {
                    $push: {
                        "reviews": { userId: req.data._id, rating, message, create_date: date, update_date: date }
                    }
                })
                return res.status(200).json({ message: "Review Add Successfully" })
            }
        }
        return res.status(400).json({ error: "No Product Found" })

    } catch (err) {
        return res.status(400).json({ error: "Something Gone Wrong Please Try Again" })
    }
}