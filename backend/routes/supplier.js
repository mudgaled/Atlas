const express = require('express');
const { 
  getSuppliers, 
  getSupplierById, 
  getSupplierVerification 
} = require('../controllers/supplierController');
const { protect, authorize } = require('../middleware/auth');
const router = express.Router();

// @route   GET /api/suppliers
router.route('/')
  .get(getSuppliers);

// @route   GET /api/suppliers/:id
router.route('/:id')
  .get(getSupplierById);

// @route   GET /api/suppliers/:id/verification
router.route('/:id/verification')
  .get(getSupplierVerification);

module.exports = router;