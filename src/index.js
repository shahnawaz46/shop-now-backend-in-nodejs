const express = require("express");
const dotenv = require('dotenv');
const cors = require("cors");;
const cookieParser = require("cookie-parser");

// componenets  
const Connection = require("./db/Connection");
const userRouter = require("./routes/user");
const adminRouter = require("./routes/admin");
const categoryRoute = require("./routes/category");
const productRoute = require("./routes/product");
const bannerRoute = require("./routes/banner");
const cartRoute = require("./routes/cart");
const addressRoute = require("./routes/address")
const orderRoute = require("./routes/order")

const app = express()
dotenv.config()

Connection()

app.use(cors({ origin: "https://fuzicon-ecommerce.netlify.app", credentials: true }));
app.use(cookieParser())
app.use(express.json());
app.use(express.static('public'));

app.use('/api', userRouter);
app.use('/api', adminRouter);
app.use('/api', categoryRoute);
app.use('/api', productRoute);
app.use('/api', bannerRoute)
app.use('/api', cartRoute);
app.use('/api', addressRoute);
app.use('/api', orderRoute);

const port = process.env.PORT || 9000
app.listen(port, () => console.log(`Server is running at Port no ${port}`));
