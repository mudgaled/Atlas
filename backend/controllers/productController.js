const Product = require('../models/Product');
const User = require('../models/User');

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const pageSize = 12;
    const page = Number(req.query.pageNumber) || 1;

    // Text search across name, description and tags
    const keyword = req.query.keyword
      ? {
          $or: [
            { name: { $regex: req.query.keyword, $options: 'i' } },
            { description: { $regex: req.query.keyword, $options: 'i' } },
            { tags: { $in: [new RegExp(req.query.keyword, 'i')] } }
          ]
        }
      : {};

    // Optional category filter
    const categoryFilter = req.query.category
      ? { category: req.query.category }
      : {};

    // Optional price range: accept minPrice / maxPrice (numbers)
    const priceFilter = (req.query.minPrice || req.query.maxPrice)
      ? {
          price: {
            ...(req.query.minPrice ? { $gte: Number(req.query.minPrice) } : {}),
            ...(req.query.maxPrice ? { $lte: Number(req.query.maxPrice) } : {})
          }
        }
      : {};

    // Optional location filter (country)
    const locationFilter = req.query.country
      ? { 'location.country': req.query.country }
      : {};

    // Optional minimum MOQ (stock)
    const moqFilter = req.query.minMOQ
      ? { stock: { $gte: Number(req.query.minMOQ) } }
      : {};

    // Optional maximum lead time (would need to be added to product schema if not present)
    // For now, we'll skip this filter since it's not in the schema

    // Optional currency filter
    const currencyFilter = req.query.currency
      ? { currency: req.query.currency }
      : {};

    // Only exclude inactive items in listings; allow unverified during development/demo
    const baseFilter = { isActive: true };

    const mongoFilter = {
      ...baseFilter,
      ...keyword,
      ...categoryFilter,
      ...priceFilter,
      ...locationFilter,
      ...moqFilter,
      ...currencyFilter
    };

    const count = await Product.countDocuments(mongoFilter);
    const products = await Product.find(mongoFilter)
      .populate('seller', 'name email profile sellerType verification')
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        products,
        page,
        pages: Math.ceil(count / pageSize),
        count
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('seller', 'name email profile company sellerType verification');

    if (product) {
      res.json({
        success: true,
        data: product
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
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

// @desc    Create a product
// @route   POST /api/products
// @access  Private (Seller only)
const createProduct = async (req, res) => {
  try {
    // Check if the seller is verified
    if (req.user.role === 'seller' && !req.user.verification.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Seller account must be verified by admin before creating products'
      });
    }

    const { name, description, category, price, images, stock, specifications, location, tags } = req.body;

    const product = new Product({
      name,
      description,
      category,
      price,
      images: images || [],
      stock,
      specifications: specifications || {},
      location: location || {},
      seller: req.user._id,
      tags: tags || []
    });

    const createdProduct = await product.save();
    const populatedProduct = await Product.findById(createdProduct._id)
      .populate('seller', 'name email profile company sellerType verification');

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: populatedProduct
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private (Seller only)
const updateProduct = async (req, res) => {
  try {
    const { name, description, category, price, images, stock, specifications, location, tags, isActive } = req.body;

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if user is the seller of this product
    if (product.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this product'
      });
    }

    // Check if the seller is verified (if the user is a seller)
    if (req.user.role === 'seller' && !req.user.verification.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Seller account must be verified by admin before updating products'
      });
    }

    // Update product fields
    product.name = name || product.name;
    product.description = description || product.description;
    product.category = category || product.category;
    product.price = price || product.price;
    product.images = images || product.images;
    product.stock = stock || product.stock;
    product.specifications = specifications || product.specifications;
    product.location = location || product.location;
    product.tags = tags || product.tags;
    product.isActive = isActive !== undefined ? isActive : product.isActive;

    const updatedProduct = await product.save();
    const populatedProduct = await Product.findById(updatedProduct._id)
      .populate('seller', 'name email profile company sellerType verification');

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

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private (Seller only)
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if user is the seller of this product
    if (product.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this product'
      });
    }

    // Check if the seller is verified (if the user is a seller)
    if (req.user.role === 'seller' && !req.user.verification.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Seller account must be verified by admin before deleting products'
      });
    }

    await Product.deleteOne({ _id: req.params.id });

    res.json({
      success: true,
      message: 'Product removed'
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

// @desc    Get products by seller
// @route   GET /api/products/mine
// @access  Private (Seller only)
const getMyProducts = async (req, res) => {
  try {
    const pageSize = 10;
    const page = Number(req.query.pageNumber) || 1;

    const count = await Product.countDocuments({ seller: req.user._id });
    const products = await Product.find({ seller: req.user._id })
      .populate('seller', 'name email profile company sellerType verification')
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        products,
        page,
        pages: Math.ceil(count / pageSize),
        count
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
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getMyProducts
};