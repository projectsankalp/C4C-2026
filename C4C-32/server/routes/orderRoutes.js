const express = require('express');
const router  = express.Router();

const { placeOrder, getMyOrders, getOrderById, updateOrderStatus } = require('../controllers/orderController');
const { protect, requireSeller } = require('../middleware/authMiddleware');

// All order routes require authentication
router.use(protect);

router.post(  '/',                  placeOrder);
router.get(   '/',                  getMyOrders);
router.get(   '/:id',              getOrderById);
router.patch( '/:id/status',       requireSeller, updateOrderStatus);

module.exports = router;
