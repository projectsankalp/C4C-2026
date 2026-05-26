const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} = require('../controllers/cartController');

// All cart operations require authentication
router.use(protect);

router.route('/')
  .get(getCart)
  .post(addToCart);

router.delete('/clear', clearCart);

router.route('/:id')
  .patch(updateCartItem)
  .delete(removeCartItem);

module.exports = router;
