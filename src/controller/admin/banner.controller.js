// internal
import { Banner } from '../../model/banner.model.js';
import sendMail from '../../services/mail.service.js';
import { generateURL } from '../../utils/GenerateURL.js';
import { errorTemplate } from '../../template/ErrorMailTemplate.js';
import {
  deleteBannerPicture,
  uploadBannerPicture,
} from '../../services/cloudinary.service.js';
import { redisClient } from '../../database/redis.database.js';

export const addBanner = async (req, res) => {
  try {
    const { title, show, screen } = req.body;

    if (!title || !show || !screen || !req.file) {
      return res.status(400).json({ error: 'All fields requried' });
    }

    const image = await uploadBannerPicture(req.file.path);

    const banner = await Banner.create({ title, show, screen, image });

    // whenever admin add banner to the database, then i deleting the banner data from Redis.
    await redisClient.del('banner');

    return res.status(201).json({ banner });
  } catch (error) {
    // send error to email
    if (process.env.NODE_ENV === 'production') {
      sendMail(
        process.env.ADMIN_EMAIL,
        '(Admin Panel) Error in Add Banner',
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

export const getBanner = async (req, res) => {
  try {
    const banners = await Banner.find({});

    if (!banners) {
      return res.status(404).json({ error: 'Banner not Found' });
    }

    const computerBanner = [];
    const mobileBanner = [];

    // separate banner based on screen
    banners.forEach((banner) => {
      if (banner.screen === 'computer') {
        computerBanner.push(banner);
      } else {
        mobileBanner.push(banner);
      }
    });

    return res.status(200).json({ computerBanner, mobileBanner });
  } catch (error) {
    // send error to email
    if (process.env.NODE_ENV === 'production') {
      sendMail(
        process.env.ADMIN_EMAIL,
        '(Admin Panel) Error in Get Banner',
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

export const deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.query._id);
    if (!banner) {
      return res
        .status(404)
        .json({ error: 'Banner not found please check again' });
    }

    // first i am deleting banner picture from cloudinary
    await deleteBannerPicture(banner.image.public_id);

    // then i am deleting banner collection from mongodb
    await Banner.findByIdAndDelete(banner._id);

    // whenever admin delete banner from the database, then i am also deleting the banner data from Redis.
    await redisClient.del('banner');

    return res.status(200).json({ message: 'Banner Deleted Successfully' });
  } catch (error) {
    // send error to email
    if (process.env.NODE_ENV === 'production') {
      sendMail(
        process.env.ADMIN_EMAIL,
        '(Admin Panel) Error in Delete Banner',
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

export const updateBannerVisibility = async (req, res) => {
  const { _id, show } = req.body;
  try {
    const banner = await Banner.findById(_id);
    if (!banner) {
      return res
        .status(404)
        .json({ error: 'Banner not found please check again' });
    }

    banner.show = show;
    // updating show field
    await banner.save();

    // whenever admin updates the banner visibility in the database, then i am deleting the banner data from Redis.
    await redisClient.del('banner');

    return res.status(200).json({ message: 'Banner Updated Successfully' });
  } catch (error) {
    // send error to email
    if (process.env.NODE_ENV === 'production') {
      sendMail(
        process.env.ADMIN_EMAIL,
        '(Admin Panel) Error in Update Banner Visibility',
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

export const editBanner = async (req, res) => {
  const bannerValue = req.body;
  try {
    await { Banner }.findByIdAndUpdate({ _id: bannerValue._id }, bannerValue, {
      new: true,
    });
    return res.status(200).json({ message: 'Banner Edited Successfully' });
  } catch (error) {
    // send error to email
    if (process.env.NODE_ENV === 'production') {
      sendMail(
        process.env.ADMIN_EMAIL,
        '(Admin Panel) Error in Add Banner',
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
