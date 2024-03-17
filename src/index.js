import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';

// db connection
import Connection from './db/Connection.js';

// user router
import userRouter from './routes/user/user.routes.js';
import userProductRouter from './routes/user/product.routes.js';
import userCategoryRouter from './routes/user/category.routes.js';
import cartRoute from './routes/user/cart.routes.js';
import addressRoute from './routes/user/address.routes.js';
import orderRoute from './routes/user/order.routes.js';

// admin router
import adminCategoryRoute from './routes/admin/category.routes.js';
import adminRouter from './routes/admin/admin.routes.js';

import bannerRoute from './routes/banner.routes.js';

// import { deleteAllReviews } from './controller/admin/product.controller.js';
// deleteAllReviews();

const app = express();
dotenv.config();

Connection();

// const origin =
//   process.env.NODE_ENV === 'production'
//     ? 'https://fuzicon-ecommerce.netlify.app'
//     : true;

app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());
app.use(express.json({ limit: '200mb' }));
app.use(express.urlencoded({ limit: '200mb', extended: true }));
app.use(express.text({ limit: '200mb' }));
app.use(express.static('public'));

// admin routes
app.use('/api', adminCategoryRoute);

// user routes
app.use('/api', userRouter);
app.use('/api', userProductRouter);
app.use('/api', userCategoryRouter);

app.use('/api', adminRouter);
app.use('/api', bannerRoute);
app.use('/api', cartRoute);
app.use('/api', addressRoute);
app.use('/api', orderRoute);

const port = process.env.PORT || 9000;
app.listen(port, () => console.log(`Server is running at Port no ${port}`));
