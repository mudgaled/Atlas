const express = require('express');
const { getPlatformStats } = require('../controllers/statsController');
const router = express.Router();

// @route   GET /api/stats
router.route('/').get(getPlatformStats);

module.exports = router;