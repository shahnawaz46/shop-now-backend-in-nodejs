import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    otp: {
      type: Number,
      default: null,
    },
    createdAt: {
      type: Date,
      expires: 600,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export const Otp = mongoose.model('Otp', otpSchema);
