const express = require('express');
const { 
  getAllUsers, 
  getUserById, 
  updateUser, 
  deleteUser,
  verifySeller,
  unverifySeller
} = require('../controllers/adminController');
const { 
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  verifyProduct,
  unverifyProduct,
  getSellerProducts
} = require('../controllers/adminProductController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// User management routes
router.route('/users')
  .get(protect, adminOnly, getAllUsers);

router.route('/users/:id')
  .get(protect, adminOnly, getUserById)
  .put(protect, adminOnly, updateUser)
  .delete(protect, adminOnly, deleteUser);

// Seller verification routes
router.route('/users/:id/verify')
  .put(protect, adminOnly, verifySeller);

router.route('/users/:id/unverify')
  .put(protect, adminOnly, unverifySeller);

// Product management routes
router.route('/products')
  .get(protect, adminOnly, getAllProducts);

router.route('/products/:id')
  .get(protect, adminOnly, getProductById)
  .put(protect, adminOnly, updateProduct)
  .delete(protect, adminOnly, deleteProduct);

// Product verification routes
router.route('/products/:id/verify')
  .put(protect, adminOnly, verifyProduct);

router.route('/products/:id/unverify')
  .put(protect, adminOnly, unverifyProduct);

// Get seller's products
router.route('/sellers/:sellerId/products')
  .get(protect, adminOnly, getSellerProducts);

module.exports = router;