const { protect, authorize } = require('../../middleware/auth');
const User = require('../../models/User');

// Mock the User model
jest.mock('../../models/User');

describe('Auth Middleware - Unit Tests', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    
    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('protect middleware', () => {
    it('should return 401 if no token provided', async () => {
      // Act
      await protect(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Not authorized, no token'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 if token does not start with Bearer', async () => {
      // Arrange
      req.headers.authorization = 'InvalidToken';

      // Act
      await protect(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Not authorized, no token'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 if token verification fails', async () => {
      // Arrange
      req.headers.authorization = 'Bearer invalidToken';
      const jwt = require('jsonwebtoken');
      jest.spyOn(jwt, 'verify').mockImplementation(() => {
        throw new Error('Invalid token');
      });

      // Act
      await protect(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Not authorized, token failed'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 if user not found', async () => {
      // Arrange
      req.headers.authorization = 'Bearer validToken';
      const jwt = require('jsonwebtoken');
      jest.spyOn(jwt, 'verify').mockReturnValue({ id: 'userId123' });
      User.findById.mockResolvedValue(null);

      // Act
      await protect(req, res, next);

      // Assert
      expect(User.findById).toHaveBeenCalledWith('userId123');
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Not authorized, user not found'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 if account is deactivated', async () => {
      // Arrange
      req.headers.authorization = 'Bearer validToken';
      const jwt = require('jsonwebtoken');
      jest.spyOn(jwt, 'verify').mockReturnValue({ id: 'userId123' });
      const mockUser = { _id: 'userId123', isActive: false };
      User.findById.mockResolvedValue(mockUser);

      // Act
      await protect(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Account is deactivated'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next with valid token and active user', async () => {
      // Arrange
      req.headers.authorization = 'Bearer validToken';
      const jwt = require('jsonwebtoken');
      jest.spyOn(jwt, 'verify').mockReturnValue({ id: 'userId123' });
      const mockUser = { _id: 'userId123', isActive: true };
      User.findById.mockResolvedValue(mockUser);

      // Act
      await protect(req, res, next);

      // Assert
      expect(req.user).toEqual(mockUser);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('authorize middleware', () => {
    it('should call next if user has required role', () => {
      // Arrange
      req.user = { role: 'admin' };

      // Act
      const middleware = authorize('admin', 'seller');
      middleware(req, res, next);

      // Assert
      expect(next).toHaveBeenCalled();
    });

    it('should return 403 if user does not have required role', () => {
      // Arrange
      req.user = { role: 'buyer' };

      // Act
      const middleware = authorize('admin', 'seller');
      middleware(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'User role \'buyer\' is not authorized to access this resource'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next if user has one of multiple required roles', () => {
      // Arrange
      req.user = { role: 'seller' };

      // Act
      const middleware = authorize('admin', 'seller', 'buyer');
      middleware(req, res, next);

      // Assert
      expect(next).toHaveBeenCalled();
    });
  });
});

describe('Error Handler Middleware - Unit Tests', () => {
  const { notFound, errorHandler } = require('../../middleware/errorHandler');

  let req, res, next;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    
    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('notFound middleware', () => {
    it('should return 404 for unknown routes', () => {
      // Act
      notFound(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Route not found'
      });
    });
  });

  describe('errorHandler middleware', () => {
    it('should handle regular errors', () => {
      // Arrange
      const error = new Error('Something went wrong');

      // Act
      errorHandler(error, req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Something went wrong'
      });
    });

    it('should handle errors with custom status code', () => {
      // Arrange
      const error = new Error('Bad Request');
      error.statusCode = 400;

      // Act
      errorHandler(error, req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Bad Request'
      });
    });

    it('should handle errors with custom status message', () => {
      // Arrange
      const error = new Error();
      error.statusCode = 400;
      error.status = 'fail';

      // Act
      errorHandler(error, req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Error',
        status: 'fail'
      });
    });

    it('should handle ValidationError from Mongoose', () => {
      // Arrange
      const error = new Error('Validation failed');
      error.name = 'ValidationError';
      error.errors = {
        email: { message: 'Please provide a valid email' }
      };

      // Act
      errorHandler(error, req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Please provide a valid email'
      });
    });

    it('should handle CastError from Mongoose', () => {
      // Arrange
      const error = new Error('Cast to ObjectId failed');
      error.name = 'CastError';

      // Act
      errorHandler(error, req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid ID format'
      });
    });

    it('should handle duplicate key error from Mongoose', () => {
      // Arrange
      const error = new Error('Duplicate key error');
      error.code = 11000;

      // Act
      errorHandler(error, req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Duplicate field value entered'
      });
    });
  });
});