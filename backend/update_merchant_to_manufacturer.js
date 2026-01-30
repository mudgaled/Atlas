const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const updateSellerTypes = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/import-ventures-marketplace';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Update all sellers with 'merchant' to 'manufacturer'
    const result = await User.updateMany(
      { 
        role: 'seller', 
        sellerType: 'merchant' 
      },
      { 
        $set: { 
          sellerType: 'manufacturer' 
        } 
      }
    );

    console.log(`Updated ${result.modifiedCount} sellers from 'merchant' to 'manufacturer'`);

    // Also update any users that might have 'Merchant' (capitalized)
    const result2 = await User.updateMany(
      { 
        role: 'seller', 
        sellerType: 'Merchant' 
      },
      { 
        $set: { 
          sellerType: 'manufacturer' 
        } 
      }
    );

    console.log(`Updated ${result2.modifiedCount} sellers from 'Merchant' to 'manufacturer'`);

    // Close connection
    await mongoose.connection.close();
    console.log('Database update completed');
  } catch (error) {
    console.error('Error updating seller types:', error);
    process.exit(1);
  }
};

updateSellerTypes();