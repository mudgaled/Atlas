const User = require('../models/User');
const Product = require('../models/Product');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin only)
const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Search functionality
    const searchKeyword = req.query.search || '';
    const searchFilter = searchKeyword 
      ? { 
          $or: [
            { name: { $regex: searchKeyword, $options: 'i' } },
            { email: { $regex: searchKeyword, $options: 'i' } }
          ]
        } 
      : {};
    
    // Role filter
    const roleFilter = req.query.role ? { role: req.query.role } : {};
    
    // Verification filter
    const verificationFilter = req.query.verificationStatus 
      ? { 'verification.isVerified': req.query.verificationStatus === 'verified' } 
      : {};
    
    const filter = {
      ...searchFilter,
      ...roleFilter,
      ...verificationFilter
    };

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get user by ID
// @route   GET /api/admin/users/:id
// @access  Private (Admin only)
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update user (including verification status)
// @route   PUT /api/admin/users/:id
// @access  Private (Admin only)
const updateUser = async (req, res) => {
  try {
    const { name, email, role, isActive, verification, sellerType } = req.body;

    // Find the user
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Build update object
    const updateFields = {};
    if (name) updateFields.name = name;
    if (email) updateFields.email = email;
    if (role) updateFields.role = role;
    if (isActive !== undefined) updateFields.isActive = isActive;

    // Validate and update seller type if provided
    if (sellerType !== undefined) {
      if (user.role !== 'seller') {
        return res.status(400).json({
          success: false,
          message: 'Cannot set seller type for non-seller user'
        });
      }
      if (!['manufacturer', 'trader'].includes(sellerType)) {
        return res.status(400).json({
          success: false,
          message: 'Seller type must be either manufacturer or trader'
        });
      }
      updateFields.sellerType = sellerType;
    }

    if (verification) {
      updateFields.verification = {
        ...user.verification._doc,  // Keep existing verification fields
        ...verification
      };

      // If the user is being verified and was a seller, update their products to active
      if (verification.isVerified && user.role === 'seller' && !user.verification.isVerified) {
        await Product.updateMany(
          { seller: user._id },
          { isActive: true }
        );
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Handle duplicate email error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin only)
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Also delete all products associated with this seller
    if (user.role === 'seller') {
      await Product.deleteMany({ seller: user._id });
    }

    await User.deleteOne({ _id: req.params.id });

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Verify seller
// @route   PUT /api/admin/users/:id/verify
// @access  Private (Admin only)
const verifySeller = async (req, res) => {
  try {
    const { sellerType } = req.body; // Get seller type from request body

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.role !== 'seller') {
      return res.status(400).json({
        success: false,
        message: 'User is not a seller'
      });
    }

    // Validate seller type if provided
    if (sellerType && !['manufacturer', 'trader'].includes(sellerType)) {
      return res.status(400).json({
        success: false,
        message: 'Seller type must be either manufacturer or trader'
      });
    }

    // Update verification status and seller type
    user.verification.isVerified = true;
    user.verification.verifiedAt = new Date();
    if (sellerType) {
      user.sellerType = sellerType;
    }
    await user.save();

    // If the seller had any products, mark them as active
    await Product.updateMany(
      { seller: user._id },
      {
        isVerified: true,
        isActive: true
      }
    );

    const updatedUser = await User.findById(req.params.id).select('-password');

    res.json({
      success: true,
      message: 'Seller verified successfully',
      data: updatedUser
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Unverify seller
// @route   PUT /api/admin/users/:id/unverify
// @access  Private (Admin only)
const unverifySeller = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.role !== 'seller') {
      return res.status(400).json({
        success: false,
        message: 'User is not a seller'
      });
    }

    // Update verification status
    user.verification.isVerified = false;
    user.verification.verifiedAt = null;
    await user.save();

    // If the seller had any products, deactivate them
    await Product.updateMany(
      { seller: user._id },
      { 
        isVerified: false,
        isActive: false 
      }
    );

    const updatedUser = await User.findById(req.params.id).select('-password');

    res.json({
      success: true,
      message: 'Seller unverified successfully',
      data: updatedUser
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  verifySeller,
  unverifySeller
};