import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// internal
import { User } from '../../model/user.model.js';
import { Address } from '../../model/address.model.js';
import { uploadProfilePictures } from '../../services/cloudinary.service.js';
import { Otp } from '../../model/otp.model.js';
import sendMail from '../../services/mail.service.js';
import { generateURL } from '../../utils/GenerateURL.js';
import { errorTemplate } from '../../template/ErrorMailTemplate.js';
import {
  registrationVerificationEmail,
  thankForRegistration,
} from '../../template/RegistrationMailTemplate.js';

export const signup = async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    phoneNo,
    dob,
    password,
    confirm_password,
    device,
    browser,
  } = req.body;

  const ipAddress =
    req?.headers?.['x-forwarded-for'] || req?.socket?.remoteAddress || req?.ip;

  try {
    const isUserAlreadyExist = await User.findOne({ email });

    // if user already exists and email is also verified then return this error
    if (isUserAlreadyExist && isUserAlreadyExist.isEmailVerified) {
      return res
        .status(400)
        .json({ error: 'User Already Exist Please Signin' });
    }

    if (password !== confirm_password) {
      return res.status(400).json({ error: 'Password do not match' });
    }

    // hash the password by using bcrypt to store inside database
    const hashPassword = await bcrypt.hash(password, 10);

    // generating 4 digit otp
    const otp = Math.ceil(1000 + Math.random() * 9182);

    // if user exists but email is not verified then overwriting the document
    if (isUserAlreadyExist && !isUserAlreadyExist.isVerified) {
      const userUpdated = await User.findOneAndUpdate(
        { email },
        {
          firstName,
          lastName,
          phoneNo,
          dob,
          password: hashPassword,
          lastLogin: { date: Date.now(), device, browser, ipAddress },
        },
        { new: true }
      );

      // after the account is updated now sending otp to the mail
      await sendMail(
        email,
        'Account Verification',
        registrationVerificationEmail(otp)
      );

      // then updating OTP document
      await Otp.findOneAndUpdate(
        { user: userUpdated._id },
        { otp },
        { upsert: true } // if document exist then update else create new document
      );

      return res
        .status(200)
        .json({ msg: 'Signup Successfully', email: userUpdated.email });
    }

    // if user is not exists then creating new document
    const newUser = await User.create({
      firstName,
      lastName,
      email,
      phoneNo,
      dob,
      password: hashPassword,
      lastLogin: { date: Date.now(), device, browser, ipAddress },
    });

    // after the account is created now sending otp to the mail
    await sendMail(
      email,
      'Account Verification',
      registrationVerificationEmail(otp)
    );

    // and creating otp document
    await Otp.create({ user: newUser._id, otp });

    return res
      .status(200)
      .json({ msg: 'Signup Successfully', email: newUser.email });
  } catch (error) {
    // send error to email
    if (process.env.NODE_ENV === 'production') {
      sendMail(
        process.env.ADMIN_EMAIL,
        'Error in Signup',
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

export const otpVerification = async (req, res) => {
  const { otp, email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ error: 'User not found please signup again' });
    }

    const isOtpExists = await Otp.findOne({ user: user._id });
    if (!isOtpExists) {
      return res.status(400).json({ error: 'Invalid OTP or OTP expired' });
    }

    const now = new Date();

    // If now time is more than otpExipreAt time then it means OTP is expired so i am deleting OTP document from database
    if (now > user.otpExpiresAt) {
      await Otp.findByIdAndDelete(isOtpExists._id);

      return res.status(400).json({ error: 'OTP expired' });
    }

    if (isOtpExists.otp !== Number(otp)) {
      return res
        .status(400)
        .json({ error: 'The OTP you entered is incorrect' });
    }

    // if otp matched then deleting OTP document and updating USER document
    await Otp.findByIdAndDelete(isOtpExists._id);

    user.isEmailVerified = true;
    await user.save();

    // after otp verified successfully, generating token
    const token = jwt.sign(
      { _id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    // if origin is same (means if client and server domain is same) then sameSite = lax, otherwise sameSite = none
    res.cookie('_f_id', token, {
      httpOnly: true,
      sameSite: 'none',
      secure: true,
    });

    res.status(200).json({ userId: user._id });

    await sendMail(
      email,
      'Registration Successfully',
      thankForRegistration(`${user.firstName} ${user.lastName}`)
    );
  } catch (error) {
    // send error to email
    if (process.env.NODE_ENV === 'production') {
      sendMail(
        process.env.ADMIN_EMAIL,
        'Error in OTP Verification',
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

export const signin = async (req, res) => {
  const { email, password, browser, device } = req.body;

  const ipAddress =
    req?.headers?.['x-forwarded-for'] || req?.socket?.remoteAddress || req?.ip;

  try {
    // role can be user and admin
    const user = await User.findOne({ email });

    // if user not found
    if (!user) {
      return res.status(404).json({ error: 'User not found please Register' });
    }

    // comparing login password with hash password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ error: 'Wrong credentials' });
    }

    // save user login info
    user.lastLogin = { date: Date.now(), device, browser, ipAddress };
    await user.save();

    // if user email didn't verified then returning this error for email verification
    if (!user.isEmailVerified) {
      // generating 4 digit otp
      const otp = Math.ceil(1000 + Math.random() * 9182);

      await sendMail(
        email,
        'Account Verification',
        registrationVerificationEmail(otp)
      );

      // if document exist then update else create new document
      await Otp.findOneAndUpdate({ user: user._id }, { otp }, { upsert: true });

      return res
        .status(400)
        .json({ error: 'User not verified, Please verify' });
    }

    const token = jwt.sign(
      { _id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    // if the origin is same (means if client and server domain are same) then sameSite = lax, otherwise sameSite = none
    res.cookie('_f_id', token, {
      httpOnly: true,
      sameSite: 'none',
      secure: true,
    });

    return res
      .status(200)
      .json({ msg: 'Login Successfully', userId: user._id });
  } catch (error) {
    // send error to email
    if (process.env.NODE_ENV === 'production') {
      sendMail(
        process.env.ADMIN_EMAIL,
        'Error in Signin',
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

export const userProfile = async (req, res) => {
  try {
    // returning logged in user personal details and address
    const userDetail = await User.findOne({
      _id: req.data._id,
    }).select('firstName lastName email phoneNo profilePicture location');
    const address = await Address.find({ userId: req.data._id }).select(
      'name mobileNumber pinCode state address locality cityDistrictTown landmark alternatePhone addressType'
    );

    return res.status(200).json({ userDetail, address });
  } catch (error) {
    // send error to email
    if (process.env.NODE_ENV === 'production') {
      sendMail(
        process.env.ADMIN_EMAIL,
        'Error in Get User Profile',
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

export const updateProfilePic = async (req, res) => {
  try {
    // first checking user is exist or not
    let userDetail = await User.findOne({ _id: req.data._id });
    if (userDetail && req.file) {
      // here i am uploading profile picture to cloudinary and getting url in res
      const imageUrl = await uploadProfilePictures(
        req.file.path,
        userDetail?.firstName,
        userDetail?.lastName
      );

      // then updating user model with profile picture url
      const result = await User.findByIdAndUpdate(
        { _id: req.data._id },
        { profilePicture: imageUrl },
        { new: true }
      ).select('firstName lastName email phoneNo profilePicture location');

      return res.status(200).json({
        msg: 'Profile Pic Update Successfully',
        userDetails: result,
      });
    }
  } catch (error) {
    // send error to email
    if (process.env.NODE_ENV === 'production') {
      sendMail(
        process.env.ADMIN_EMAIL,
        'Error in Update Profile Pic',
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

export const editUserProfileDetail = async (req, res) => {
  const userDetail = req.body.userDetail;

  try {
    const result = await User.findByIdAndUpdate(req.data._id, userDetail, {
      new: true,
    }).select('firstName lastName email phoneNo profilePicture location');

    return res
      .status(200)
      .json({ msg: 'Profile Update Successfully', userDetail: result });
  } catch (error) {
    if (error.codeName == 'DuplicateKey') {
      return res.status(400).json({ error: 'This Email Already Exist' });
    }

    // send error to email
    if (process.env.NODE_ENV === 'production') {
      sendMail(
        process.env.ADMIN_EMAIL,
        'Error in Update User Profile Details',
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

export const signout = (req, res) => {
  res.clearCookie('_f_id');
  return res.status(200).json({ msg: 'Signout Successfully' });
};
