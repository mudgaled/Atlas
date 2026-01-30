const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB before all tests
beforeAll(async () => {
  const MONGO_URL = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/marketplace_test';
  
  await mongoose.connect(MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

// Clear all collections after each test
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

// Close connection after all tests
afterAll(async () => {
  await mongoose.connection.close();
});