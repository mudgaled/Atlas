const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const updateSellerTypes = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/import-ventures-marketplace';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Update all sellers to have a default sellerType if not already set
    const result = await User.updateMany(
      { 
        role: 'seller', 
        sellerType: { $exists: false } // Only update if sellerType field doesn't exist
      },
      { 
        $set: { 
          sellerType: 'merchant' // Default to merchant for existing sellers
        } 
      }
    );

    console.log(`Updated ${result.modifiedCount} sellers with default sellerType`);

    // Also update any sellers that have null sellerType
    const result2 = await User.updateMany(
      { 
        role: 'seller', 
        sellerType: null 
      },
      { 
        $set: { 
          sellerType: 'merchant' 
        } 
      }
    );

    console.log(`Updated ${result2.modifiedCount} sellers with null sellerType`);

    // Close connection
    await mongoose.connection.close();
    console.log('Database update completed');
  } catch (error) {
    console.error('Error updating seller types:', error);
    process.exit(1);
  }
};

updateSellerTypes();