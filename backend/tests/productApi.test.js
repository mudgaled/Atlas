const request = require('supertest');
const app = require('../server');
const User = require('../models/User');
const Product = require('../models/Product');
const mongoose = require('mongoose');
require('dotenv').config();

describe('Product API', () => {
  let sellerToken, buyerToken;
  let sellerUser, buyerUser;

  beforeEach(async () => {
    // Clean up before each test (this will be handled by the global setup)
    await Product.deleteMany({});
    await User.deleteMany({});
    
    // Create users and get tokens
    const sellerRes = await request(app)
      .post('/api/users/register')
      .send({
        name: 'Seller User',
        email: 'seller@example.com',
        password: 'password123',
        role: 'seller'
      });
    
    const buyerRes = await request(app)
      .post('/api/users/register')
      .send({
        name: 'Buyer User',
        email: 'buyer@example.com',
        password: 'password123',
        role: 'buyer'
      });

    sellerToken = sellerRes.body.data.token;
    buyerToken = buyerRes.body.data.token;
    sellerUser = sellerRes.body.data;
    buyerUser = buyerRes.body.data;
  });

  describe('POST /api/products', () => {
    it('should create a new product when authenticated as seller', async () => {
      const productData = {
        name: 'Test Port Service',
        description: 'Test product description',
        category: 'port-services',
        price: 100,
        stock: 10,
        specifications: { duration: '2 hours' },
        location: { port: 'JNPT', city: 'Mumbai' },
        tags: ['port', 'service']
      };

      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send(productData)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.name).toBe(productData.name);
      expect(res.body.data.description).toBe(productData.description);
      expect(res.body.data.category).toBe(productData.category);
      expect(res.body.data.price).toBe(productData.price);
      expect(res.body.data.stock).toBe(productData.stock);
      expect(res.body.data.seller.toString()).toBe(sellerUser._id);
      expect(res.body.data.specifications).toEqual(productData.specifications);
      expect(res.body.data.location).toEqual(productData.location);
      expect(res.body.data.tags).toEqual(expect.arrayContaining(productData.tags));
    });

    it('should not create a product when not authenticated', async () => {
      const productData = {
        name: 'Test Port Service',
        description: 'Test product description',
        category: 'port-services',
        price: 100,
        stock: 10
      };

      const res = await request(app)
        .post('/api/products')
        .send(productData)
        .expect(401);

      expect(res.body.success).toBe(false);
    });

    it('should not create a product when authenticated as buyer', async () => {
      const productData = {
        name: 'Test Port Service',
        description: 'Test product description',
        category: 'port-services',
        price: 100,
        stock: 10
      };

      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send(productData)
        .expect(403);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('not authorized');
    });
  });

  describe('GET /api/products', () => {
    it('should get all active and verified products', async () => {
      // Create some products
      await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          name: 'Active Product',
          description: 'Test product description',
          category: 'port-services',
          price: 100,
          stock: 10,
          isActive: true,
          isVerified: true
        });

      await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          name: 'Inactive Product',
          description: 'Test product description',
          category: 'port-services',
          price: 200,
          stock: 5,
          isActive: false,
          isVerified: true
        });

      const res = await request(app)
        .get('/api/products')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.products).toHaveLength(1); // Only active and verified product should be returned
      expect(res.body.data.products[0].name).toBe('Active Product');
    });

    it('should search products by keyword', async () => {
      // Create products
      await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          name: 'Premium Port Service',
          description: 'High quality port service',
          category: 'port-services',
          price: 150,
          stock: 5,
          tags: ['premium', 'port'],
          isActive: true,
          isVerified: true
        });

      await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          name: 'Customs Clearance',
          description: 'Efficient customs clearance service',
          category: 'customs-clearance',
          price: 200,
          stock: 3,
          tags: ['customs', 'clearance'],
          isActive: true,
          isVerified: true
        });

      // Search by keyword
      const res = await request(app)
        .get('/api/products?keyword=port')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.products).toHaveLength(1);
      expect(res.body.data.products[0].name).toContain('Premium Port Service');
    });
  });

  describe('GET /api/products/:id', () => {
    it('should get a product by ID', async () => {
      // Create a product
      const createRes = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          name: 'Sample Product',
          description: 'Test product description',
          category: 'port-services',
          price: 100,
          stock: 10,
          isActive: true,
          isVerified: true
        })
        .expect(201);

      const productId = createRes.body.data._id;

      // Get the product by ID
      const res = await request(app)
        .get(`/api/products/${productId}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.name).toBe('Sample Product');
      expect(res.body.data.seller).toBeDefined();
      expect(res.body.data.seller.name).toBe('Seller User');
    });

    it('should return 404 for non-existent product', async () => {
      const res = await request(app)
        .get('/api/products/507f1f77bcf86cd799439011')
        .expect(404);

      expect(res.body.success).toBe(false);
    });
  });

  describe('PUT /api/products/:id', () => {
    it('should update a product when authenticated as the seller', async () => {
      // Create a product
      const createRes = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          name: 'Original Product',
          description: 'Original description',
          category: 'port-services',
          price: 100,
          stock: 10
        })
        .expect(201);

      const productId = createRes.body.data._id;

      // Update the product
      const updateData = {
        name: 'Updated Product',
        description: 'Updated description',
        price: 150,
        stock: 15
      };

      const res = await request(app)
        .put(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${sellerToken}`)
        .send(updateData)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Updated Product');
      expect(res.body.data.description).toBe('Updated description');
      expect(res.body.data.price).toBe(150);
      expect(res.body.data.stock).toBe(15);
    });

    it('should not update a product when not authenticated', async () => {
      // Create a product
      const createRes = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          name: 'Original Product',
          description: 'Original description',
          category: 'port-services',
          price: 100,
          stock: 10
        })
        .expect(201);

      const productId = createRes.body.data._id;

      // Try to update without authentication
      const res = await request(app)
        .put(`/api/products/${productId}`)
        .send({ name: 'Unauthorized Update' })
        .expect(401);

      expect(res.body.success).toBe(false);
    });

    it('should not update a product when authenticated as a different seller', async () => {
      // Create first seller and product
      const createRes = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          name: 'Original Product',
          description: 'Original description',
          category: 'port-services',
          price: 100,
          stock: 10
        })
        .expect(201);

      const productId = createRes.body.data._id;

      // Create second seller
      const secondSellerRes = await request(app)
        .post('/api/users/register')
        .send({
          name: 'Second Seller',
          email: 'second@example.com',
          password: 'password123',
          role: 'seller'
        });
      
      const secondSellerToken = secondSellerRes.body.data.token;

      // Try to update with different seller's token
      const res = await request(app)
        .put(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${secondSellerToken}`)
        .send({ name: 'Unauthorized Update' })
        .expect(403);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('not authorized');
    });
  });

  describe('DELETE /api/products/:id', () => {
    it('should delete a product when authenticated as the seller', async () => {
      // Create a product
      const createRes = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          name: 'Product to Delete',
          description: 'Description',
          category: 'port-services',
          price: 100,
          stock: 10
        })
        .expect(201);

      const productId = createRes.body.data._id;

      // Delete the product
      const res = await request(app)
        .delete(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${sellerToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Product removed');

      // Verify the product is deleted
      await request(app)
        .get(`/api/products/${productId}`)
        .expect(404);
    });

    it('should not delete a product when not authenticated', async () => {
      // Create a product
      const createRes = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          name: 'Product to Delete',
          description: 'Description',
          category: 'port-services',
          price: 100,
          stock: 10
        })
        .expect(201);

      const productId = createRes.body.data._id;

      // Try to delete without authentication
      const res = await request(app)
        .delete(`/api/products/${productId}`)
        .expect(401);

      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/products/mine', () => {
    it('should get products created by the authenticated seller', async () => {
      // Create products
      await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          name: 'Seller 1 Product 1',
          description: 'Description',
          category: 'port-services',
          price: 100,
          stock: 10
        });

      await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          name: 'Seller 1 Product 2',
          description: 'Description',
          category: 'customs-clearance',
          price: 200,
          stock: 5
        });

      // Create another seller and product
      const anotherSellerRes = await request(app)
        .post('/api/users/register')
        .send({
          name: 'Another Seller',
          email: 'another@example.com',
          password: 'password123',
          role: 'seller'
        });
      
      await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${anotherSellerRes.body.data.token}`)
        .send({
          name: 'Another Seller Product',
          description: 'Description',
          category: 'logistics',
          price: 300,
          stock: 8
        });

      // Get seller's own products
      const res = await request(app)
        .get('/api/products/mine')
        .set('Authorization', `Bearer ${sellerToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.products).toHaveLength(2);
      expect(res.body.data.products[0].name).toContain('Seller 1');
      expect(res.body.data.products[1].name).toContain('Seller 1');
    });

    it('should not allow non-sellers to access their products', async () => {
      const res = await request(app)
        .get('/api/products/mine')
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(403);

      expect(res.body.success).toBe(false);
    });
  });
});