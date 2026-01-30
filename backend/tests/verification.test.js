const request = require('supertest');
const app = require('../server');
const User = require('../models/User');
const Product = require('../models/Product');
const mongoose = require('mongoose');

describe('Seller Verification API', () => {
  let adminToken, sellerToken;
  let sellerId, productId;

  beforeAll(async () => {
    // Create admin user
    const adminUser = await User.create({
      name: 'Admin User',
      email: `admin-${Date.now()}@example.com`,
      password: 'password123',
      role: 'admin',
      verification: { isVerified: true }
    });

    // Create unverified seller user
    const sellerUser = await User.create({
      name: 'Unverified Seller',
      email: `unverifiedseller-${Date.now()}@example.com`,
      password: 'password123',
      role: 'seller',
      verification: { isVerified: false } // Unverified seller
    });
    sellerId = sellerUser._id;

    // Login to get tokens
    const adminLogin = await request(app)
      .post('/api/users/login')
      .send({ email: adminUser.email, password: 'password123' });
    adminToken = adminLogin.body.data.token;

    const sellerLogin = await request(app)
      .post('/api/users/login')
      .send({ email: sellerUser.email, password: 'password123' });
    sellerToken = sellerLogin.body.data.token;

    // Create a product for the unverified seller (should be inactive)
    const product = await Product.create({
      name: 'Test Product from Unverified Seller',
      description: 'Test product description',
      category: 'logistics',
      price: 100,
      seller: sellerId,
      isVerified: false,
      isActive: false
    });
    productId = product._id;
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Product.deleteMany({});
  });

  describe('Seller Registration Verification Flow', () => {
    it('should register seller with unverified status', async () => {
      const newUser = {
        name: 'New Seller',
        email: 'newseller@example.com',
        password: 'password123',
        role: 'seller'
      };

      const res = await request(app)
        .post('/api/users/register')
        .send(newUser)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.role).toBe('seller');
      // The seller should be unverified initially
      const user = await User.findOne({ email: 'newseller@example.com' });
      expect(user.verification.isVerified).toBe(false);
    });

    it('should not allow unverified seller to create products', async () => {
      const productData = {
        name: 'New Product',
        description: 'Product description',
        category: 'logistics',
        price: 50,
        images: [],
        stock: 10
      };

      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send(productData)
        .expect(403);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('verified by admin before creating products');
    });

    it('should verify seller through admin panel', async () => {
      const res = await request(app)
        .put(`/api/admin/users/${sellerId}/verify`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.verification.isVerified).toBe(true);

      // Check that the seller's products are now active
      const product = await Product.findById(productId);
      expect(product.isVerified).toBe(true);
      expect(product.isActive).toBe(true);
    });

    it('should allow verified seller to create products', async () => {
      // First, unverify the seller again
      await request(app)
        .put(`/api/admin/users/${sellerId}/unverify`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      // Now verify again via admin
      await request(app)
        .put(`/api/admin/users/${sellerId}/verify`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      // Now the seller should be able to create products
      const productData = {
        name: 'New Product After Verification',
        description: 'Product description after verification',
        category: 'logistics',
        price: 75,
        images: [],
        stock: 5
      };

      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send(productData)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe(productData.name);
      expect(res.body.data.seller._id).toBe(sellerId.toString());
    });

    it('should not allow unverified seller to update products', async () => {
      // Unverify the seller
      await request(app)
        .put(`/api/admin/users/${sellerId}/unverify`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      // Try to update a product - should fail
      const updateData = {
        name: 'Updated Product Name',
        price: 80
      };

      const res = await request(app)
        .put(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${sellerToken}`)
        .send(updateData)
        .expect(403);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('verified by admin before updating products');
    });

    it('should not allow unverified seller to delete products', async () => {
      // Try to delete a product - should fail
      const res = await request(app)
        .delete(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${sellerToken}`)
        .expect(403);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('verified by admin before deleting products');
    });
  });
});