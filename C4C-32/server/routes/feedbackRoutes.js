const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getProductFeedback,
  getSellerFeedback,
  createFeedback,
  updateFeedback,
  deleteFeedback,
} = require('../controllers/feedbackController');

// Public endpoints to read reviews
router.get('/product/:productId', getProductFeedback);
router.get('/seller/:sellerId', getSellerFeedback);

// Protected endpoints for submitting/managing reviews
router.post('/', protect, createFeedback);
router.route('/:id')
  .patch(protect, updateFeedback)
  .delete(protect, deleteFeedback);

module.exports = router;
