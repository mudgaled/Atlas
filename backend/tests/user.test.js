const User = require('../models/User');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Mock data for testing
const mockUser = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'password123',
  role: 'buyer'
};

describe('User Model', () => {
  beforeEach(async () => {
    // Clean up before each test (this will be handled by the global setup)
    await User.deleteMany({});
  });

  describe('User Schema', () => {
    it('should create a new user successfully', async () => {
      const user = new User(mockUser);
      const savedUser = await user.save();

      expect(savedUser._id).toBeDefined();
      expect(savedUser.name).toBe(mockUser.name);
      expect(savedUser.email).toBe(mockUser.email);
      expect(savedUser.role).toBe(mockUser.role);
      expect(savedUser.password).not.toBe(mockUser.password); // Should be hashed
      expect(savedUser.createdAt).toBeDefined();
      expect(savedUser.updatedAt).toBeDefined();
    });

    it('should require name field', async () => {
      const user = new User({
        ...mockUser,
        name: undefined
      });

      let error;
      try {
        await user.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.errors.name).toBeDefined();
      expect(error.errors.name.message).toBe('Name is required');
    });

    it('should require email field', async () => {
      const user = new User({
        ...mockUser,
        email: undefined
      });

      let error;
      try {
        await user.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.errors.email).toBeDefined();
      expect(error.errors.email.message).toBe('Email is required');
    });

    it('should require valid email format', async () => {
      const user = new User({
        ...mockUser,
        email: 'invalid-email'
      });

      let error;
      try {
        await user.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.errors.email).toBeDefined();
      expect(error.errors.email.message).toBe('Please enter a valid email');
    });

    it('should require password field', async () => {
      const user = new User({
        ...mockUser,
        password: undefined
      });

      let error;
      try {
        await user.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.errors.password).toBeDefined();
      expect(error.errors.password.message).toBe('Password is required');
    });

    it('should require password to be at least 6 characters', async () => {
      const user = new User({
        ...mockUser,
        password: '12345'
      });

      let error;
      try {
        await user.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.errors.password).toBeDefined();
      expect(error.errors.password.message).toBe('Password must be at least 6 characters');
    });

    it('should set default role to buyer', async () => {
      const user = new User({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      });

      const savedUser = await user.save();

      expect(savedUser.role).toBe('buyer');
    });
  });

  describe('Password Hashing', () => {
    it('should hash password before saving', async () => {
      const user = new User(mockUser);
      const savedUser = await user.save();

      expect(savedUser.password).not.toBe(mockUser.password);
      expect(await bcrypt.compare(mockUser.password, savedUser.password)).toBe(true);
    });

    it('should not hash password if it was not modified', async () => {
      const user = new User(mockUser);
      const savedUser = await user.save();

      // Update something else
      savedUser.name = 'Updated Name';
      const updatedUser = await savedUser.save();

      expect(updatedUser.password).toBe(savedUser.password);
    });
  });

  describe('Password Comparison', () => {
    it('should compare password correctly', async () => {
      const user = new User(mockUser);
      const savedUser = await user.save();

      const isMatch = await savedUser.comparePassword(mockUser.password);
      const isNotMatch = await savedUser.comparePassword('wrongpassword');

      expect(isMatch).toBe(true);
      expect(isNotMatch).toBe(false);
    });
  });

  describe('Unique Email Constraint', () => {
    it('should not allow duplicate emails', async () => {
      // Create first user
      await new User(mockUser).save();

      // Try to create second user with same email
      const user2 = new User({
        ...mockUser,
        email: mockUser.email,
        name: 'Second User'
      });

      let error;
      try {
        await user2.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.code).toBe(11000); // MongoDB duplicate key error code
    });
  });
});