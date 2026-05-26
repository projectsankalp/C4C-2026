const multer = require('multer');

// Store files in memory as buffers so we can stream/upload them to Supabase Storage
const storage = multer.memoryStorage();

const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const audioFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('audio/') || file.mimetype === 'application/octet-stream') {
    // Support octet-stream as audio files (common in web recordings)
    cb(null, true);
  } else {
    cb(new Error('Only audio files are allowed!'), false);
  }
};

const uploadProduct = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: imageFilter
}).array('images', 5); // Max 5 images

const uploadAvatar = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: imageFilter
}).single('avatar');

const uploadAudio = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: audioFilter
}).single('audio');

module.exports = {
  uploadProduct,
  uploadAvatar,
  uploadAudio
};
