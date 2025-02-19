import cloudinary from '../config/cloudinary.config.js';

// for upload profile images/pictures
const uploadProfilePicturesOptions = (firstName, lastName) => {
  return {
    upload_preset: 'shop-now-profile-images',
    public_id: `user_${firstName}_${lastName}_${Date.now()}`,
    allowed_formats: ['png', 'jpg', 'jpeg', 'webp', 'ico', 'avif'],
  };
};

export const uploadProfilePictures = async (image, firstName, lastName) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      image,
      uploadProfilePicturesOptions(firstName, lastName),
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

// for upload product images/pictures
const uploadProductPicturesOptions = (userName) => {
  return {
    upload_preset: 'shop-now-product-images',
    // public_id: `${userName}/profile-pic`,
    allowed_formats: ['png', 'jpg', 'jpeg', 'webp', 'ico', 'avif', 'svg'],
  };
};

export const uploadProductPictures = async (image, userName) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      image,
      uploadProductPicturesOptions(userName),
      (error, result) => {
        if (result && result.secure_url) {
          // console.log('Result: ', result);
          return resolve({
            img: result.secure_url,
            public_id: result.public_id,
          });
        }
        if (error) {
          console.log('Error: ', error);
          return reject(error.message);
        }
      }
    );
  });
};

export const deleteProductPictures = async (productImages) => {
  // delete the image from Cloudinary
  try {
    productImages &&
      productImages.length > 0 &&
      productImages.forEach(
        async (image) => await cloudinary.uploader.destroy(image.public_id) // Use the public_id stored in the product
      );
  } catch (err) {
    throw new Error('Problem with deleting product pictures please try again');
  }
};

// for upload banner images/pictures
const uploadBannerPicturesOptions = {
  upload_preset: 'shop-now-banner-images',
  allowed_formats: ['png', 'jpg', 'jpeg', 'webp', 'ico', 'avif'],
};

export const uploadBannerPicture = async (bannerImage) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      bannerImage,
      uploadBannerPicturesOptions,
      (error, result) => {
        if (result && result.secure_url) {
          return resolve({
            URL: result.secure_url,
            public_id: result.public_id,
          });
        }
        if (error) {
          console.log('uploadBannerPictures Error: ', error);
          return reject(error.message);
        }
      }
    );
  });
};

export const deleteBannerPicture = async (public_id) => {
  try {
    await cloudinary.uploader.destroy(public_id);
  } catch (err) {
    throw new Error('Problem with deleting banner picture please try again');
  }
};
