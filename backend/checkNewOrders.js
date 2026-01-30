const mongoose = require('mongoose');
const Order = require('./models/Order');
require('dotenv').config();

const checkNewOrders = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/import-ventures-marketplace';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');
    
    // Get all orders sorted by creation date (newest first)
    const orders = await Order.find({})
      .sort({ createdAt: -1 })
      .limit(10)  // Get only the 10 most recent orders
      .populate('user', 'name email role')
      .populate('seller', 'name email role');

    console.log('Most recent orders:');
    orders.forEach((order, index) => {
      console.log(`${index + 1}. Order ID: ${order._id}`);
      console.log(`   User: ${order.user ? `${order.user.name} (${order.user._id})` : 'N/A'}`);
      console.log(`   Seller: ${order.seller ? `${order.seller.name} (${order.seller._id})` : 'N/A'}`);
      console.log(`   Status: ${order.status}`);
      console.log(`   Created: ${order.createdAt}`);
      console.log('   ---');
    });
    
    await mongoose.connection.close();
    console.log('\nConnection closed');
  } catch (error) {
    console.error('Error:', error);
  }
};

checkNewOrders();