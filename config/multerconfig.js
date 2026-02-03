const multer = require("multer");
const path = require("path");
const crypto = require("crypto");

// disk storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/assets/uploads");
  },
  filename: function (req, file, cb) {
    crypto.randomBytes(16, function (err, hash) {
      if (err) {
        return cb(err);
      }
      cb(null, hash.toString("hex") + "-" + file.originalname);
    });
  },
});

// export upload  variable
const upload = multer({ storage: storage });

module.exports = upload;
