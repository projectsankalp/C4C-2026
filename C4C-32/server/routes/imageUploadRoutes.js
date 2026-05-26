const express = require('express');
const router = express.Router();
const { protect, requireSeller } = require('../middleware/authMiddleware');
const { uploadProduct, uploadAvatar, uploadAudio } = require('../middleware/uploadMiddleware');
const { uploadProductImage, uploadProfileAvatar, uploadAudioFile } = require('../services/storageService');
const asyncHandler = require('../utils/asyncHandler');

/**
 * POST /api/upload/product-image
 * Protected — seller only. Max 5 images.
 * Returns array of public URLs.
 */
router.post('/product-image', protect, requireSeller, uploadProduct, asyncHandler(async (req, res, next) => {
  const files = req.files;
  if (!files || files.length === 0) {
    res.status(400);
    return next(new Error('No files uploaded. Ensure field name is "images".'));
  }

  const urls = [];
  const productId = req.body.productId || 'temp';

  for (const file of files) {
    const url = await uploadProductImage(
      req.user.id,
      productId,
      file.buffer,
      file.mimetype,
      file.originalname
    );
    urls.push(url);
  }

  res.status(200).json({ urls });
}));

/**
 * POST /api/upload/avatar
 * Protected — logged-in users. Single file.
 * Returns public URL.
 */
router.post('/avatar', protect, uploadAvatar, asyncHandler(async (req, res, next) => {
  const file = req.file;
  if (!file) {
    res.status(400);
    return next(new Error('No file uploaded. Ensure field name is "avatar".'));
  }

  const url = await uploadProfileAvatar(
    req.user.id,
    file.buffer,
    file.mimetype,
    file.originalname
  );

  res.status(200).json({ url });
}));

/**
 * POST /api/upload/audio
 * Protected — logged-in users. Single file.
 * Returns public URL.
 */
router.post('/audio', protect, uploadAudio, asyncHandler(async (req, res, next) => {
  const file = req.file;
  if (!file) {
    res.status(400);
    return next(new Error('No file uploaded. Ensure field name is "audio".'));
  }

  const url = await uploadAudioFile(
    req.user.id,
    file.buffer,
    file.mimetype,
    file.originalname
  );

  res.status(200).json({ url });
}));

module.exports = router;
