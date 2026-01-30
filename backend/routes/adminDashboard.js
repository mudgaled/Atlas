const express = require('express');
const { protect, adminOnly } = require('../middleware/auth');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');

const router = express.Router();

// @desc    Get admin dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private (Admin only)
router.get('/dashboard', protect, adminOnly, async (req, res) => {
  try {
    // Get user statistics
    const userStats = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
          verifiedSellers: {
            $sum: {
              $cond: [
                { $and: [
                  { $eq: ['$role', 'seller'] },
                  { $eq: ['$verification.isVerified', true] }
                ]},
                1,
                0
              ]
            }
          },
          unverifiedSellers: {
            $sum: {
              $cond: [
                { $and: [
                  { $eq: ['$role', 'seller'] },
                  { $eq: ['$verification.isVerified', false] }
                ]},
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    // Get product statistics
    const productStats = await Product.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          verified: { 
            $sum: { 
              $cond: [{ $eq: ['$isVerified', true] }, 1, 0] 
            } 
          },
          unverified: { 
            $sum: { 
              $cond: [{ $eq: ['$isVerified', false] }, 1, 0] 
            } 
          },
          active: { 
            $sum: { 
              $cond: [{ $eq: ['$isActive', true] }, 1, 0] 
            } 
          },
          inactive: { 
            $sum: { 
              $cond: [{ $eq: ['$isActive', false] }, 1, 0] 
            } 
          }
        }
      }
    ]);

    // Get order statistics
    const orderStats = await Order.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          totalRevenue: { $sum: '$totalPrice' }
        }
      }
    ]);

    // Get recent activities (latest registered users)
    const recentUsers = await User.find({})
      .select('name email role verification.isVerified createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    const stats = {
      users: {
        total: userStats.reduce((sum, stat) => sum + (stat.count || 0), 0),
        buyers: userStats.find(stat => stat._id === 'buyer')?.count || 0,
        sellers: userStats.find(stat => stat._id === 'seller')?.count || 0,
        admins: userStats.find(stat => stat._id === 'admin')?.count || 0,
        verifiedSellers: userStats.find(stat => stat._id === 'seller')?.verifiedSellers || 0,
        unverifiedSellers: userStats.find(stat => stat._id === 'seller')?.unverifiedSellers || 0,
      },
      products: {
        total: productStats[0]?.total || 0,
        verified: productStats[0]?.verified || 0,
        unverified: productStats[0]?.unverified || 0,
        active: productStats[0]?.active || 0,
        inactive: productStats[0]?.inactive || 0,
      },
      orders: {
        total: orderStats[0]?.total || 0,
        totalRevenue: orderStats[0]?.totalRevenue || 0,
      },
      recentUsers
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;