const request = require('supertest');
const app = require('../server');
const User = require('../models/User');
const mongoose = require('mongoose');
require('dotenv').config();

describe('Authentication API', () => {
  beforeEach(async () => {
    // Clean up before each test (this will be handled by the global setup)
    await User.deleteMany({});
  });

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
    });

    it('should not register user with invalid email', async () => {
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
    });

    it('should not register user with password less than 6 characters', async () => {
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
    });

    it('should not register user with duplicate email', async () => {
      // First registration
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      };

      // Register first user
      await request(app)
        .post('/api/users/register')
        .send(userData)
        .expect(201);

      // Try to register second user with same email
      const res = await request(app)
        .post('/api/users/register')
        .send(userData)
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('already exists');
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

    it('should not login user with invalid email', async () => {
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

    it('should not login user with invalid password', async () => {
      // First register a user
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      };

      await request(app)
        .post('/api/users/register')
        .send(userData);

      // Then try to login with wrong password
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

    it('should not login user without providing email or password', async () => {
      const res = await request(app)
        .post('/api/users/login')
        .send({})
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Please provide email and password');
    });
  });

  describe('GET /api/users/profile', () => {
    it('should return user profile when authenticated', async () => {
      // Register user
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

      // Get profile with valid token
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

    it('should return 401 when not authenticated', async () => {
      const res = await request(app)
        .get('/api/users/profile')
        .expect(401);

      expect(res.body.success).toBe(false);
    });
  });

  describe('PUT /api/users/profile', () => {
    it('should update user profile when authenticated', async () => {
      // Register user
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
    });

    it('should not update user role or password through profile update', async () => {
      // Register user
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
      // Role should remain unchanged
      expect(res.body.data.role).toBe('buyer');
    });

    it('should return 401 when not authenticated', async () => {
      const res = await request(app)
        .put('/api/users/profile')
        .send({ name: 'Updated Name' })
        .expect(401);

      expect(res.body.success).toBe(false);
    });
  });
});