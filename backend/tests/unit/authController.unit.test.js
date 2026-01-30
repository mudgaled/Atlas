const { registerUser, loginUser, getProfile, updateProfile } = require('../../controllers/authController');
const User = require('../../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Mock the User model and other dependencies
jest.mock('../../models/User');
jest.mock('jsonwebtoken');
jest.mock('bcryptjs');

describe('Auth Controller - Unit Tests', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {},
      user: { _id: 'mockUserId' }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    
    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('registerUser', () => {
    it('should register a new user successfully', async () => {
      // Arrange
      req.body = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'buyer'
      };

      const mockUser = {
        _id: 'userId123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'buyer',
        save: jest.fn()
      };

      User.findOne.mockResolvedValue(null); // No existing user
      User.create.mockResolvedValue(mockUser);
      jwt.sign.mockReturnValue('mockToken');

      // Act
      await registerUser(req, res, next);

      // Assert
      expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(User.create).toHaveBeenCalledWith({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'buyer'
      });
      expect(jwt.sign).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'User registered successfully',
        data: {
          _id: 'userId123',
          name: 'Test User',
          email: 'test@example.com',
          role: 'buyer',
          token: 'mockToken'
        }
      });
    });

    it('should return 400 if required fields are missing', async () => {
      // Arrange
      req.body = {
        name: 'Test User',
        // Missing email and password
      };

      // Act
      await registerUser(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Please provide all required fields'
      });
    });

    it('should return 400 if email is invalid', async () => {
      // Arrange
      req.body = {
        name: 'Test User',
        email: 'invalid-email',
        password: 'password123'
      };

      // Act
      await registerUser(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Please enter a valid email'
      });
    });

    it('should return 400 if password is too short', async () => {
      // Arrange
      req.body = {
        name: 'Test User',
        email: 'test@example.com',
        password: '12345' // Less than 6 characters
      };

      // Act
      await registerUser(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    });

    it('should return 400 if user already exists', async () => {
      // Arrange
      req.body = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      };

      User.findOne.mockResolvedValue({ email: 'test@example.com' }); // User exists

      // Act
      await registerUser(req, res, next);

      // Assert
      expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'User already exists with this email'
      });
    });

    it('should handle ValidationError', async () => {
      // Arrange
      req.body = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      };

      User.findOne.mockResolvedValue(null); // No existing user
      User.create.mockRejectedValue({
        name: 'ValidationError',
        errors: {
          email: { message: 'Email validation error' }
        }
      });

      // Act
      await registerUser(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Email validation error'
      });
    });

    it('should handle duplicate key error', async () => {
      // Arrange
      req.body = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      };

      User.findOne.mockResolvedValue(null); // No existing user
      User.create.mockRejectedValue({
        code: 11000
      });

      // Act
      await registerUser(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'User already exists with this email'
      });
    });

    it('should handle other server errors', async () => {
      // Arrange
      req.body = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      };

      User.findOne.mockResolvedValue(null); // No existing user
      User.create.mockRejectedValue(new Error('Database error'));

      // Act
      await registerUser(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Server Error - Database error'
      });
    });
  });

  describe('loginUser', () => {
    it('should login user successfully', async () => {
      // Arrange
      req.body = {
        email: 'test@example.com',
        password: 'password123'
      };

      const mockUser = {
        _id: 'userId123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'buyer',
        isActive: true,
        comparePassword: jest.fn().mockResolvedValue(true)
      };

      // Mock the chained .select() method
      User.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      });
      jwt.sign.mockReturnValue('mockToken');

      // Act
      await loginUser(req, res, next);

      // Assert
      expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(mockUser.comparePassword).toHaveBeenCalledWith('password123');
      expect(jwt.sign).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Login successful',
        data: {
          _id: 'userId123',
          name: 'Test User',
          email: 'test@example.com',
          role: 'buyer',
          token: 'mockToken'
        }
      });
    });

    it('should return 400 if email or password is missing', async () => {
      // Arrange
      req.body = {};

      // Act
      await loginUser(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Please provide email and password'
      });
    });

    it('should return 401 if user does not exist', async () => {
      // Arrange
      req.body = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };

      // Mock the chained .select() method that returns null
      User.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(null)
      });

      // Act
      await loginUser(req, res, next);

      // Assert
      expect(User.findOne).toHaveBeenCalledWith({ email: 'nonexistent@example.com' });
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid email or password'
      });
    });

    it('should return 401 if password is incorrect', async () => {
      // Arrange
      req.body = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      const mockUser = {
        _id: 'userId123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'buyer',
        isActive: true,
        comparePassword: jest.fn().mockResolvedValue(false)
      };

      // Mock the chained .select() method
      User.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      });

      // Act
      await loginUser(req, res, next);

      // Assert
      expect(mockUser.comparePassword).toHaveBeenCalledWith('wrongpassword');
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid email or password'
      });
    });

    it('should return 401 if account is deactivated', async () => {
      // Arrange
      req.body = {
        email: 'test@example.com',
        password: 'password123'
      };

      const mockUser = {
        _id: 'userId123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'buyer',
        isActive: false,
        comparePassword: jest.fn().mockResolvedValue(true)
      };

      // Mock the chained .select() method
      User.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      });

      // Act
      await loginUser(req, res, next);

      // Assert
      expect(mockUser.comparePassword).toHaveBeenCalledWith('password123');
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Account is deactivated'
      });
    });

    it('should handle server errors', async () => {
      // Arrange
      req.body = {
        email: 'test@example.com',
        password: 'password123'
      };

      // Mock the chained .select() method that throws an error
      User.findOne.mockReturnValue({
        select: jest.fn().mockRejectedValue(new Error('Database error'))
      });

      // Act
      await loginUser(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Server Error - Database error'
      });
    });
  });

  describe('getProfile', () => {
    it('should return user profile successfully', async () => {
      // Arrange
      const mockUser = {
        _id: 'userId123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'buyer'
      };

      // Mock the chained .select() method
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      });

      // Act
      await getProfile(req, res, next);

      // Assert
      expect(User.findById).toHaveBeenCalledWith('mockUserId');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockUser
      });
    });

    it('should handle server errors', async () => {
      // Arrange
      // Mock the chained .select() method that throws an error
      User.findById.mockReturnValue({
        select: jest.fn().mockRejectedValue(new Error('Database error'))
      });

      // Act
      await getProfile(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Database error'
      });
    });
  });

  describe('updateProfile', () => {
    it('should update user profile successfully', async () => {
      // Arrange
      req.body = {
        name: 'Updated Name',
        profile: { phone: '1234567890' }
      };

      const mockUpdatedUser = {
        _id: 'userId123',
        name: 'Updated Name',
        email: 'test@example.com',
        role: 'buyer',
        profile: { phone: '1234567890' }
      };

      // Mock the chained .select() method
      User.findByIdAndUpdate.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUpdatedUser)
      });

      // Act
      await updateProfile(req, res, next);

      // Assert
      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        'mockUserId',
        { name: 'Updated Name', profile: { phone: '1234567890' } },
        { new: true, runValidators: true }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Profile updated successfully',
        data: mockUpdatedUser
      });
    });

    it('should only update allowed fields', async () => {
      // Arrange
      req.body = {
        name: 'Updated Name',
        profile: { phone: '1234567890' },
        role: 'admin', // This should not be updated
        password: 'newpassword' // This should not be updated
      };

      const mockUpdatedUser = {
        _id: 'userId123',
        name: 'Updated Name',
        email: 'test@example.com',
        role: 'buyer', // Should remain unchanged
        profile: { phone: '1234567890' }
      };

      // Mock the chained .select() method
      User.findByIdAndUpdate.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUpdatedUser)
      });

      // Act
      await updateProfile(req, res, next);

      // Assert
      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        'mockUserId',
        { name: 'Updated Name', profile: { phone: '1234567890' } },
        { new: true, runValidators: true }
      );
    });

    it('should return 404 if user not found', async () => {
      // Arrange
      req.body = {
        name: 'Updated Name'
      };

      // Mock the chained .select() method
      User.findByIdAndUpdate.mockReturnValue({
        select: jest.fn().mockResolvedValue(null)
      });

      // Act
      await updateProfile(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'User not found'
      });
    });

    it('should handle server errors', async () => {
      // Arrange
      req.body = {
        name: 'Updated Name'
      };

      // Mock the chained .select() method that throws an error
      User.findByIdAndUpdate.mockReturnValue({
        select: jest.fn().mockRejectedValue(new Error('Database error'))
      });

      // Act
      await updateProfile(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Server Error - Database error'
      });
    });
  });
});