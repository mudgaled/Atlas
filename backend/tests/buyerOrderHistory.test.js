const request = require('supertest');
const app = require('../server');
const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');

describe('Buyer Order History Feature', () => {
  let buyerUser, sellerUser, otherUser;
  let order1, order2, order3;

  beforeAll(async () => {
    // Clear existing data
    await Order.deleteMany({});
    await User.deleteMany({});
    await Product.deleteMany({});
  });

  beforeEach(async () => {
    // Create test users
    buyerUser = await User.create({
      name: 'Buyer User',
      email: 'buyer@example.com',
      password: 'password123',
      role: 'buyer',
      profile: {
        company: {
          name: 'Buyer Company',
          registrationNumber: 'BUYER123'
        }
      }
    });

    sellerUser = await User.create({
      name: 'Seller User',
      email: 'seller@example.com',
      password: 'password123',
      role: 'seller',
      profile: {
        company: {
          name: 'Seller Company',
          registrationNumber: 'SELLER123'
        }
      }
    });

    otherUser = await User.create({
      name: 'Other User',
      email: 'other@example.com',
      password: 'password123',
      role: 'buyer',
      profile: {
        company: {
          name: 'Other Company',
          registrationNumber: 'OTHER123'
        }
      }
    });

    // Create test products
    const testProduct = await Product.create({
      name: 'Test Product',
      description: 'Test product description',
      category: 'port-services',
      price: 1000,
      seller: sellerUser._id,
      isActive: true
    });

    // Create test orders for the buyer
    order1 = await Order.create({
      orderItems: [{
        product: testProduct._id,
        name: 'Test Product',
        quantity: 2,
        price: 1000
      }],
      shippingAddress: {
        fullName: 'John Doe',
        address: '123 Test St',
        city: 'Test City',
        postalCode: '12345',
        country: 'Test Country',
        port: 'Test Port'
      },
      paymentMethod: 'CARD',
      itemsPrice: 2000,
      taxPrice: 200,
      shippingPrice: 100,
      totalPrice: 2300,
      user: buyerUser._id,
      seller: sellerUser._id,
      status: 'pending'
    });

    order2 = await Order.create({
      orderItems: [{
        product: testProduct._id,
        name: 'Test Product',
        quantity: 1,
        price: 1000
      }],
      shippingAddress: {
        fullName: 'John Doe',
        address: '123 Test St',
        city: 'Test City',
        postalCode: '12345',
        country: 'Test Country',
        port: 'Test Port'
      },
      paymentMethod: 'CARD',
      itemsPrice: 1000,
      taxPrice: 100,
      shippingPrice: 50,
      totalPrice: 1150,
      user: buyerUser._id,
      seller: sellerUser._id,
      status: 'delivered',
      isPaid: true,
      paidAt: new Date(),
      isDelivered: true,
      deliveredAt: new Date()
    });

    // Create an order for the other user (should not appear in buyer's list)
    order3 = await Order.create({
      orderItems: [{
        product: testProduct._id,
        name: 'Test Product',
        quantity: 3,
        price: 1000
      }],
      shippingAddress: {
        fullName: 'Jane Doe',
        address: '456 Other St',
        city: 'Other City',
        postalCode: '54321',
        country: 'Other Country',
        port: 'Other Port'
      },
      paymentMethod: 'CARD',
      itemsPrice: 3000,
      taxPrice: 300,
      shippingPrice: 150,
      totalPrice: 3450,
      user: otherUser._id,
      seller: sellerUser._id,
      status: 'shipped'
    });
  });

  afterEach(async () => {
    // Clean up orders after each test
    await Order.deleteMany({});
    await User.deleteMany({ email: { $in: ['buyer@example.com', 'seller@example.com', 'other@example.com'] } });
    await Product.deleteMany({ name: 'Test Product' });
  });

  describe('GET /api/orders/myorders', () => {
    it('should return orders for the authenticated buyer', async () => {
      // Generate JWT token for the user (using the same method as in authController)
      const jwt = require('jsonwebtoken');
      const token = jwt.sign({ id: buyerUser._id, role: buyerUser.role }, process.env.JWT_SECRET || 'default_jwt_secret', {
        expiresIn: process.env.JWT_EXPIRE || '30d'
      });
      
      const response = await request(app)
        .get('/api/orders/myorders')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBe(2); // Should only return buyer's 2 orders
      
      // Check that only buyer's orders are returned
      const returnedOrderIds = response.body.data.map(order => order._id.toString());
      expect(returnedOrderIds).toContain(order1._id.toString());
      expect(returnedOrderIds).toContain(order2._id.toString());
      expect(returnedOrderIds).not.toContain(order3._id.toString());
    });

    it('should return only orders for the authenticated buyer, not other users', async () => {
      // Generate JWT token for the user (using the same method as in authController)
      const jwt = require('jsonwebtoken');
      const token = jwt.sign({ id: otherUser._id, role: otherUser.role }, process.env.JWT_SECRET || 'default_jwt_secret', {
        expiresIn: process.env.JWT_EXPIRE || '30d'
      });
      
      const response = await request(app)
        .get('/api/orders/myorders')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBe(1); // Should only return other user's 1 order
      
      // Check that only other user's order is returned
      const returnedOrderIds = response.body.data.map(order => order._id.toString());
      expect(returnedOrderIds).not.toContain(order1._id.toString());
      expect(returnedOrderIds).not.toContain(order2._id.toString());
      expect(returnedOrderIds).toContain(order3._id.toString());
    });

    it('should return 401 if user is not authenticated', async () => {
      await request(app)
        .get('/api/orders/myorders')
        .expect(401);
    });

    it('should return empty array if buyer has no orders', async () => {
      // Create a new user with no orders
      const newUser = await User.create({
        name: 'New User',
        email: 'new@example.com',
        password: 'password123',
        role: 'buyer',
        profile: {
          company: {
            name: 'New Company',
            registrationNumber: 'NEW123'
          }
        }
      });

      // Generate JWT token for the user (using the same method as in authController)
      const jwt = require('jsonwebtoken');
      const token = jwt.sign({ id: newUser._id, role: newUser.role }, process.env.JWT_SECRET || 'default_jwt_secret', {
        expiresIn: process.env.JWT_EXPIRE || '30d'
      });

      const response = await request(app)
        .get('/api/orders/myorders')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBe(0);

      // Clean up
      await User.deleteOne({ email: 'new@example.com' });
    });

    it('should return orders with correct structure', async () => {
      // Generate JWT token for the user (using the same method as in authController)
      const jwt = require('jsonwebtoken');
      const token = jwt.sign({ id: buyerUser._id, role: buyerUser.role }, process.env.JWT_SECRET || 'default_jwt_secret', {
        expiresIn: process.env.JWT_EXPIRE || '30d'
      });
      
      const response = await request(app)
        .get('/api/orders/myorders')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      
      const order = response.body.data[0];
      expect(order).toHaveProperty('_id');
      expect(order).toHaveProperty('orderItems');
      expect(order).toHaveProperty('shippingAddress');
      expect(order).toHaveProperty('paymentMethod');
      expect(order).toHaveProperty('itemsPrice');
      expect(order).toHaveProperty('taxPrice');
      expect(order).toHaveProperty('shippingPrice');
      expect(order).toHaveProperty('totalPrice');
      expect(order).toHaveProperty('status');
      expect(order).toHaveProperty('isPaid');
      expect(order).toHaveProperty('isDelivered');
      expect(order).toHaveProperty('createdAt');
      expect(order).toHaveProperty('user'); // Should be populated with user info
      expect(order).toHaveProperty('seller'); // Should be populated with seller info
    });
  });

  describe('Order Status Tracking', () => {
    it('should return orders with correct status values', async () => {
      // Generate JWT token for the user (using the same method as in authController)
      const jwt = require('jsonwebtoken');
      const token = jwt.sign({ id: buyerUser._id, role: buyerUser.role }, process.env.JWT_SECRET || 'default_jwt_secret', {
        expiresIn: process.env.JWT_EXPIRE || '30d'
      });
      
      const response = await request(app)
        .get('/api/orders/myorders')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      
      // Find the delivered order
      const deliveredOrder = response.body.data.find(order => order._id === order2._id.toString());
      expect(deliveredOrder.status).toBe('delivered');
      expect(deliveredOrder.isPaid).toBe(true);
      expect(deliveredOrder.isDelivered).toBe(true);
      
      // Find the pending order
      const pendingOrder = response.body.data.find(order => order._id === order1._id.toString());
      expect(pendingOrder.status).toBe('pending');
      expect(pendingOrder.isPaid).toBe(false);
      expect(pendingOrder.isDelivered).toBe(false);
    });
  });
});