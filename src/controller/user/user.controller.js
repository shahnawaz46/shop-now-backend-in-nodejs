import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// internal
import { User } from '../../model/user.model.js';
import { Address } from '../../model/address.model.js';
import { uploadProfilePictures } from '../../utils/Cloudinary.js';
import { Otp } from '../../model/otp.model.js';
import { sendMail } from '../../utils/SendMail.js';
import {
  registrationVerificationEmail,
  thankForRegistration,
} from '../../utils/MailTemplate.js';

export const signup = async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    phoneNo,
    dob,
    password,
    confirm_password,
  } = req.body;

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

    // generating 6 digit otp
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
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ error: 'Something Gone Wrong Please Try Again' });
  }
};

export const otpVerification = async (req, res) => {
  const { otp, email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ error: 'User not found please singup again' });
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
  } catch (err) {
    return res
      .status(500)
      .json({ error: 'Something went wrong please try again after some time' });
  }
};
export const signin = async (req, res) => {
  const { email, password } = req.body;

  try {
    // role can be user and admin
    const user = await User.findOne({ email });
    if (user && user.role === 'user') {
      // comparing login password with hash password
      const passwordMatch = await bcrypt.compare(password, user.password);

      // after password matched then generating token to store in cookie for authentication/verfication.
      if (passwordMatch) {
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
      }

      return res.status(401).json({ error: 'Invalid credential' });
    }

    return res
      .status(404)
      .json({ error: 'No Account Found Please Signup First' });
  } catch (err) {
    return res
      .status(500)
      .json({ error: 'Something Gone Wrong Please Try Again' });
  }
};

export const userProfile = async (req, res) => {
  try {
    // returning logged in user personal details and address
    const userDetail = await User.findOne({
      _id: req.data._id,
    }).select('firstName lastName email phoneNo profilePicture location');
    const address = await Address.find({ userId: req.data._id });

    return res.status(200).json({ userDetail, address });
  } catch (err) {
    console.log(err);
    return res
      .status(400)
      .json({ error: 'Something Gone Wrong Please Try Again' });
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
  } catch (err) {
    return res
      .status(400)
      .json({ error: 'Something Gone Wrong Please Try Again' });
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
  } catch (err) {
    if (err.codeName == 'DuplicateKey') {
      return res.status(400).json({ error: 'This Email Already Exist' });
    }
    return res
      .status(400)
      .json({ error: 'Something Gone Wrong Please Try Again' });
  }
};

export const signout = (req, res) => {
  res.clearCookie('_f_id');
  return res.status(200).json({ msg: 'Signout Successfully' });
};
