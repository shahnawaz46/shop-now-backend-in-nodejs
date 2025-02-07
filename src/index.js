import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import mongoDBConnection from './database/mongo.database.js';

// user router
import userRouter from './routes/user/user.routes.js';
import userProductRouter from './routes/user/product.routes.js';
import userCategoryRouter from './routes/user/category.routes.js';
import userCartRouter from './routes/user/cart.routes.js';
import userAddressRouter from './routes/user/address.routes.js';
import userOrderRouter from './routes/user/order.routes.js';

// admin router
import adminUserRouter from './routes/admin/admin.routes.js';
import adminCategoryRouter from './routes/admin/category.routes.js';
import adminProductRouter from './routes/admin/product.routes.js';
import adminOrderRouter from './routes/admin/order.routes.js';
import userRouterForAdmin from './routes/admin/user.routes.js';

// import bannerRoute from './routes/banner.routes.js';

// script file
import { allScript } from './script/AllScript.js';
import { wakeUpTheServer } from './utils/WakeUpTheServer.js';

const app = express();
dotenv.config({});

mongoDBConnection(); // mongoDB database connection

const origin =
  process.env.NODE_ENV === 'production'
    ? [
        'https://shop-now-reactjs.netlify.app',
        'https://shop-now-admin-panel.vercel.app',
      ]
    : true;

app.set('trust proxy', true);
app.use(cors({ origin, credentials: true }));
app.use(cookieParser());
app.use(express.json({ limit: '200mb' }));
app.use(express.urlencoded({ limit: '200mb', extended: true }));
app.use(express.text({ limit: '200mb' }));
app.use(express.static('public'));

// admin routes
app.use('/api/admin', adminUserRouter);
app.use('/api/admin', adminCategoryRouter);
app.use('/api/admin', adminProductRouter);
app.use('/api/admin', adminOrderRouter);
app.use('/api/admin', userRouterForAdmin);

// user routes
app.use('/api', userRouter);
app.use('/api', userProductRouter);
app.use('/api', userCategoryRouter);
app.use('/api', userCartRouter);
app.use('/api', userAddressRouter);
app.use('/api', userOrderRouter);

// app.use('/api', bannerRoute);

const port = process.env.PORT || 9000;
app.listen(port, () => console.log(`Server is running at Port no ${port}`));

// running script if i want to update any model
allScript();

// trying to wakeup the server
wakeUpTheServer();
