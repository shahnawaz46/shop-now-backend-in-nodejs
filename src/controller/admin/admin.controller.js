import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// internal
import { User } from '../../model/user.model.js';
import sendMail from '../../services/mail.service.js';
import { errorTemplate } from '../../template/ErrorMailTemplate.js';
import { generateURL } from '../../utils/GenerateURL.js';

export const signup = async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    phoneNo,
    password,
    confirm_password,
    location,
    role,
  } = req.body;

  try {
    // if user is already exsit then return error with messages
    const alreadyUser = await User.findOne({ email });
    if (alreadyUser) {
      return res
        .status(409)
        .json({ error: 'User Already Exist Please Signin' });
    }

    if (password !== confirm_password) {
      return res
        .status(400)
        .json({ error: 'Password and Confirm Password not Matched' });
    }

    // hasing the password
    const hashPassword = await bcrypt.hash(password, 12);

    await User.create({
      firstName,
      lastName,
      email,
      phoneNo,
      password: hashPassword,
      location,
      role,
    });

    return res.status(200).json({ msg: 'Signup Successfully' });
  } catch (error) {
    // send error to email
    if (process.env.NODE_ENV === 'production') {
      sendMail(
        process.env.ADMIN_EMAIL,
        '(Admin Panel) Error in Signup',
        errorTemplate(generateURL(req, '', true), error.message)
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
    const admin = await User.findOne({ email });

    if (!admin) {
      return res.status(404).json({ error: 'User not found please Register' });
    }

    if (admin.role !== 'admin') {
      return res.status(404).json({ error: "You don't have permission" });
    }

    // comparing login password with hash password
    const isPasswordCorrect = await bcrypt.compare(password, admin.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ error: 'Wrong credentials' });
    }

    // save user login info
    admin.lastLogin = { date: Date.now(), device, browser, ipAddress };
    await admin.save();

    const token = jwt.sign(
      { _id: admin._id, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.cookie('_a_tn', token, {
      httpOnly: true,
      sameSite: 'none',
      secure: true,
    });

    return res.status(200).json({
      msg: 'Login Successfully',
      details: {
        firstName: admin?.firstName,
        lastName: admin?.lastName,
        email: admin?.email,
        profilePicture: admin?.profilePicture,
        location: admin?.location,
        phoneNo: admin?.phoneNo,
      },
    });
  } catch (error) {
    // send error to email
    if (process.env.NODE_ENV === 'production') {
      sendMail(
        process.env.ADMIN_EMAIL,
        '(Admin Panel) Error in Signin',
        errorTemplate(generateURL(req, '', true), error.message)
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
  res.clearCookie('_a_tn');
  return res.status(200).json({ msg: 'Signout Successfully' });
};

export const updatePassword = async (req, res) => {
  const { email, newPassword } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ error: 'User not found! Please contact with Admin' });
    }

    if (user.role !== 'admin') {
      return res
        .status(404)
        .json({ error: 'User not found! Please contact with Admin' });
    }

    const hashPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashPassword;
    await user.save();

    return res.status(200).json({ msg: 'Updated updated successfully' });
  } catch (error) {
    // send error to email
    if (process.env.NODE_ENV === 'production') {
      sendMail(
        process.env.ADMIN_EMAIL,
        'Error in Update Password',
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

    return res.status(200).json({ details: userDetail });
  } catch (error) {
    // send error to email
    if (process.env.NODE_ENV === 'production') {
      sendMail(
        process.env.ADMIN_EMAIL,
        '(Admin Panel) Error in Profile',
        errorTemplate(generateURL(req, '', true), error.message)
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
