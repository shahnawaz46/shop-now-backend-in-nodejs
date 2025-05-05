import multer from 'multer';

// Temporary Storage
const storage = multer.diskStorage({});

const upload = multer({ storage, limits: { fileSize: 2000000 } });

export default upload;
