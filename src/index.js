const express = require("express");
const dotenv = require('dotenv');
const cors = require("cors");;
const cookieParser = require("cookie-parser");

// componenets  
const Connection = require("./db/Connection");
const userRouter = require("./routes/UserRouter");
const adminRouter = require("./routes/AdminRouter");
const categoryRoute = require("./routes/CategoryRouter");
const productRoute = require("./routes/ProductRouter");
const bannerRoute = require("./routes/BannerRouter");
const cartRoute = require("./routes/CartRouter");
const addressRoute = require("./routes/AddressRouter")
const orderRoute = require("./routes/OrderRouter")

const app = express()
dotenv.config()

Connection()

app.use(cors({ origin: true, credentials: true }));
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