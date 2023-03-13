const multer = require("multer");
const util = require("util");
const path = require("path");
const fs = require("fs");
const ImageSchema = require("../models/imageSchema");
const sharp = require("sharp");

// Check File Type
function checkFileType(file, cb) {
  // Allowed ext
  const filetypes = /jpeg|jpg|png|gif/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
      return cb(null, true);
  } else {
      cb('Error: Images Only!');
  }
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

// Init Upload
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50000000
  },
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  }
});

const uploadFile = upload.single("file");

const uploadImage = async(req, res, next) => {
  console.log("CREATING");
  uploadFile(req, res, err => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_UNEXPECTED_FILE") {
        return res.send("Too many files to upload");
      }
    } else if (err) {
      return res.send(err);
    }

    console.log("CORRECTLY UPLOADED");
    next();
  });
};

const resizeImage = async (req, res, next) => {
  console.log("RESIZING");
  if (!req.file) return next();

  const newFilename = req.file.originalname;
    
  sharp(fs.readFileSync(path.join(__dirname, "../../", "/uploads/", req.file.filename)))
    .resize(640, 320)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`uploads/${newFilename}`);

  console.log("CORRECTLY RESIZED");
  next();
};

const uploadMongo = async (req, res, next) => {
  console.log("UPLOADING TO MONGODB");
    const obj = {
      name: req.body.name.toLowerCase(),
      desc: req.body.desc,
      url: `uploads/${req.file.originalname}`,
      img: {
        data: fs.readFileSync(path.join(__dirname, "../../", "/uploads/", req.file.filename)),
        contentType: req.file.mimetype
      }
    };

    await ImageSchema.create(obj, (err, item) => {
      if (err) {
        console.log(err);
      } else {
        item.save();

        console.log("UPLOADED TO MONGODB");
        return res.send("File has been uploaded.");
      }
    });
}


module.exports = {
  uploadImage: uploadImage,
  resizeImage: resizeImage,
  uploadMongo: uploadMongo
};