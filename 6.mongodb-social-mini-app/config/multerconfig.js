const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

//disk storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images/upload'); 
  },
  filename: function (req, file, cb) {
    crypto.randomBytes(16, (err, buffer) => {
      if (err) {
        return cb(err);
      }
      // Use the current timestamp and original file name to create a unique file name
      const fileName = Date.now() + '-' + buffer.toString('hex') + path.extname(file.originalname);
      cb(null, fileName);
    });
  }
});

//upload configuration
const upload = multer({ storage: storage });

//export upload configuration
module.exports = upload;