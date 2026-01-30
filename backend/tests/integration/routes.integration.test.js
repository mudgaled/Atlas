const request = require('supertest');
const app = require('../../server');

describe('API Route Tests', () => {
  describe('Health Check Endpoint', () => {
    it('should return health status', async () => {
      const res = await request(app)
        .get('/api/health')
        .expect(200);

      expect(res.body.status).toBe('OK');
      expect(res.body.message).toBe('Server is running');
    });
  });

  describe('Non-existent routes', () => {
    it('should return 404 for non-existent routes', async () => {
      const res = await request(app)
        .get('/api/nonexistent')
        .expect(404);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Route not found');
    });
  });

  describe('User Routes', () => {
    it('should handle user registration route', async () => {
      const res = await request(app)
        .post('/api/users/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123'
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
    });

    it('should handle user login route', async () => {
      // First register a user
      await request(app)
        .post('/api/users/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123'
        })
        .expect(201);

      // Then try to login
      const res = await request(app)
        .post('/api/users/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
    });
  });

  describe('Product Routes', () => {
    it('should handle getting products route', async () => {
      const res = await request(app)
        .get('/api/products')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
    });
  });

  describe('Order Routes', () => {
    it('should handle health check for orders route', async () => {
      // This will return 404 because the endpoint requires authentication
      // but it should not return a route not found error
      const res = await request(app)
        .get('/api/orders')
        .expect(401); // Unauthorized due to auth middleware

      // The important thing is that it's not a 404 (route not found)
      expect(res.status).not.toBe(404);
    });
  });
});