const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const checkUsers = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/import-ventures-marketplace';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');
    
    // Check the two user IDs associated with this order
    const userId = '68d4361fd078c423ffc5c91e';  // Order user
    const sellerId = '68d3b61c1380a96429f6fe09';  // Order seller
    
    const user = await User.findById(userId);
    const seller = await User.findById(sellerId);
    
    console.log('Order User (should be able to access as buyer):');
    if (user) {
      console.log(`  ID: ${user._id}`);
      console.log(`  Name: ${user.name}`);
      console.log(`  Role: ${user.role}`);
      console.log(`  Email: ${user.email}`);
    } else {
      console.log('  Not found');
    }
    
    console.log('\nOrder Seller (should be able to access as seller):');
    if (seller) {
      console.log(`  ID: ${seller._id}`);
      console.log(`  Name: ${seller.name}`);
      console.log(`  Role: ${seller.role}`);
      console.log(`  Email: ${seller.email}`);
    } else {
      console.log('  Not found');
    }
    
    await mongoose.connection.close();
    console.log('\nConnection closed');
  } catch (error) {
    console.error('Error:', error);
  }
};

checkUsers();