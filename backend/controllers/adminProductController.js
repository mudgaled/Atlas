const Product = require('../models/Product');
const User = require('../models/User');

// @desc    Get all products (admin view)
// @route   GET /api/admin/products
// @access  Private (Admin only)
const getAllProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Search functionality
    const searchKeyword = req.query.keyword || '';
    const searchFilter = searchKeyword 
      ? { 
          $or: [
            { name: { $regex: searchKeyword, $options: 'i' } },
            { description: { $regex: searchKeyword, $options: 'i' } },
            { tags: { $in: [new RegExp(searchKeyword, 'i')] } }
          ]
        } 
      : {};
    
    // Category filter
    const categoryFilter = req.query.category ? { category: req.query.category } : {};
    
    // Verification filter
    const verificationFilter = req.query.verificationStatus 
      ? { isVerified: req.query.verificationStatus === 'verified' } 
      : {};
    
    // Status filter
    const statusFilter = req.query.status 
      ? { isActive: req.query.status === 'active' } 
      : {};
    
    const filter = {
      ...searchFilter,
      ...categoryFilter,
      ...verificationFilter,
      ...statusFilter
    };

    const products = await Product.find(filter)
      .populate('seller', 'name email profile company')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Product.countDocuments(filter);

    res.json({
      success: true,
      data: {
        products,
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

// @desc    Get product by ID
// @route   GET /api/admin/products/:id
// @access  Private (Admin only)
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('seller', 'name email profile company');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update product
// @route   PUT /api/admin/products/:id
// @access  Private (Admin only)
const updateProduct = async (req, res) => {
  try {
    const { name, description, category, price, images, stock, specifications, location, tags, isActive, isVerified } = req.body;

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Update product fields
    if (name) product.name = name;
    if (description) product.description = description;
    if (category) product.category = category;
    if (price !== undefined) product.price = price;
    if (images) product.images = images;
    if (stock !== undefined) product.stock = stock;
    if (specifications) product.specifications = specifications;
    if (location) product.location = location;
    if (tags) product.tags = tags;
    if (isActive !== undefined) product.isActive = isActive;
    if (isVerified !== undefined) product.isVerified = isVerified;

    const updatedProduct = await product.save();
    const populatedProduct = await Product.findById(updatedProduct._id)
      .populate('seller', 'name email profile company');

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: populatedProduct
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete product
// @route   DELETE /api/admin/products/:id
// @access  Private (Admin only)
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    await Product.deleteOne({ _id: req.params.id });

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Verify product
// @route   PUT /api/admin/products/:id/verify
// @access  Private (Admin only)
const verifyProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Update verification status
    product.isVerified = true;
    product.isActive = true; // Activate the product when verified
    await product.save();

    const updatedProduct = await Product.findById(req.params.id)
      .populate('seller', 'name email profile company');

    res.json({
      success: true,
      message: 'Product verified successfully',
      data: updatedProduct
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Unverify product
// @route   PUT /api/admin/products/:id/unverify
// @access  Private (Admin only)
const unverifyProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Update verification status
    product.isVerified = false;
    // For unverified products, we deactivate them
    product.isActive = false;
    await product.save();

    const updatedProduct = await Product.findById(req.params.id)
      .populate('seller', 'name email profile company');

    res.json({
      success: true,
      message: 'Product unverified successfully',
      data: updatedProduct
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get seller's products
// @route   GET /api/admin/sellers/:sellerId/products
// @access  Private (Admin only)
const getSellerProducts = async (req, res) => {
  try {
    const sellerId = req.params.sellerId;
    
    // Verify that the seller exists
    const seller = await User.findById(sellerId);
    if (!seller || seller.role !== 'seller') {
      return res.status(404).json({
        success: false,
        message: 'Seller not found'
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const products = await Product.find({ seller: sellerId })
      .populate('seller', 'name email profile company')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Product.countDocuments({ seller: sellerId });

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Seller not found'
      });
    }
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  verifyProduct,
  unverifyProduct,
  getSellerProducts
};