const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

const cleanupDatabase = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/import-ventures-marketplace';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Get the raw collection to manage indexes
    const collection = mongoose.connection.collection('products');

    // List all indexes
    const indexes = await collection.indexes();
    console.log('Current indexes:', indexes.map(idx => idx.name));

    // Drop the problematic sku index if it exists
    const skuIndexExists = indexes.some(index => index.key && index.key.sku);
    if (skuIndexExists) {
      try {
        await collection.dropIndex('sku_1');
        console.log('Dropped sku_1 index');
      } catch (dropErr) {
        console.log('Index sku_1 might not exist or error dropping:', dropErr.message);
      }
    }

    // Clear all products
    await Product.deleteMany({});
    console.log('Cleared all products');

    // Close connection
    await mongoose.connection.close();
    console.log('Database cleanup completed');
  } catch (error) {
    console.error('Error cleaning database:', error);
    process.exit(1);
  }
};

cleanupDatabase();