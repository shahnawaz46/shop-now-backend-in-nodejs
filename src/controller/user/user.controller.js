import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// internal
import { User } from '../../model/user.model.js';
import { UserAddress } from '../../model/address.model.js';
import uploadImages from '../../utils/Cloudinary.js';

export const signup = async (req, res) => {
  const { first_name, last_name, email, phone_no, password, confirm_password } =
    req.body;

  try {
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

    // const user = new User({ firstName, lastName, email, phoneNo, password, cpassword })
    const user = await User.create({
      first_name,
      last_name,
      email,
      phone_no,
      password: hashPassword,
    });

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

    return res
      .status(200)
      .json({ msg: 'Signup Successfully', userId: user._id });
  } catch (err) {
    return res
      .status(500)
      .json({ error: 'Something Gone Wrong Please Try Again' });
  }
};

export const signin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const alreadyUser = await User.findOne({ email });
    if (alreadyUser && alreadyUser.role === 'user') {
      const passwordMatch = await bcrypt.compare(
        password,
        alreadyUser.password
      );

      if (passwordMatch) {
        const token = jwt.sign(
          { _id: alreadyUser._id, role: alreadyUser.role },
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
          .json({ msg: 'Login Successfully', userId: alreadyUser._id });
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
    const userDetail = await User.findOne({
      _id: req.data._id,
    }).select('first_name last_name email phone_no profile_picture location');
    const getUserAddress = await UserAddress.findOne({ userId: req.data._id });
    const address = getUserAddress ? getUserAddress.address : [];

    return res.status(200).json({ userDetail, address });
  } catch (err) {
    // console.log(err)
    return res
      .status(400)
      .json({ error: 'Something Gone Wrong Please Try Again' });
  }
};

export const updateProfilePic = async (req, res) => {
  try {
    const { imageBase64, userName } = req.body;

    let userDetail = await User.findOne({ _id: req.data._id });
    if (userDetail) {
      const imageUrl = await uploadImages(JSON.parse(imageBase64), userName);
      userDetail.profilePicture = imageUrl;

      const result = await User.findByIdAndUpdate(
        { _id: req.data._id },
        userDetail,
        { new: true }
      ).select('firstName lastName email phoneNo profilePicture location');
      return res.status(200).json({
        msg: 'Profile Pic Update Successfully',
        userDetails: result,
      });
    }
  } catch (err) {
    // console.log(err)
    return res
      .status(400)
      .json({ error: 'Something Gone Wrong Please Try Again' });
  }
};

export const editUserProfileDetail = async (req, res) => {
  const userDetail = req.body.userDetail;

  try {
    // if ((userDetail.phoneNo).toString().length != 10) {
    //     return res.status(400).json({ error: "Phone No Must Be 10 Digit Long" })
    // }
    const result = await User.findByIdAndUpdate(req.data._id, userDetail, {
      new: true,
    }).select('firstName lastName email phoneNo profilePicture location');
    // console.log(result)
    return res
      .status(200)
      .json({ msg: 'Profile Update Successfully', userDetail: result });
  } catch (err) {
    console.log(err);
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
