const mongoose = require('mongoose');
const Order = require('./models/Order');
require('dotenv').config();

const checkOrders = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/import-ventures-marketplace';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');
    
    const orders = await Order.find({});
    console.log('Total orders found:', orders.length);
    console.log('Orders:');
    orders.forEach(order => console.log(`- Order ID: ${order._id}, Status: ${order.status}, User: ${order.user}`));
    
    // Check specifically for the order in question
    const specificOrder = await Order.findById('68d3fdbaf17cdefed686139b');
    if (specificOrder) {
      console.log('Found specific order:', specificOrder);
    } else {
      console.log('Order 68d3fdbaf17cdefed686139b not found in database');
    }
    
    await mongoose.connection.close();
    console.log('Connection closed');
  } catch (error) {
    console.error('Error:', error);
  }
};

checkOrders();