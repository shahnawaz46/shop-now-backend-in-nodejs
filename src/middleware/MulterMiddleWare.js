import multer from 'multer';
import shortid from 'shortid';
import path from 'path';

// const storage = multer.memoryStorage()

const multerMiddleWare = (folderName) => {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.join(__dirname, '../../', `./public/${folderName}/`));
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, shortid.generate() + '-' + file.originalname);
    },
  });

  return multer({ storage });
};

export default multerMiddleWare;
