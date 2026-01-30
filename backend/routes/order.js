const express = require('express');
const { 
  createOrder,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  getMyOrders,
  getMySellerOrders,
  getOrders
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');
const router = express.Router();

router.route('/').post(protect, createOrder).get(protect, authorize('admin'), getOrders);
router.route('/myorders').get(protect, getMyOrders);
router.route('/mysellerorders').get(protect, authorize('seller'), getMySellerOrders);
router.route('/:id').get(protect, getOrderById);
router.route('/:id/pay').put(protect, updateOrderToPaid);
router.route('/:id/deliver').put(protect, authorize('seller', 'admin'), updateOrderToDelivered);

module.exports = router;