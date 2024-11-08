import cloudinary from '../config/cloudinary.config.js';

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
