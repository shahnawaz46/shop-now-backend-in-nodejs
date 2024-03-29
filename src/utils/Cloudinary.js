import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const options = (userName) => {
  return {
    upload_preset: 'fuzicon-profile-pic',
    public_id: `${userName}/profile-pic`,
    allowed_formats: ['png', 'jpg', 'jpeg', 'svg', 'webp', 'ico'],
  };
};

const uploadImages = async (image, userName) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(image, options(userName), (error, result) => {
      if (result && result.secure_url) {
        // console.log("Result: ",result)
        return resolve(result.secure_url);
      }
      if (error) {
        // console.log("Error: ",error)
        return reject(error.message);
      }
    });
  });
};

const uploadProductPicturesOptions = (userName) => {
  return {
    upload_preset: 'shop-now-product-images',
    // public_id: `${userName}/profile-pic`,
    allowed_formats: ['png', 'jpg', 'jpeg', 'webp', 'ico', 'avif'],
  };
};

export const uploadProductPictures = async (image, userName) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      image,
      uploadProductPicturesOptions(userName),
      (error, result) => {
        if (result && result.secure_url) {
          // console.log("Result: ",result)
          return resolve(result.secure_url);
        }
        if (error) {
          // console.log("Error: ",error)
          return reject(error.message);
        }
      }
    );
  });
};

export default uploadImages;
