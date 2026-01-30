const mongoose = require('mongoose');
const Order = require('./models/Order');
require('dotenv').config();

const checkSpecificOrder = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/import-ventures-marketplace';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');
    
    // Check the specific order from the URL
    const orderId = '68d43636d078c423ffc5c92c';
    const order = await Order.findById(orderId);

    console.log('Order found:', order ? 'Yes' : 'No');
    if (order) {
      console.log('Order ID:', order._id.toString());
      console.log('Order User ID:', order.user.toString());
      console.log('Order Seller ID:', order.seller.toString());
      console.log('Status:', order.status);
      console.log('Created:', order.createdAt);
      console.log('Total Price:', order.totalPrice);
      console.log('Order Items Count:', order.orderItems ? order.orderItems.length : 0);
    } else {
      console.log(`Order ${orderId} not found in DB`);
      
      // Let's check if there are any recent orders to compare
      console.log('\\nChecking for recent orders...');
      const recentOrders = await Order.find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .select('_id createdAt');
      
      console.log('Recent order IDs:');
      recentOrders.forEach((order, index) => {
        console.log(`${index + 1}. ${order._id.toString()} - ${order.createdAt}`);
      });
    }
    
    await mongoose.connection.close();
    console.log('\\nConnection closed');
  } catch (error) {
    console.error('Error:', error);
  }
};

checkSpecificOrder();