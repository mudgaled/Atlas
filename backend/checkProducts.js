const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

const checkProducts = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/import-ventures-marketplace';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');
    
    const products = await Product.find({});
    console.log('Total products found:', products.length);
    console.log('Sample products:');
    products.forEach(p => console.log(`- ${p.name} (${p.category})`));
    
    await mongoose.connection.close();
    console.log('Connection closed');
  } catch (error) {
    console.error('Error:', error);
  }
};

checkProducts();