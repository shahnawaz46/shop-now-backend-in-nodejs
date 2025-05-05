import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      min: 3,
      max: 50,
    },
    mobileNumber: {
      type: Number,
      required: true,
      // trim: true,
    },
    pinCode: {
      type: Number,
      required: true,
      // trim: true,
    },
    locality: {
      type: String,
      required: true,
      trim: true,
      min: 10,
      max: 100,
    },
    address: {
      type: String,
      required: true,
      trim: true,
      min: 10,
      max: 100,
    },
    cityDistrictTown: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
    landmark: {
      type: String,
      min: 10,
      max: 100,
    },
    alternatePhone: {
      type: Number,
    },
    addressType: {
      type: String,
      required: true,
      enum: ['home', 'work'],
    },
  },
  { timestamps: true }
);

export const Address = mongoose.model('Address', addressSchema);
