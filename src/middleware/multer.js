import multer from "multer";

// Temporary Storage
// const storage = multer.diskStorage({});
const storage = multer.memoryStorage();

const upload = multer({ storage, limits: { fileSize: 2 * 1024 * 1024 } });

export default upload;
