const express = require("express");

// components
const { verification, adminMiddleware } = require("../middleware/middleware");
const { addProduct,
    showProducts,
    deleteProduct,
    editProduct,
    getAllProductBySlug,
    getSingleProductById,
    getFeaturedProducts,
    writeProductReview, 
    topSellingProducts} = require("../controller/product");
const multerMiddleWare = require("../middleware/MulterMiddleWare");

const router = express.Router()

const upload = multerMiddleWare("productImages")

router.post("/product/add", verification('token'), adminMiddleware, upload.array('productPictures'), addProduct)

// getting products for admin
router.get("/product/get", showProducts)

// delete product for admin
router.post("/product/delete", verification('token'), adminMiddleware, deleteProduct)

// edit produt for admin
router.post("/product/edit", verification('token'), adminMiddleware, editProduct)



// getting all products for user bases on slug
// slug mean -> men or women
router.get("/product/:slug", getAllProductBySlug)

// getting single product by id
router.get("/product/single/:productId", getSingleProductById)

// getting high rating products for homepage
router.post("/product/featured-product", getFeaturedProducts)

router.get("/product/top/selling", topSellingProducts)

router.post("/product/write_review", verification("user_token"), writeProductReview)

module.exports = router;