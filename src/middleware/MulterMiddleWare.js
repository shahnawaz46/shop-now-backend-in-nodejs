const multer = require("multer");
const shortid = require("shortid");
const path = require("path")


const multerMiddleWare = (folderName) => {
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, path.join((__dirname), '../../', `./public/${folderName}/`))
        },
        filename: function (req, file, cb) {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
            cb(null, shortid.generate() + '-' + file.originalname)
        }
    })

    return multer({ storage })
}

module.exports = multerMiddleWare;