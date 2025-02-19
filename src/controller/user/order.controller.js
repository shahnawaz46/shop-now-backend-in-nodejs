import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import puppeteer from 'puppeteer';
import ejs from 'ejs';
import path from 'path';
import { fileURLToPath } from 'url';

// internal
import { Order } from '../../model/order.model.js';
import { Cart } from '../../model/cart.model.js';
import sendMail from '../../services/mail.service.js';
import { errorTemplate } from '../../template/ErrorMailTemplate.js';
import { generateURL } from '../../utils/GenerateURL.js';
import {
  key_id,
  key_secret,
  razorpayInstance,
} from '../../config/razorpay.config.js';

export const createOrder = async (req, res) => {
  try {
    const userId = req.data._id;
    const { addressId, items, totalPrice, paymentMethod, process } = req.body;

    // create object for use
    const orderDetails = {
      address: addressId,
      customer: userId,
      orderId: uuidv4(),
      items,
      totalPrice,
      paymentMethod,
    };

    const order = await Order.create(orderDetails); // creating order to the database

    // if paymentMethod is card then creating order with the help of razor pay to proceed payment
    if (paymentMethod === 'card') {
      const options = {
        amount: totalPrice * 100, // Convert totalPrice to paisa
        currency: 'INR',
        receipt: orderDetails.orderId,
      };

      const razorPayOrder = await razorpayInstance.orders.create(options);
      return res.status(201).json({
        process: process,
        orderId: orderDetails.orderId,
        razorOrderId: razorPayOrder.id,
        amount: razorPayOrder.amount,
        key: key_id,
      });
    }

    // if paymentMethod is cod then creating order with the help of razor pay to proceed payment
    if (paymentMethod === 'cod') {
      order.orderStatus = 'order confirmed';
      await order.save();

      // if customer place order through cart then the cart will be emptied after a successful order.
      if (process === 'checkout') {
        await Cart.findOneAndUpdate(
          { userId: req.data._id },
          { $set: { cartItems: [] } }
        );
      }

      return res.status(201).json({ msg: 'Order Done' });
    }

    return res.status(400).json({ error: 'Not Allowed' });
  } catch (error) {
    // send error to email
    if (process.env.NODE_ENV === 'production') {
      sendMail(
        process.env.ADMIN_EMAIL,
        'Error in Create Order',
        errorTemplate(generateURL(req), error.message)
      );
    } else {
      console.log(error);
    }

    return res.status(500).json({
      error:
        "Oops! Something went wrong. We're working to fix it. Please try again shortly.",
    });
  }
};

