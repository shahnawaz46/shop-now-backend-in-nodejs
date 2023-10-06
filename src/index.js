const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const Connection = require('./db/Connection');

// users components
const userProductRoute = require('./routes/user/product');

const userRouter = require('./routes/user');
const adminRouter = require('./routes/admin');
const categoryRoute = require('./routes/category');
const bannerRoute = require('./routes/banner');
const cartRoute = require('./routes/cart');
const addressRoute = require('./routes/address');
const orderRoute = require('./routes/order');

const app = express();
dotenv.config();

Connection();

const origin =
  process.env.NODE_ENV === 'production'
    ? 'https://fuzicon-ecommerce.netlify.app'
    : true;

app.use(cors({ origin, credentials: true }));
app.use(cookieParser());
app.use(express.json({ limit: '200mb' }));
app.use(express.urlencoded({ limit: '200mb', extended: true }));
app.use(express.text({ limit: '200mb' }));
app.use(express.static('public'));

// admins routes

// user routes
app.use('/api', userProductRoute);

app.use('/api', userRouter);
app.use('/api', adminRouter);
app.use('/api', categoryRoute);
app.use('/api', bannerRoute);
app.use('/api', cartRoute);
app.use('/api', addressRoute);
app.use('/api', orderRoute);

const port = process.env.PORT || 9000;
app.listen(port, () => console.log(`Server is running at Port no ${port}`));
