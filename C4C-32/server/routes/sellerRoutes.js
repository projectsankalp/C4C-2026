const express = require('express');
const router = express.Router();
const { protect, requireSeller } = require('../middleware/authMiddleware');
const {
  getDashboardStats,
  getSellerProducts,
  getSellerOrders,
  getSellerProfile,
} = require('../controllers/sellerController');

// All seller dashboard routes require protect and requireSeller
router.use(protect, requireSeller);

router.get('/dashboard', getDashboardStats);
router.get('/products', getSellerProducts);
router.get('/orders', getSellerOrders);
router.get('/profile', getSellerProfile);

module.exports = router;
