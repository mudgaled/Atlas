const request = require('supertest');
const app = require('../../server');
const User = require('../../models/User');
const Product = require('../../models/Product');
const Order = require('../../models/Order');
const mongoose = require('mongoose');

describe('API Integration Tests', () => {
  beforeAll(async () => {
    // Connect to test database
    const mongoUri = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/marketplace_test';
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  beforeEach(async () => {
    // Clean up before each test
    await User.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('Authentication API Integration Tests', () => {
    describe('POST /api/users/register', () => {
      it('should register a new user successfully', async () => {
        const userData = {
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
          role: 'buyer'
        };

        const res = await request(app)
          .post('/api/users/register')
          .send(userData)
          .expect(201);

        expect(res.body.success).toBe(true);
        expect(res.body.data).toBeDefined();
        expect(res.body.data.email).toBe(userData.email);
        expect(res.body.data.name).toBe(userData.name);
        expect(res.body.data.role).toBe(userData.role);
        expect(res.body.data.token).toBeDefined();

        // Verify user was saved to database
        const user = await User.findOne({ email: userData.email });
        expect(user).toBeDefined();
        expect(user.name).toBe(userData.name);
      });

      it('should return 400 if email is invalid', async () => {
        const userData = {
          name: 'Test User',
          email: 'invalid-email',
          password: 'password123'
        };

        const res = await request(app)
          .post('/api/users/register')
          .send(userData)
          .expect(400);

        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Please enter a valid email');
      });

      it('should return 400 if password is too short', async () => {
        const userData = {
          name: 'Test User',
          email: 'test@example.com',
          password: '12345' // Less than 6 characters
        };

        const res = await request(app)
          .post('/api/users/register')
          .send(userData)
          .expect(400);

        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Password must be at least 6 characters');
      });

      it('should return 400 if user already exists', async () => {
        // First registration
        const userData = {
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123'
        };

        await request(app)
          .post('/api/users/register')
          .send(userData)
          .expect(201);

        // Second registration with same email
        const res = await request(app)
          .post('/api/users/register')
          .send(userData)
          .expect(400);

        expect(res.body.success).toBe(false);
        expect(res.body.message).toContain('already exists');
      });

      it('should return 400 if required fields are missing', async () => {
        const userData = {
          name: 'Test User'
          // Missing email and password
        };

        const res = await request(app)
          .post('/api/users/register')
          .send(userData)
          .expect(400);

        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Please provide all required fields');
      });
    });

    describe('POST /api/users/login', () => {
      it('should login user with valid credentials', async () => {
        // First register a user
        const userData = {
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123'
        };

        await request(app)
          .post('/api/users/register')
          .send(userData);

        // Then login
        const res = await request(app)
          .post('/api/users/login')
          .send({
            email: userData.email,
            password: userData.password
          })
          .expect(200);

        expect(res.body.success).toBe(true);
        expect(res.body.data).toBeDefined();
        expect(res.body.data.email).toBe(userData.email);
        expect(res.body.data.token).toBeDefined();
      });

      it('should return 401 with invalid email', async () => {
        const res = await request(app)
          .post('/api/users/login')
          .send({
            email: 'nonexistent@example.com',
            password: 'password123'
          })
          .expect(401);

        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Invalid email or password');
      });

      it('should return 401 with invalid password', async () => {
        // Register a user
        const userData = {
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123'
        };

        await request(app)
          .post('/api/users/register')
          .send(userData);

        // Try to login with wrong password
        const res = await request(app)
          .post('/api/users/login')
          .send({
            email: userData.email,
            password: 'wrongpassword'
          })
          .expect(401);

        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Invalid email or password');
      });

      it('should return 400 if credentials are missing', async () => {
        const res = await request(app)
          .post('/api/users/login')
          .send({})
          .expect(400);

        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Please provide email and password');
      });
    });

    describe('GET /api/users/profile', () => {
      it('should return user profile with valid token', async () => {
        // Register and login user
        const userData = {
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123'
        };

        const registerRes = await request(app)
          .post('/api/users/register')
          .send(userData)
          .expect(201);

        const token = registerRes.body.data.token;

        // Get profile
        const res = await request(app)
          .get('/api/users/profile')
          .set('Authorization', `Bearer ${token}`)
          .expect(200);

        expect(res.body.success).toBe(true);
        expect(res.body.data).toBeDefined();
        expect(res.body.data.email).toBe(userData.email);
        expect(res.body.data.name).toBe(userData.name);
        expect(res.body.data.password).toBeUndefined(); // Password should not be returned
      });

      it('should return 401 without valid token', async () => {
        const res = await request(app)
          .get('/api/users/profile')
          .expect(401);

        expect(res.body.success).toBe(false);
      });
    });

    describe('PUT /api/users/profile', () => {
      it('should update user profile with valid token', async () => {
        // Register and login user
        const userData = {
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123'
        };

        const registerRes = await request(app)
          .post('/api/users/register')
          .send(userData)
          .expect(201);

        const token = registerRes.body.data.token;

        // Update profile
        const updatedData = {
          name: 'Updated Name',
          profile: {
            phone: '+1234567890'
          }
        };

        const res = await request(app)
          .put('/api/users/profile')
          .set('Authorization', `Bearer ${token}`)
          .send(updatedData)
          .expect(200);

        expect(res.body.success).toBe(true);
        expect(res.body.data.name).toBe(updatedData.name);
        expect(res.body.data.profile.phone).toBe(updatedData.profile.phone);

        // Verify changes were saved to database
        const user = await User.findById(registerRes.body.data._id);
        expect(user.name).toBe(updatedData.name);
        expect(user.profile.phone).toBe(updatedData.profile.phone);
      });

      it('should not update role or password through profile update', async () => {
        // Register and login user
        const userData = {
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
          role: 'buyer'
        };

        const registerRes = await request(app)
          .post('/api/users/register')
          .send(userData)
          .expect(201);

        const token = registerRes.body.data.token;

        // Attempt to update role and password (should be ignored)
        const updatedData = {
          name: 'Updated Name',
          role: 'admin', // Should be ignored
          password: 'newpassword123' // Should be ignored
        };

        const res = await request(app)
          .put('/api/users/profile')
          .set('Authorization', `Bearer ${token}`)
          .send(updatedData)
          .expect(200);

        expect(res.body.success).toBe(true);
        expect(res.body.data.role).toBe('buyer'); // Should remain unchanged

        // Verify in database that role was not changed
        const user = await User.findById(registerRes.body.data._id);
        expect(user.role).toBe('buyer');
      });

      it('should return 401 without valid token', async () => {
        const res = await request(app)
          .put('/api/users/profile')
          .send({ name: 'Updated Name' })
          .expect(401);

        expect(res.body.success).toBe(false);
      });
    });
  });

  describe('Product API Integration Tests', () => {
    let buyerToken, sellerToken;

    beforeEach(async () => {
      // Create users
      const buyerRes = await request(app)
        .post('/api/users/register')
        .send({
          name: 'Buyer User',
          email: 'buyer@example.com',
          password: 'password123',
          role: 'buyer'
        })
        .expect(201);

      const sellerRes = await request(app)
        .post('/api/users/register')
        .send({
          name: 'Seller User',
          email: 'seller@example.com',
          password: 'password123',
          role: 'seller'
        })
        .expect(201);

      buyerToken = buyerRes.body.data.token;
      sellerToken = sellerRes.body.data.token;
    });

    describe('POST /api/products', () => {
      it('should create a product when authenticated as seller', async () => {
        const productData = {
          name: 'Test Product',
          description: 'Test product description',
          category: 'port-services',
          price: 100,
          stock: 10,
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
        expect(res.body.data.seller.toString()).toBe(res.body.data.seller);

        // Verify product was saved
        const product = await Product.findById(res.body.data._id);
        expect(product).toBeDefined();
        expect(product.name).toBe(productData.name);
      });

      it('should return 403 when buyer tries to create product', async () => {
        const productData = {
          name: 'Test Product',
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
      });

      it('should return 401 without authentication', async () => {
        const productData = {
          name: 'Test Product',
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
    });

    describe('GET /api/products', () => {
      it('should get all active and verified products', async () => {
        // Create products
        const productData = {
          name: 'Active Product',
          description: 'Active product description',
          category: 'port-services',
          price: 100,
          stock: 10,
          isActive: true,
          isVerified: true
        };

        await request(app)
          .post('/api/products')
          .set('Authorization', `Bearer ${sellerToken}`)
          .send(productData)
          .expect(201);

        const res = await request(app)
          .get('/api/products')
          .expect(200);

        expect(res.body.success).toBe(true);
        expect(res.body.data).toBeDefined();
        expect(res.body.data.products).toHaveLength(1);
        expect(res.body.data.products[0].name).toBe(productData.name);
      });

      it('should search products by keyword', async () => {
        // Create products
        const productData = {
          name: 'Premium Port Service',
          description: 'Premium port service description',
          category: 'port-services',
          price: 100,
          stock: 10,
          tags: ['premium', 'service']
        };

        await request(app)
          .post('/api/products')
          .set('Authorization', `Bearer ${sellerToken}`)
          .send(productData)
          .expect(201);

        const res = await request(app)
          .get('/api/products?keyword=premium')
          .expect(200);

        expect(res.body.success).toBe(true);
        expect(res.body.data).toBeDefined();
        expect(res.body.data.products).toHaveLength(1);
        expect(res.body.data.products[0].name).toContain('Premium');
      });
    });

    describe('GET /api/products/:id', () => {
      it('should get a product by ID', async () => {
        // Create a product
        const productData = {
          name: 'Test Product',
          description: 'Test product description',
          category: 'port-services',
          price: 100,
          stock: 10
        };

        const createRes = await request(app)
          .post('/api/products')
          .set('Authorization', `Bearer ${sellerToken}`)
          .send(productData)
          .expect(201);

        const productId = createRes.body.data._id;

        const res = await request(app)
          .get(`/api/products/${productId}`)
          .expect(200);

        expect(res.body.success).toBe(true);
        expect(res.body.data).toBeDefined();
        expect(res.body.data._id).toBe(productId);
        expect(res.body.data.name).toBe(productData.name);
      });

      it('should return 404 for non-existent product', async () => {
        const res = await request(app)
          .get('/api/products/invalidId')
          .expect(404);

        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Product not found');
      });
    });

    describe('PUT /api/products/:id', () => {
      it('should update a product when authenticated as the seller', async () => {
        // Create a product
        const productData = {
          name: 'Original Product',
          description: 'Original description',
          category: 'port-services',
          price: 100,
          stock: 10
        };

        const createRes = await request(app)
          .post('/api/products')
          .set('Authorization', `Bearer ${sellerToken}`)
          .send(productData)
          .expect(201);

        const productId = createRes.body.data._id;

        // Update the product
        const updateData = {
          name: 'Updated Product',
          description: 'Updated description',
          price: 150
        };

        const res = await request(app)
          .put(`/api/products/${productId}`)
          .set('Authorization', `Bearer ${sellerToken}`)
          .send(updateData)
          .expect(200);

        expect(res.body.success).toBe(true);
        expect(res.body.data.name).toBe(updateData.name);
        expect(res.body.data.description).toBe(updateData.description);
        expect(res.body.data.price).toBe(updateData.price);

        // Verify changes were saved to database
        const product = await Product.findById(productId);
        expect(product.name).toBe(updateData.name);
        expect(product.description).toBe(updateData.description);
        expect(product.price).toBe(updateData.price);
      });

      it('should return 403 when different seller tries to update', async () => {
        // Create first seller and product
        const firstSellerRes = await request(app)
          .post('/api/users/register')
          .send({
            name: 'First Seller',
            email: 'firstseller@example.com',
            password: 'password123',
            role: 'seller'
          })
          .expect(201);

        const firstSellerToken = firstSellerRes.body.data.token;

        const productData = {
          name: 'Original Product',
          description: 'Original description',
          category: 'port-services',
          price: 100,
          stock: 10
        };

        const createRes = await request(app)
          .post('/api/products')
          .set('Authorization', `Bearer ${firstSellerToken}`)
          .send(productData)
          .expect(201);

        const productId = createRes.body.data._id;

        // Try to update with second seller
        const res = await request(app)
          .put(`/api/products/${productId}`)
          .set('Authorization', `Bearer ${sellerToken}`)
          .send({ name: 'Updated Product' })
          .expect(403);

        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Not authorized to update this product');
      });
    });
  });

  describe('Order API Integration Tests', () => {
    let buyerToken, sellerToken;
    let productId;

    beforeEach(async () => {
      // Create buyer and seller
      const buyerRes = await request(app)
        .post('/api/users/register')
        .send({
          name: 'Buyer User',
          email: 'buyer@example.com',
          password: 'password123',
          role: 'buyer'
        })
        .expect(201);

      const sellerRes = await request(app)
        .post('/api/users/register')
        .send({
          name: 'Seller User',
          email: 'seller@example.com',
          password: 'password123',
          role: 'seller'
        })
        .expect(201);

      buyerToken = buyerRes.body.data.token;
      sellerToken = sellerRes.body.data.token;

      // Create a product
      const productRes = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          name: 'Test Product',
          description: 'Test product description',
          category: 'port-services',
          price: 100,
          stock: 10
        })
        .expect(201);

      productId = productRes.body.data._id;
    });

    describe('POST /api/orders', () => {
      it('should create a new order successfully', async () => {
        const orderData = {
          orderItems: [
            {
              product: productId,
              name: 'Test Product',
              quantity: 2,
              price: 100,
              image: '',
              seller: sellerToken // This will be extracted from product
            }
          ],
          shippingAddress: {
            fullName: 'John Doe',
            address: '123 Main St',
            city: 'Mumbai',
            postalCode: '400001',
            country: 'India',
            port: 'JNPT'
          },
          paymentMethod: 'CARD',
          itemsPrice: 200,
          taxPrice: 20,
          shippingPrice: 10,
          totalPrice: 230
        };

        const res = await request(app)
          .post('/api/orders')
          .set('Authorization', `Bearer ${buyerToken}`)
          .send(orderData)
          .expect(201);

        expect(res.body.success).toBe(true);
        expect(res.body.data).toBeDefined();
        expect(res.body.data.totalPrice).toBe(orderData.totalPrice);

        // Verify order was saved to database
        const order = await Order.findById(res.body.data._id);
        expect(order).toBeDefined();
        expect(order.user.toString()).toBe(res.body.data.user);
        expect(order.totalPrice).toBe(orderData.totalPrice);
      });

      it('should return 401 without authentication', async () => {
        const orderData = {
          orderItems: [],
          shippingAddress: {},
          paymentMethod: 'CARD',
          itemsPrice: 0,
          taxPrice: 0,
          shippingPrice: 0,
          totalPrice: 0
        };

        const res = await request(app)
          .post('/api/orders')
          .send(orderData)
          .expect(401);

        expect(res.body.success).toBe(false);
      });
    });

    describe('GET /api/orders/myorders', () => {
      it('should get orders for authenticated buyer', async () => {
        // Create an order first
        const orderData = {
          orderItems: [
            {
              product: productId,
              name: 'Test Product',
              quantity: 1,
              price: 100,
              image: '',
              seller: sellerToken
            }
          ],
          shippingAddress: {
            fullName: 'John Doe',
            address: '123 Main St',
            city: 'Mumbai',
            postalCode: '400001',
            country: 'India',
            port: 'JNPT'
          },
          paymentMethod: 'CARD',
          itemsPrice: 100,
          taxPrice: 10,
          shippingPrice: 5,
          totalPrice: 115
        };

        await request(app)
          .post('/api/orders')
          .set('Authorization', `Bearer ${buyerToken}`)
          .send(orderData)
          .expect(201);

        // Get buyer's orders
        const res = await request(app)
          .get('/api/orders/myorders')
          .set('Authorization', `Bearer ${buyerToken}`)
          .expect(200);

        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveLength(1);
        expect(res.body.data[0].user.toString()).toBe(res.body.data[0].user);
      });

      it('should return 401 without authentication', async () => {
        const res = await request(app)
          .get('/api/orders/myorders')
          .expect(401);

        expect(res.body.success).toBe(false);
      });
    });
  });
});