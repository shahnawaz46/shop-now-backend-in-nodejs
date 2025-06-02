import imageKit from "../config/imagekit.config.js";

export const uploadMediaOnImageKit = async (options) => {
  return new Promise((resolve, reject) => {
    imageKit.upload(
      {
        ...options,
      },
      function (error, result) {
        if (result) {
          resolve(result);
        }
        if (error) {
          reject(error);
        }
      }
    );
  });
};

export const deleteMediaOnImageKit = async (fileId) => {
  return new Promise((resolve, reject) => {
    imageKit.deleteFile(fileId, function (error, result) {
      if (result) {
        resolve(result);
      }
      if (error) {
        reject(error);
      }
    });
  });
};

export const deleteBulkMediaOnImageKit = async (fileIds) => {
  return new Promise((resolve, reject) => {
    imageKit.bulkDeleteFiles(fileIds, function (error, result) {
      if (result) {
        resolve(result);
      }
      if (error) {
        reject(error);
      }
    });
  });
};
