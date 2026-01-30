const User = require('../models/User');
const Product = require('../models/Product');

// @desc    Fetch all verified suppliers
// @route   GET /api/suppliers
// @access  Public
const getSuppliers = async (req, res) => {
  try {
    const pageSize = 12;
    const page = Number(req.query.pageNumber) || 1;

    // Text search across name, company name and location
    const keyword = req.query.keyword
      ? {
          $or: [
            { name: { $regex: req.query.keyword, $options: 'i' } },
            { 'profile.company.name': { $regex: req.query.keyword, $options: 'i' } },
            { 'profile.address.country': { $regex: req.query.keyword, $options: 'i' } }
          ]
        }
      : {};

    // Filter for verified sellers only
    const verificationFilter = {
      role: 'seller',
      'verification.isVerified': true
    };

    // Optional country filter
    const countryFilter = req.query.country
      ? { 'profile.address.country': req.query.country }
      : {};

    const mongoFilter = { ...verificationFilter, ...keyword, ...countryFilter };

    const count = await User.countDocuments(mongoFilter);
    const suppliers = await User.find(mongoFilter)
      .select('-password') // Exclude password
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .sort({ 'verification.verifiedAt': -1 }); // Sort by verification date

    // Get product counts for each supplier
    const suppliersWithProductCounts = await Promise.all(
      suppliers.map(async (supplier) => {
        const productCount = await Product.countDocuments({ seller: supplier._id });
        return {
          ...supplier.toObject(),
          productCount
        };
      })
    );

    res.json({
      success: true,
      data: {
        suppliers: suppliersWithProductCounts,
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

// @desc    Fetch single supplier with detailed info
// @route   GET /api/suppliers/:id
// @access  Public
const getSupplierById = async (req, res) => {
  try {
    const supplier = await User.findById(req.params.id)
      .select('-password') // Exclude password
      .populate('products', 'name price currency images ratings');

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }

    if (supplier.role !== 'seller' || !supplier.verification.isVerified) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found or not verified'
      });
    }

    // Get supplier's products
    const products = await Product.find({ seller: req.params.id, isActive: true });

    res.json({
      success: true,
      data: {
        ...supplier.toObject(),
        products
      }
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get supplier verification details
// @route   GET /api/suppliers/:id/verification
// @access  Public
const getSupplierVerification = async (req, res) => {
  try {
    const supplier = await User.findById(req.params.id)
      .select('verification profile');

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }

    if (supplier.role !== 'seller' || !supplier.verification.isVerified) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found or not verified'
      });
    }

    res.json({
      success: true,
      data: supplier.verification
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getSuppliers,
  getSupplierById,
  getSupplierVerification
};