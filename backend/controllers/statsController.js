const Product = require('../models/Product');
const User = require('../models/User');
const Order = require('../models/Order');

// @desc    Get platform statistics
// @route   GET /api/stats
// @access  Public
const getPlatformStats = async (req, res) => {
  try {
    // Count verified suppliers
    const verifiedSuppliersCount = await User.countDocuments({
      role: 'seller',
      'verification.isVerified': true
    });

    // Count total buyers
    const buyersCount = await User.countDocuments({ role: 'buyer' });

    // Count total products
    const productsCount = await Product.countDocuments();

    // Count total countries (from product locations)
    const uniqueCountries = await Product.distinct('location.country', {
      'location.country': { $exists: true, $ne: null }
    });
    const countriesCount = uniqueCountries.length;

    // Calculate approximate trade volume (sum of all order prices)
    const totalOrders = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalVolume: { $sum: '$totalPrice' },
          orderCount: { $sum: 1 }
        }
      }
    ]);

    const tradeVolume = totalOrders.length > 0 ? totalOrders[0].totalVolume : 0;
    const orderCount = totalOrders.length > 0 ? totalOrders[0].orderCount : 0;

    res.json({
      success: true,
      data: {
        verifiedSuppliers: verifiedSuppliersCount,
        buyers: buyersCount,
        products: productsCount,
        countries: countriesCount,
        tradeVolume: tradeVolume,
        totalOrders: orderCount
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getPlatformStats
};