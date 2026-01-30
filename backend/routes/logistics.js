const express = require('express');
const { 
  getLogisticsInfo, 
  planShipment, 
  getPortInfo 
} = require('../controllers/logisticsController');
const { protect, authorize } = require('../middleware/auth');
const router = express.Router();

// @route   GET /api/logistics
router.route('/')
  .get(getLogisticsInfo)
  .post(protect, planShipment); // Only authenticated users can plan shipments

// @route   GET /api/logistics/ports/:portName
router.route('/ports/:portName')
  .get(getPortInfo);

module.exports = router;