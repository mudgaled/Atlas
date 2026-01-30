const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_jwt_secret', {
    expiresIn: '30d',
  });
};

// Register user
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Validate email format
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email'
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create user
    // If the user is a seller, set verification status to pending
    const newUserRole = role || 'buyer';
    let verificationStatus = false;
    
    // For sellers, set verification to pending (not verified)
    // For buyers and admins, they can be immediately active
    if (newUserRole === 'seller') {
      verificationStatus = false; // Seller needs admin verification
    } else {
      verificationStatus = true; // Buyers and admins don't need verification
    }

    const user = await User.create({
      name,
      email,
      password,
      role: newUserRole,
      verification: {
        isVerified: verificationStatus,
        verificationToken: null,
        verifiedAt: verificationStatus ? new Date() : null
      }
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token
      }
    });
  } catch (error) {
    console.error('Registration error:', error); // Add logging for debugging
    
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server Error - ' + error.message
    });
  }
};

// Login user
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if email and password exist
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Check if user exists and password is correct
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    if (!(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error); // Add logging for debugging
    res.status(500).json({
      success: false,
      message: 'Server Error - ' + error.message
    });
  }
};

// Get user profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    // Update user fields - allow specific profile sub-fields to be updated
    const allowedFields = ['name', 'profile'];
    const allowedProfileFields = ['phone', 'company', 'address', 'taxInfo', 'avatar'];
    const updateData = {};
    
    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        if (key === 'profile' && typeof req.body[key] === 'object') {
          // Only allow specific profile fields to be updated
          const profileUpdate = {};
          Object.keys(req.body[key]).forEach(profileKey => {
            if (allowedProfileFields.includes(profileKey)) {
              let value = req.body[key][profileKey];
              
              // Special handling for different profile fields
              if (profileKey === 'phone') {
                // Ensure phone is a string if it's being updated
                if (value) {
                  // Convert to string and remove any object references
                  value = String(value).replace(/\[object Object\]/g, '');
                  // Remove empty strings
                  if (value.trim() !== '') {
                    value = value.trim();
                  } else {
                    value = ''; // Set to empty string if it was just object conversion remains
                  }
                }
                // Assign the sanitized value back into the profile update payload
                profileUpdate[profileKey] = value;
              } else if (['company', 'address', 'taxInfo'].includes(profileKey) && typeof value === 'object' && value !== null) {
                // For nested objects like company, address, taxInfo, preserve the structure
                // but make sure these objects don't contain sub-objects that cause issues
                profileUpdate[profileKey] = {};
                
                // Process each field within the nested object to ensure it's the right type
                Object.keys(value).forEach(nestedKey => {
                  let nestedValue = value[nestedKey];
                  
                  // Ensure primitive values are preserved correctly
                  if (typeof nestedValue === 'object' && nestedValue !== null && !Array.isArray(nestedValue)) {
                    // For nested objects within nested objects, convert to string to be safe
                    if (nestedValue.toString) {
                      nestedValue = nestedValue.toString();
                    } else {
                      nestedValue = JSON.stringify(nestedValue);
                    }
                  }
                  
                  profileUpdate[profileKey][nestedKey] = nestedValue;
                });
              } else if (typeof value === 'object' && value !== null) {
                // For other objects, handle as needed
                if (!Array.isArray(value)) {
                  if (value.toString) {
                    value = value.toString();
                  } else {
                    value = JSON.stringify(value);
                  }
                } else {
                  value = value.join(', ');
                }
                profileUpdate[profileKey] = value;
              } else {
                // For primitive values, just use as is
                profileUpdate[profileKey] = value;
              }
            }
          });
          if (Object.keys(profileUpdate).length > 0) {
            updateData[key] = profileUpdate;
          }
        } else if (key === 'name') {
          updateData[key] = req.body[key];
        }
      }
    });

    // Update the user with new data using findByIdAndUpdate to avoid DocumentNotFoundError
    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile: user.profile
      }
    });
  } catch (error) {
    console.error('Profile update error:', error); // Add logging for debugging
    res.status(500).json({
      success: false,
      message: 'Server Error - ' + error.message
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getProfile,
  updateProfile
};