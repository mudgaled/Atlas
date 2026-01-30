const mongoose = require('mongoose');
const Order = require('./models/Order');
const User = require('./models/User');
require('dotenv').config();

const debugOrderAuth = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/import-ventures-marketplace';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');
    
    // Check the order data
    const orderId = '68d40aa5f3afa2dd9460f3a3'; // The order from the error
    const order = await Order.findById(orderId)
      .populate('user', 'name email')
      .populate('seller', 'name email');
    
    console.log('Order found:', order ? 'Yes' : 'No');
    if (order) {
      console.log('Order ID:', order._id);
      console.log('Order User ID:', order.user._id.toString());
      console.log('Order Seller ID:', order.seller._id.toString());
      console.log('User Name:', order.user.name);
      console.log('Seller Name:', order.seller.name);
    } else {
      console.log('Order not found in DB');
    }
    
    // Check if the user IDs from checkOrders.js exist
    const userId1 = '68d3b61c1380a96429f6fe09';  // One of the user IDs
    const userId2 = '68d3b7b75120f4440465bbed';  // Another user ID
    const sellerId = '68d3b61c1380a96429f6fe09'; // Seller ID
    
    const user1 = await User.findById(userId1);
    const user2 = await User.findById(userId2);
    
    console.log('\\nUser 1 (might be seller):', user1 ? user1.name + ' (' + user1.role + ')' : 'Not found');
    console.log('User 2 (might be buyer):', user2 ? user2.name + ' (' + user2.role + ')' : 'Not found');
    
    await mongoose.connection.close();
    console.log('\\nConnection closed');
  } catch (error) {
    console.error('Error:', error);
  }
};

debugOrderAuth();