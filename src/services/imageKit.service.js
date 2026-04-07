import imageKit from "../config/imagekit.config.js";

export const uploadMediaOnImageKit = async (options) => {
  try {
    const file = await imageKit.files.upload({
      ...options,
    });
    return file;
  } catch (err) {
    console.log("uploadMediaOnImageKit Error: ", err);
  }
};

export const deleteMediaOnImageKit = async (fileId) => {
  try {
    await imageKit.files.delete(fileId);
  } catch (err) {
    console.log("deleteMediaOnImageKit Error: ", err);
  }
};

export const deleteBulkMediaOnImageKit = async (fileIds) => {
  try {
    await imageKit.files.bulk.delete({ fileIds });
  } catch (err) {
    console.log("deleteBulkMediaOnImageKit Error: ", err);
  }
};
