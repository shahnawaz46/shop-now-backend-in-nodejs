// internal
import { User } from "../../model/user.model.js";
import sendMail from "../../services/mail.service.js";
import { generateURL } from "../../utils/GenerateURL.js";
import { errorTemplate } from "../../template/ErrorMailTemplate.js";

import {
  deleteMediaOnImageKit,
  uploadMediaOnImageKit,
} from "../../services/imageKit.service.js";
import { getUserProfile } from "../../dtos/user.dto.js";

// controllers
export const userProfile = async (req, res) => {
  try {
    // returning logged in user personal details and address
    const user = await User.findOne({
      _id: req.data._id,
    });

    const userDetail = getUserProfile(user);

    return res.status(200).json({ userDetail });
  } catch (error) {
    // send error to email
    if (process.env.NODE_ENV === "production") {
      sendMail(
        process.env.ADMIN_EMAIL,
        "Error in Get User Profile",
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
      // if user have already uploaded the profile picture then first deleting
      if (userDetail.profilePicture.fileId) {
        await deleteMediaOnImageKit(userDetail.profilePicture.fileId);
      }

      // here i am uploading profile picture to ImageKit and getting url in res
      const image = await uploadMediaOnImageKit({
        file: req.file.buffer,
        fileName: req.file.originalname,
        folder: "/ShopNow_Profile",
        tags: ["shopnow", "profile pic", "image"],
        transformation: { pre: "quality: 80" },
        checks: `"file.size" < "1mb"`,
      });

      // then updating user model with profile picture url
      const result = await User.findByIdAndUpdate(
        { _id: req.data._id },
        {
          profilePicture: { URL: image.url, fileId: image.fileId },
        },
        { new: true }
      ).select("firstName lastName email phoneNo profilePicture location");

      const userDetails = {
        ...result._doc,
        profilePicture: result.profilePicture?.URL || null,
      };

      return res.status(200).json({
        msg: "Profile Pic Update Successfully",
        userDetails,
      });
    }
  } catch (error) {
    // send error to email
    if (process.env.NODE_ENV === "production") {
      sendMail(
        process.env.ADMIN_EMAIL,
        "Error in Update Profile Pic",
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
    const user = await User.findByIdAndUpdate(req.data._id, userDetail, {
      new: true,
    }).select("firstName lastName email phoneNo profilePicture location");

    const result = {
      ...user._doc,
      profilePicture: user.profilePicture?.URL || null,
    };

    return res
      .status(200)
      .json({ msg: "Profile Update Successfully", userDetail: result });
  } catch (error) {
    if (error.codeName == "DuplicateKey") {
      return res.status(400).json({ error: "This Email Already Exist" });
    }

    // send error to email
    if (process.env.NODE_ENV === "production") {
      sendMail(
        process.env.ADMIN_EMAIL,
        "Error in Update User Profile Details",
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
