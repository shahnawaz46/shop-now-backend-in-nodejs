import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    address: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Address',
      required: true,
    },

    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
        },
        size: {
          type: String,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        qty: {
          type: Number,
          required: true,
        },
      },
    ],
    totalPrice: {
      type: Number,
      required: true,
    },
    orderStatus: {
      type: String,
      enum: [
        'pending',
        'order confirmed',
        'processing',
        'shipped',
        'delivered',
        'failed',
      ],
      default: 'pending',
    },
    orderDate: {
      type: Date,
      default: Date.now(),
    },
    deliveredDate: {
      type: Date,
      default: null,
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ['cod', 'card'],
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'success', 'failed'],
      default: 'pending',
    },
    paymentDetails: {
      type: Object, // for storing razorpay_payment_id, razorpay_order_id and razorpay_signature (if paymentMethod is card)
      default: {},
    },
  },
  { timestamps: true }
);

export const Order = mongoose.model('Order', orderSchema);
