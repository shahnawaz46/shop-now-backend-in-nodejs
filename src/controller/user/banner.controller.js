// internal
import { Banner } from "../../model/banner.model.js";
import sendMail from "../../services/mail.service.js";
import { generateURL } from "../../utils/GenerateURL.js";
import { errorTemplate } from "../../template/ErrorMailTemplate.js";
import { redisClient } from "../../config/redis.config.js";

export const getBanner = async (req, res) => {
  try {
    // checking banner is present in redis if yes then return cached banner data
    const cacheData = await redisClient.get("banner");
    if (cacheData) {
      return res.status(200).json(JSON.parse(cacheData));
    }

    const banners = await Banner.find({ show: true });

    if (!banners) {
      return res.status(404).json({ error: "Banner not Found" });
    }

    const computerBanner = [];
    const mobileBanner = [];

    // separate banner based on screen
    banners.forEach((banner) => {
      if (banner.screen === "computer") {
        computerBanner.push(banner.image.URL);
      } else {
        mobileBanner.push(banner.image.URL);
      }
    });

    // store banner data in redis so i don't have to fetch banner data from db on each request
    await redisClient.set(
      "banner",
      JSON.stringify({ computerBanner, mobileBanner })
    );

    return res.status(200).json({ computerBanner, mobileBanner });
  } catch (error) {
    // send error to email
    if (process.env.NODE_ENV === "production") {
      sendMail(
        process.env.ADMIN_EMAIL,
        "(Admin Panel) Error in Get Banner",
        errorTemplate(generateURL(req, "", true), error.message)
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
