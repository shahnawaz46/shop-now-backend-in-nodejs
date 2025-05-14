import cloudinary from "../config/cloudinary.config.js";

export const uploadMediaOnCloudinary = (file, options = {}) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(file, options, (error, result) => {
      if (result && result.secure_url) {
        resolve({ secure_url: result.secure_url, public_id: result.public_id });
      }
      if (error) {
        reject(error.message | "Cloudinary upload failed");
      }
    });
  });
};

export const deleteMediaOnCloudinary = (public_id, options) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(public_id, (options = {}), (error, result) => {
      // console.log("deleteMediaOnCloudinary:", error, result);
      if (result) {
        resolve(result);
      }

      if (error) {
        reject(error);
      }
    });
  });
};
