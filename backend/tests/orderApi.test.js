const request = require('supertest');
const app = require('../server');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const mongoose = require('mongoose');
require('dotenv').config();

describe('Order API', () => {
  let buyerToken, sellerToken;
  let buyerUser, sellerUser;
  let testProduct;

  beforeEach(async () => {
    // Clean up before each test (this will be handled by the global setup)
    await Order.deleteMany({});
    await Product.deleteMany({});
    await User.deleteMany({});
    
    // Create users and get tokens
    const buyerRes = await request(app)
      .post('/api/users/register')
      .send({
        name: 'Buyer User',
        email: 'buyer@example.com',
        password: 'password123',
        role: 'buyer'
      });
    
    const sellerRes = await request(app)
      .post('/api/users/register')
      .send({
        name: 'Seller User',
        email: 'seller@example.com',
        password: 'password123',
        role: 'seller'
      });

    buyerToken = buyerRes.body.data.token;
    sellerToken = sellerRes.body.data.token;
    buyerUser = buyerRes.body.data;
    sellerUser = sellerRes.body.data;
    
    // Create a test product
    const productRes = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${sellerToken}`)
      .send({
        name: 'Test Product',
        description: 'Test product description',
        category: 'port-services',
        price: 100,
        stock: 10,
        isActive: true,
        isVerified: true
      })
      .expect(201);

    testProduct = productRes.body.data;
  });

  describe('POST /api/orders', () => {
    it('should create a new order successfully', async () => {
      const orderData = {
        orderItems: [
          {
            product: testProduct._id,
            name: testProduct.name,
            quantity: 2,
            price: testProduct.price,
            image: testProduct.images[0] || '',
            seller: testProduct.seller
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
      expect(res.body.data.orderItems).toHaveLength(1);
      expect(res.body.data.shippingAddress.fullName).toBe(orderData.shippingAddress.fullName);
      expect(res.body.data.paymentMethod).toBe(orderData.paymentMethod);
      expect(res.body.data.totalPrice).toBe(orderData.totalPrice);
      expect(res.body.data.user.toString()).toBe(buyerUser._id);
      expect(res.body.data.seller.toString()).toBe(sellerUser._id);
      expect(res.body.data.status).toBe('pending');
      expect(res.body.data.isPaid).toBe(false);
    });

    it('should not create order with insufficient stock', async () => {
      // Update product to have only 1 item in stock
      await request(app)
        .put(`/api/products/${testProduct._id}`)
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({ stock: 1 });

      const orderData = {
        orderItems: [
          {
            product: testProduct._id,
            name: testProduct.name,
            quantity: 5, // More than available stock
            price: testProduct.price
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
        itemsPrice: 500,
        taxPrice: 50,
        shippingPrice: 10,
        totalPrice: 560
      };

      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send(orderData);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Insufficient stock');
    });

    it('should not create order without authentication', async () => {
      const orderData = {
        orderItems: [
          {
            product: testProduct._id,
            name: testProduct.name,
            quantity: 1,
            price: testProduct.price
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

      const res = await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(401);

      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/orders/:id', () => {
    it('should get order by ID when authenticated as buyer or seller', async () => {
      // Create an order
      const orderData = {
        orderItems: [
          {
            product: testProduct._id,
            name: testProduct.name,
            quantity: 1,
            price: testProduct.price
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

      const createRes = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send(orderData)
        .expect(201);

      const orderId = createRes.body.data._id;

      // Get order as buyer
      const res = await request(app)
        .get(`/api/orders/${orderId}`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data._id).toBe(orderId);
    });

    it('should allow seller to access their order', async () => {
      // Create an order
      const orderData = {
        orderItems: [
          {
            product: testProduct._id,
            name: testProduct.name,
            quantity: 1,
            price: testProduct.price
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

      const createRes = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send(orderData)
        .expect(201);

      const orderId = createRes.body.data._id;

      // Get order as seller
      const res = await request(app)
        .get(`/api/orders/${orderId}`)
        .set('Authorization', `Bearer ${sellerToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data._id).toBe(orderId);
    });

    it('should not allow unauthorized user to access order', async () => {
      // Create another user
      const unauthorizedUser = await request(app)
        .post('/api/users/register')
        .send({
          name: 'Unauthorized User',
          email: 'unauthorized@example.com',
          password: 'password123',
          role: 'buyer'
        });

      const unauthorizedToken = unauthorizedUser.body.data.token;

      // Create an order
      const orderData = {
        orderItems: [
          {
            product: testProduct._id,
            name: testProduct.name,
            quantity: 1,
            price: testProduct.price
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

      const createRes = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send(orderData)
        .expect(201);

      const orderId = createRes.body.data._id;

      // Try to access order as unauthorized user
      const res = await request(app)
        .get(`/api/orders/${orderId}`)
        .set('Authorization', `Bearer ${unauthorizedToken}`)
        .expect(403);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('not authorized');
    });
  });

  describe('PUT /api/orders/:id/pay', () => {
    it('should update order to paid when authenticated', async () => {
      // Create an order
      const orderData = {
        orderItems: [
          {
            product: testProduct._id,
            name: testProduct.name,
            quantity: 1,
            price: testProduct.price
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

      const createRes = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send(orderData)
        .expect(201);

      const orderId = createRes.body.data._id;

      // Update order to paid
      const paymentData = {
        id: 'payment_id_123',
        status: 'completed',
        update_time: '2023-01-01T00:00:00Z',
        payer: {
          email_address: 'buyer@example.com'
        }
      };

      const res = await request(app)
        .put(`/api/orders/${orderId}/pay`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .send(paymentData)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.isPaid).toBe(true);
      expect(res.body.data.paidAt).toBeDefined();
      expect(res.body.data.paymentResult).toBeDefined();
    });

    it('should not update order to paid without authentication', async () => {
      // Create an order
      const orderData = {
        orderItems: [
          {
            product: testProduct._id,
            name: testProduct.name,
            quantity: 1,
            price: testProduct.price
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

      const createRes = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send(orderData)
        .expect(201);

      const orderId = createRes.body.data._id;

      // Try to update without authentication
      const res = await request(app)
        .put(`/api/orders/${orderId}/pay`)
        .send({
          id: 'payment_id_123',
          status: 'completed',
          update_time: '2023-01-01T00:00:00Z',
          payer: {
            email_address: 'buyer@example.com'
          }
        })
        .expect(401);

      expect(res.body.success).toBe(false);
    });
  });

  describe('PUT /api/orders/:id/deliver', () => {
    it('should update order to delivered when authenticated as seller', async () => {
      // Create an order
      const orderData = {
        orderItems: [
          {
            product: testProduct._id,
            name: testProduct.name,
            quantity: 1,
            price: testProduct.price
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

      const createRes = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send(orderData)
        .expect(201);

      const orderId = createRes.body.data._id;

      // Update order to delivered as seller
      const res = await request(app)
        .put(`/api/orders/${orderId}/deliver`)
        .set('Authorization', `Bearer ${sellerToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.isDelivered).toBe(true);
      expect(res.body.data.deliveredAt).toBeDefined();
    });

    it('should not update order to delivered when authenticated as buyer', async () => {
      // Create an order
      const orderData = {
        orderItems: [
          {
            product: testProduct._id,
            name: testProduct.name,
            quantity: 1,
            price: testProduct.price
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

      const createRes = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send(orderData)
        .expect(201);

      const orderId = createRes.body.data._id;

      // Try to update to delivered as buyer
      const res = await request(app)
        .put(`/api/orders/${orderId}/deliver`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(403);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('not authorized');
    });

    it('should not update order to delivered without authentication', async () => {
      // Create an order
      const orderData = {
        orderItems: [
          {
            product: testProduct._id,
            name: testProduct.name,
            quantity: 1,
            price: testProduct.price
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

      const createRes = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send(orderData)
        .expect(201);

      const orderId = createRes.body.data._id;

      // Try to update without authentication
      const res = await request(app)
        .put(`/api/orders/${orderId}/deliver`)
        .expect(401);

      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/orders/myorders', () => {
    it('should get orders for authenticated buyer', async () => {
      // Create multiple orders for the same buyer
      await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({
          orderItems: [
            {
              product: testProduct._id,
              name: testProduct.name,
              quantity: 1,
              price: testProduct.price
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
        })
        .expect(201);

      await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({
          orderItems: [
            {
              product: testProduct._id,
              name: testProduct.name,
              quantity: 2,
              price: testProduct.price
            }
          ],
          shippingAddress: {
            fullName: 'John Doe',
            address: '456 Oak St',
            city: 'Delhi',
            postalCode: '110001',
            country: 'India',
            port: 'Nhava Sheva'
          },
          paymentMethod: 'CARD',
          itemsPrice: 200,
          taxPrice: 20,
          shippingPrice: 10,
          totalPrice: 230
        })
        .expect(201);

      // Get buyer's orders
      const res = await request(app)
        .get('/api/orders/myorders')
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.data[0].user.toString()).toBe(buyerUser._id);
      expect(res.body.data[1].user.toString()).toBe(buyerUser._id);
    });

    it('should not return orders for other buyers', async () => {
      // Create order for first buyer
      await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({
          orderItems: [
            {
              product: testProduct._id,
              name: testProduct.name,
              quantity: 1,
              price: testProduct.price
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
        })
        .expect(201);

      // Create another buyer
      const anotherBuyer = await request(app)
        .post('/api/users/register')
        .send({
          name: 'Another Buyer',
          email: 'anotherbuyer@example.com',
          password: 'password123',
          role: 'buyer'
        });

      const anotherBuyerToken = anotherBuyer.body.data.token;

      // Create order for second buyer
      await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${anotherBuyerToken}`)
        .send({
          orderItems: [
            {
              product: testProduct._id,
              name: testProduct.name,
              quantity: 1,
              price: testProduct.price
            }
          ],
          shippingAddress: {
            fullName: 'Jane Smith',
            address: '789 Pine St',
            city: 'Bangalore',
            postalCode: '560001',
            country: 'India',
            port: 'Chennai'
          },
          paymentMethod: 'CARD',
          itemsPrice: 100,
          taxPrice: 10,
          shippingPrice: 5,
          totalPrice: 115
        })
        .expect(201);

      // Get first buyer's orders
      const res = await request(app)
        .get('/api/orders/myorders')
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].shippingAddress.fullName).toBe('John Doe');
    });
  });

  describe('GET /api/orders/mysellerorders', () => {
    it('should get orders for authenticated seller', async () => {
      // Create two products from the same seller
      const product2Res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          name: 'Test Product 2',
          description: 'Another test product',
          category: 'customs-clearance',
          price: 150,
          stock: 8,
          isActive: true,
          isVerified: true
        })
        .expect(201);

      const product2 = product2Res.body.data;

      // Create orders with seller's products
      await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({
          orderItems: [
            {
              product: testProduct._id,
              name: testProduct.name,
              quantity: 1,
              price: testProduct.price
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
        })
        .expect(201);

      await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({
          orderItems: [
            {
              product: product2._id,
              name: product2.name,
              quantity: 1,
              price: product2.price
            }
          ],
          shippingAddress: {
            fullName: 'Jane Smith',
            address: '456 Oak St',
            city: 'Delhi',
            postalCode: '110001',
            country: 'India',
            port: 'Nhava Sheva'
          },
          paymentMethod: 'CARD',
          itemsPrice: 150,
          taxPrice: 15,
          shippingPrice: 7,
          totalPrice: 172
        })
        .expect(201);

      // Get seller's orders
      const res = await request(app)
        .get('/api/orders/mysellerorders')
        .set('Authorization', `Bearer ${sellerToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.data[0].seller.toString()).toBe(sellerUser._id);
      expect(res.body.data[1].seller.toString()).toBe(sellerUser._id);
    });

    it('should not allow non-sellers to access seller orders', async () => {
      const res = await request(app)
        .get('/api/orders/mysellerorders')
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(403);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('not authorized');
    });
  });
});