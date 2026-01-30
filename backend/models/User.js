const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't include password in queries by default
  },
  role: {
    type: String,
    enum: {
      values: ['buyer', 'seller', 'admin'],
      message: 'Role must be either buyer, seller, or admin'
    },
    default: 'buyer',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  profile: {
    avatar: {
      type: String,
      default: ''
    },
    phone: {
      type: String,
      trim: true
    },
    company: {
      name: String,
      registrationNumber: String
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    },
    taxInfo: {
      taxId: String,
      vatNumber: String
    }
  },
  verification: {
    isVerified: {
      type: Boolean,
      default: false
    },
    verificationToken: String,
    verifiedAt: Date
  },
  sellerType: {
    type: String,
    default: null, // Will be set when admin verifies the seller
    validate: {
      validator: function(v) {
        // Only validate enum if the value is not null/undefined
        return v === null || v === undefined || ['manufacturer', 'trader'].includes(v);
      },
      message: 'Seller type must be either manufacturer or trader'
    }
  }
}, {
  timestamps: true
});

// Encrypt password before saving
userSchema.pre('save', async function(next) {
  // Only run this function if password was modified
  if (!this.isModified('password')) return next();
  
  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);