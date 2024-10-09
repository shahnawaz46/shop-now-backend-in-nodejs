import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    phoneNo: {
      type: Number,
      required: true,
    },
    dob: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    profilePicture: {
      type: String,
      default: null,
    },
    location: {
      type: String,
      default: null,
    },
    lastLogin: [
      {
        date: Date,
        device: String,
        location: String,
      },
    ],
  },
  { timestamps: true }
);

// userSchema.pre('save', async function (next) {
//     if (this.isModified("password")) {
//         this.password = await bcrypt.hash(this.password, 12)
//         this.cpassword = await bcrypt.hash(this.cpassword, 12)
//     }
//     next()
// })

export const User = mongoose.model('User', userSchema);