export const paymentVerification = async (req, res) => {
  const {
    razorpay_payment_id,
    razorpay_order_id,
    razorpay_signature,
    process,
  } = req.body;

  // generating signature as razorpay mention for verify payment
  const generated_signature = crypto
    .createHmac('sha256', key_secret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  try {
    // if signature matched then updating order document (paymentStatus and paymentDetails)
    if (generated_signature === razorpay_signature) {
      // if customer place order through  checkout cart then the cart will be emptied after a successful order.
      // otherwise it means user have purchased product directly so cart will be remain same
      if (process === 'checkout') {
        await Cart.findOneAndUpdate(
          { userId: req.data._id },
          { $set: { cartItems: [] } }
        );
      }

      await Order.findOneAndUpdate(
        { orderId: req.params.orderId },
        {
          $set: {
            paymentStatus: 'success',
            orderStatus: 'order confirmed',
            paymentDetails: {
              razorpay_payment_id,
              razorpay_order_id,
              razorpay_signature,
            },
          },
        }
      );
      return res.status(200).json({ msg: 'Payment successfull' });
    } else {
      // if payment not verified then updating paymentStatus to failed
      await Order.findOneAndUpdate(
        { orderId: req.params.orderId },
        {
          $set: {
            paymentStatus: 'failed',
            orderStatus: 'failed',
            paymentDetails: {
              razorpay_payment_id,
              razorpay_order_id,
              razorpay_signature,
            },
          },
        }
      );
      return res.status(400).json({ error: 'Payment Not Verified' });
    }
  } catch (error) {
    // send error to email
    if (process.env.NODE_ENV === 'production') {
      sendMail(
        process.env.ADMIN_EMAIL,
        'Error in Payment Verification For Order',
        errorTemplate(generateURL(req), error.message)
      );
    } else {
      console.log(error);
    }

    return res.status(500).json({
      error:
        "Oops! Something went wrong. We're working to fix it. Please try again shortly.",
    });
  }
};

export const paymentFailed = async (req, res) => {
  const { orderId, razorpay_order_id, razorpay_payment_id } = req.body;

  try {
    await Order.findOneAndUpdate(
      { orderId },
      {
        $set: {
          paymentStatus: 'failed',
          orderStatus: 'failed',
          paymentDetails: { razorpay_order_id, razorpay_payment_id },
        },
      }
    );
    return res.status(201).json({ msg: 'payment failed' });
  } catch (error) {
    // send error to email
    if (process.env.NODE_ENV === 'production') {
      sendMail(
        process.env.ADMIN_EMAIL,
        'Error in Payment Failed For Order',
        errorTemplate(generateURL(req), error.message)
      );
    } else {
      console.log(error);
    }

    return res.status(500).json({
      error:
        "Oops! Something went wrong. We're working to fix it. Please try again shortly.",
    });
  }
};

export const getOrder = async (req, res) => {
  try {
    const orders = await Order.find({
      customer: req.data._id,
      orderStatus: { $ne: 'pending' },
    })
      .populate('items.product', 'productName productPictures')
      .populate('address', 'address locality cityDistrictTown pinCode state')
      .sort({ createdAt: -1 });

    return res.status(200).json({ orders });
  } catch (error) {
    // send error to email
    if (process.env.NODE_ENV === 'production') {
      sendMail(
        process.env.ADMIN_EMAIL,
        'Error in Get Order',
        errorTemplate(generateURL(req), error.message)
      );
    } else {
      console.log(error);
    }

    return res.status(500).json({
      error:
        "Oops! Something went wrong. We're working to fix it. Please try again shortly.",
    });
  }
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const invoicePath = path.join(__dirname, '../../template/Invoice.ejs');

export const generateInvoice = async (req, res) => {
  try {
    const { orderId } = req.params;
    if (!orderId) {
      return res
        .status(400)
        .json({ error: 'Order not found, Please try again later' });
    }

    const order = await Order.findOne({ orderId })
      .populate('items.product', 'productName')
      .populate(
        'address',
        'name mobileNumber address locality cityDistrictTown state pinCode'
      );

    // extract required data
    const invoice = order.orderId.split('-');
    const orderDate = new Date(order.orderDate).toDateString();
    const updatedData = {
      orderDate,
      invoice: `${invoice[0]}-${invoice[1]}`,
      customerName: `${order?.address?.name}`,
      customerPhoneNo: order?.address?.mobileNumber,
      customerAddress: `${order?.address?.address}, ${order?.address?.locality}`,
      customerLocality: `${order?.address?.cityDistrictTown}, ${order?.address?.pinCode}`,
      customCountry: `${order?.address?.state}, India`,
      items: order?.items,
      totalPrice: order?.totalPrice,
    };

    // const htmlContent = fs.readFileSync(invoicePath, 'utf8');
    const htmlContent = await ejs.renderFile(invoicePath, updatedData);

    // create a browser instance
    const browser = await puppeteer.launch({
      headless: true,
      ignoreDefaultArgs: ['--disable-extensions'],
    });

    // Create a new page
    const page = await browser.newPage();

    await page.setContent(htmlContent, { waitUntil: 'domcontentloaded' });

    // Optional: Debug styles with a screenshot
    // await page.screenshot({ path: 'debug.png', fullPage: true });

    // Downlaod the PDF
    const pdf = await page.pdf({
      margin: { top: '100px', right: '50px', bottom: '100px', left: '50px' },
      printBackground: true,
      format: 'A4',
    });

    // Close the browser instance
    await browser.close();

    // Set the response headers for PDF download
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="invoice.pdf"',
      'Content-Length': pdf.length, // Ensures accurate content length
    });

    res.end(pdf); // Send the PDF buffer as response
  } catch (error) {
    // send error to email
    if (process.env.NODE_ENV === 'production') {
      sendMail(
        process.env.ADMIN_EMAIL,
        'Error in Generate Invoice',
        errorTemplate(generateURL(req), error.message)
      );
    } else {
      console.log(error);
    }

    return res.status(500).json({
      error:
        "Oops! Something went wrong. We're working to fix it. Please try again shortly.",
    });
  }
};
