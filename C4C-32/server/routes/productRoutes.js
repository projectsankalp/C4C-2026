const express = require('express');
const router  = express.Router();

const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
} = require('../controllers/productController');

const { protect, requireSeller } = require('../middleware/authMiddleware');

// Public routes
router.get('/',            getProducts);
router.get('/categories',  getCategories);
router.get('/:id',         getProductById);

// Seller-only routes
router.post(   '/',    protect, requireSeller, createProduct);
router.patch(  '/:id', protect, requireSeller, updateProduct);
router.delete( '/:id', protect, requireSeller, deleteProduct);

module.exports = router;
