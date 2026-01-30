const request = require('supertest');
const app = require('../server');
const User = require('../models/User');
const Product = require('../models/Product');
const mongoose = require('mongoose');

describe('Admin API', () => {
  let adminToken, sellerToken, buyerToken;
  let adminId, sellerId, buyerId, productId;

  beforeEach(async () => {
    // Clean up before each test (handled by global setup)
    await User.deleteMany({});
    await Product.deleteMany({});
  });

  describe('Admin Dashboard API', () => {
    it('should return dashboard stats for admin user', async () => {
      // Create admin user
      const adminUser = await User.create({
        name: 'Admin User',
        email: `admin-${Date.now()}@example.com`,
        password: 'password123',
        role: 'admin',
        verification: { isVerified: true }
      });
      adminId = adminUser._id;

      // Login to get admin token
      const adminLogin = await request(app)
        .post('/api/users/login')
        .send({ email: adminUser.email, password: 'password123' });
      adminToken = adminLogin.body.data.token;

      const res = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.users).toBeDefined();
      expect(res.body.data.products).toBeDefined();
      expect(res.body.data.orders).toBeDefined();
    });

    it('should not allow non-admin access to dashboard', async () => {
      // Create admin user
      const adminUser = await User.create({
        name: 'Admin User',
        email: `admin-${Date.now()}admin@example.com`,
        password: 'password123',
        role: 'admin',
        verification: { isVerified: true }
      });
      adminId = adminUser._id;

      // Create seller user
      const sellerUser = await User.create({
        name: 'Seller User',
        email: `seller-${Date.now()}@example.com`,
        password: 'password123',
        role: 'seller',
        verification: { isVerified: false } // Unverified seller
      });
      sellerId = sellerUser._id;

      // Create buyer user
      const buyerUser = await User.create({
        name: 'Buyer User',
        email: `buyer-${Date.now()}@example.com`,
        password: 'password123',
        role: 'buyer',
        verification: { isVerified: true }
      });
      buyerId = buyerUser._id;

      // Login to get tokens
      const adminLogin = await request(app)
        .post('/api/users/login')
        .send({ email: adminUser.email, password: 'password123' });
      adminToken = adminLogin.body.data.token;

      const sellerLogin = await request(app)
        .post('/api/users/login')
        .send({ email: sellerUser.email, password: 'password123' });
      sellerToken = sellerLogin.body.data.token;

      const buyerLogin = await request(app)
        .post('/api/users/login')
        .send({ email: buyerUser.email, password: 'password123' });
      buyerToken = buyerLogin.body.data.token;

      // Try with seller token - should return 403
      await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${sellerToken}`)
        .expect(403);

      // Try with buyer token - should return 403
      await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(403);
    });
  });

  describe('Admin User Management', () => {
    it('should get all users for admin', async () => {
      // Create admin user
      const adminUser = await User.create({
        name: 'Admin User',
        email: `admin-${Date.now()}@example.com`,
        password: 'password123',
        role: 'admin',
        verification: { isVerified: true }
      });
      adminId = adminUser._id;

      // Create seller user
      const sellerUser = await User.create({
        name: 'Seller User',
        email: `seller-${Date.now()}@example.com`,
        password: 'password123',
        role: 'seller',
        verification: { isVerified: false } // Unverified seller
      });
      sellerId = sellerUser._id;

      // Login to get admin token
      const adminLogin = await request(app)
        .post('/api/users/login')
        .send({ email: adminUser.email, password: 'password123' });
      adminToken = adminLogin.body.data.token;

      const res = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(Array.isArray(res.body.data.users)).toBe(true);
      expect(res.body.data.pagination).toBeDefined();
    });

  afterAll(async () => {
    await User.deleteMany({});
    await Product.deleteMany({});
  });

  describe('Admin Dashboard API', () => {
    it('should return dashboard stats for admin user', async () => {
      const res = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.users).toBeDefined();
      expect(res.body.data.products).toBeDefined();
      expect(res.body.data.orders).toBeDefined();
    });

    it('should not allow non-admin access to dashboard', async () => {
      // Try with seller token
      await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${sellerToken}`)
        .expect(403);

      // Try with buyer token
      await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(403);
    });
  });

  describe('Admin User Management', () => {
    it('should get all users for admin', async () => {
      const res = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(Array.isArray(res.body.data.users)).toBe(true);
      expect(res.body.data.pagination).toBeDefined();
    });

    it('should get user by ID for admin', async () => {
      const res = await request(app)
        .get(`/api/admin/users/${sellerId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data._id).toBe(sellerId.toString());
    });

    it('should verify seller for admin', async () => {
      const res = await request(app)
        .put(`/api/admin/users/${sellerId}/verify`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.verification.isVerified).toBe(true);
    });

    it('should unverify seller for admin', async () => {
      const res = await request(app)
        .put(`/api/admin/users/${sellerId}/unverify`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.verification.isVerified).toBe(false);
    });

    it('should not allow non-admin to access user management', async () => {
      // Try with seller token
      await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${sellerToken}`)
        .expect(403);

      // Try with buyer token
      await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(403);
    });

    it('should not allow admin to modify another admin user', async () => {
      // First create another admin user
      const anotherAdmin = await User.create({
        name: 'Another Admin',
        email: 'anotheradmin@example.com',
        password: 'password123',
        role: 'admin',
        verification: { isVerified: true }
      });

      const updateData = {
        name: 'Updated Name',
        isActive: false
      };

      const res = await request(app)
        .put(`/api/admin/users/${anotherAdmin._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe(updateData.name);
    });
  });

  describe('Admin Product Management', () => {
    it('should get all products for admin', async () => {
      const res = await request(app)
        .get('/api/admin/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(Array.isArray(res.body.data.products)).toBe(true);
      expect(res.body.data.pagination).toBeDefined();
    });

    it('should get product by ID for admin', async () => {
      const res = await request(app)
        .get(`/api/admin/products/${productId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data._id).toBe(productId.toString());
    });

    it('should verify product for admin', async () => {
      const res = await request(app)
        .put(`/api/admin/products/${productId}/verify`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.isVerified).toBe(true);
      expect(res.body.data.isActive).toBe(true);
    });

    it('should unverify product for admin', async () => {
      const res = await request(app)
        .put(`/api/admin/products/${productId}/unverify`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.isVerified).toBe(false);
      expect(res.body.data.isActive).toBe(false);
    });

    it('should not allow non-admin to access product management', async () => {
      // Try with seller token
      await request(app)
        .get('/api/admin/products')
        .set('Authorization', `Bearer ${sellerToken}`)
        .expect(403);

      // Try with buyer token
      await request(app)
        .get('/api/admin/products')
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(403);
    });

    it('should get seller products for admin', async () => {
      const res = await request(app)
        .get(`/api/admin/sellers/${sellerId}/products`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(Array.isArray(res.body.data.products)).toBe(true);
    });

    it('should not allow non-admin to access seller products', async () => {
      // Try with seller token
      await request(app)
        .get(`/api/admin/sellers/${sellerId}/products`)
        .set('Authorization', `Bearer ${sellerToken}`)
        .expect(403);

      // Try with buyer token
      await request(app)
        .get(`/api/admin/sellers/${sellerId}/products`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(403);
    });
  });
});