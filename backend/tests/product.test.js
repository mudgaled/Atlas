const request = require('supertest');
const app = require('../server');
const Product = require('../models/Product');
const User = require('../models/User');

describe('Product API', () => {
  let testUser;

  beforeEach(async () => {
    // Clear existing products
    await Product.deleteMany({});
    await User.deleteMany({});

    // Create a test user
    testUser = await User.create({
      name: 'Test Seller',
      email: 'seller@example.com',
      password: 'password123',
      role: 'seller',
      profile: {
        company: {
          name: 'Test Company',
          registrationNumber: '12345678'
        },
        verified: true
      }
    });
  });

  describe('GET /api/products', () => {
    it('should return an empty list when no products exist', async () => {
      const response = await request(app)
        .get('/api/products')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.products).toBeInstanceOf(Array);
      expect(response.body.data.products.length).toBe(0);
    });

    it('should return products when they exist', async () => {
      // Create test products
      const testProducts = [
        {
          name: 'Port Service 1',
          description: 'Test port service description',
          category: 'port-services',
          price: 5000,
          seller: testUser._id,
          isActive: true
        },
        {
          name: 'Customs Clearance Service',
          description: 'Test customs clearance service',
          category: 'customs-clearance',
          price: 3000,
          seller: testUser._id,
          isActive: true
        }
      ];

      for (const product of testProducts) {
        await Product.create(product);
      }

      const response = await request(app)
        .get('/api/products')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.products).toBeInstanceOf(Array);
      expect(response.body.data.products.length).toBe(2);
      expect(response.body.data.products[0].name).toBe('Customs Clearance Service');
      expect(response.body.data.products[1].name).toBe('Port Service 1');
    });

    it('should filter products by category', async () => {
      // Create test products in different categories
      await Product.create({
        name: 'Port Service',
        description: 'Test port service',
        category: 'port-services',
        price: 5000,
        seller: testUser._id,
        isActive: true
      });

      await Product.create({
        name: 'Customs Service',
        description: 'Test customs service',
        category: 'customs-clearance',
        price: 3000,
        seller: testUser._id,
        isActive: true
      });

      const response = await request(app)
        .get('/api/products?category=port-services')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.products.length).toBe(1);
      expect(response.body.data.products[0].category).toBe('port-services');
    });

    it('should filter products by keyword', async () => {
      await Product.create({
        name: 'Premium Port Service',
        description: 'High quality port service',
        category: 'port-services',
        price: 5000,
        seller: testUser._id,
        isActive: true
      });

      await Product.create({
        name: 'Basic Customs Service',
        description: 'Affordable customs service',
        category: 'customs-clearance',
        price: 3000,
        seller: testUser._id,
        isActive: true
      });

      const response = await request(app)
        .get('/api/products?keyword=premium')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.products.length).toBe(1);
      expect(response.body.data.products[0].name).toContain('Premium');
    });
  });

  describe('GET /api/products/:id', () => {
    it('should return a specific product by ID', async () => {
      const product = await Product.create({
        name: 'Test Port Service',
        description: 'Test description',
        category: 'port-services',
        price: 5000,
        seller: testUser._id,
        isActive: true
      });

      const response = await request(app)
        .get(`/api/products/${product._id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Test Port Service');
      expect(response.body.data.description).toBe('Test description');
    });

    it('should return 404 if product does not exist', async () => {
      const fakeId = '507f1f77bcf86cd799439011';

      const response = await request(app)
        .get(`/api/products/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });
});