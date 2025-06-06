const multer = require("multer");

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "video/mp4",
    "video/webm",
    "video/quicktime",
  ];
  if (!allowedTypes.includes(file.mimetype)) {
    const error = new Error(
      "Format file tidak diizinkan. Hanya gambar atau video yang diperbolehkan."
    );
    error.status = 400;
    return cb(error, false);
  }
  cb(null, true);
};

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, 
  fileFilter,
});

module.exports = upload;