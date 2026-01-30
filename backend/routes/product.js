const express = require('express');
const { 
  getProducts, 
  getProductById, 
  createProduct, 
  updateProduct, 
  deleteProduct,
  getMyProducts
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');
const router = express.Router();

router.route('/').get(getProducts).post(protect, authorize('seller'), createProduct);
router.route('/mine').get(protect, authorize('seller'), getMyProducts);
router.route('/:id').get(getProductById).put(protect, authorize('seller'), updateProduct).delete(protect, authorize('seller'), deleteProduct);

module.exports = router;