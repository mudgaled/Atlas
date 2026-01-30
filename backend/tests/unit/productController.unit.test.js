const { 
  getProducts, 
  getProductById, 
  createProduct, 
  updateProduct, 
  deleteProduct, 
  getMyProducts 
} = require('../../controllers/productController');
const Product = require('../../models/Product');
const User = require('../../models/User');

// Mock the models
jest.mock('../../models/Product');
jest.mock('../../models/User');

describe('Product Controller - Unit Tests', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      query: {},
      user: { _id: 'mockUserId' }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn()
    };
    next = jest.fn();
    
    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('getProducts', () => {
    it('should fetch all products successfully', async () => {
      // Arrange
      req.query = { pageNumber: '1', keyword: 'test' };
      
      const mockProducts = [
        { name: 'Product 1', isActive: true, isVerified: true },
        { name: 'Product 2', isActive: true, isVerified: true }
      ];
      
      Product.countDocuments.mockResolvedValue(2);
      // Mock the chained methods for Product.find
      Product.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockProducts)
      });

      // Act
      await getProducts(req, res, next);

      // Assert 
      expect(Product.countDocuments).toHaveBeenCalledWith({ 
        $or: [
          { name: { $regex: 'test', $options: 'i' } },
          { description: { $regex: 'test', $options: 'i' } },
          { tags: { $in: [new RegExp('test', 'i')] } }
        ],
        isActive: true,
        isVerified: true
      });
      expect(Product.find).toHaveBeenCalledWith({ 
        $or: [
          { name: { $regex: 'test', $options: 'i' } },
          { description: { $regex: 'test', $options: 'i' } },
          { tags: { $in: [new RegExp('test', 'i')] } }
        ],
        isActive: true,
        isVerified: true
      });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          products: mockProducts,
          page: 1,
          pages: 1,
          count: 2
        }
      });
    });

    it('should handle server errors', async () => {
      // Arrange
      Product.countDocuments.mockRejectedValue(new Error('Database error'));

      // Act
      await getProducts(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Database error'
      });
    });
  });

  describe('getProductById', () => {
    it('should return product successfully', async () => {
      // Arrange
      req.params.id = 'productId123';
      
      const mockProduct = {
        _id: 'productId123',
        name: 'Test Product'
      };
      
      // Mock the chained .populate method
      Product.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockProduct)
      });

      // Act
      await getProductById(req, res, next);

      // Assert
      expect(Product.findById).toHaveBeenCalledWith('productId123');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockProduct
      });
    });

    it('should return 404 if product not found', async () => {
      // Arrange
      req.params.id = 'productId123';
      // Mock the chained .populate method that returns null
      Product.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(null)
      });

      // Act
      await getProductById(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Product not found'
      });
    });

    it('should handle CastError', async () => {
      // Arrange
      req.params.id = 'invalidId';
      const mockError = new Error('Invalid ID');
      mockError.name = 'CastError';
      // Mock the chained .populate method that throws an error
      Product.findById.mockReturnValue({
        populate: jest.fn().mockRejectedValue(mockError)
      });

      // Act
      await getProductById(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Product not found'
      });
    });

    it('should handle server errors', async () => {
      // Arrange
      req.params.id = 'productId123';
      // Mock the chained .populate method that throws an error
      Product.findById.mockReturnValue({
        populate: jest.fn().mockRejectedValue(new Error('Database error'))
      });

      // Act
      await getProductById(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Database error'
      });
    });
  });

  describe('createProduct', () => {
    it('should create a product successfully', async () => {
      // Arrange
      req.body = {
        name: 'New Product',
        description: 'Product description',
        category: 'category',
        price: 100,
        stock: 10
      };
      
      const mockProduct = {
        _id: 'newProductId',
        name: 'New Product',
        seller: 'mockUserId',
        save: jest.fn().mockResolvedValue({ _id: 'newProductId' })
      };
      
      const mockPopulatedProduct = {
        ...mockProduct
      };
      
      Product.mockImplementation(() => mockProduct);
      // Mock the chained .populate method for Product.findById
      Product.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockPopulatedProduct)
      });

      // Act
      await createProduct(req, res, next);

      // Assert
      expect(Product).toHaveBeenCalledWith({
        name: 'New Product',
        description: 'Product description',
        category: 'category',
        price: 100,
        images: [],
        stock: 10,
        specifications: {},
        location: {},
        seller: 'mockUserId',
        tags: []
      });
      expect(mockProduct.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Product created successfully',
        data: mockPopulatedProduct
      });
    });

    it('should handle server errors', async () => {
      // Arrange
      req.body = {
        name: 'New Product',
        description: 'Product description',
        category: 'category',
        price: 100,
        stock: 10
      };
      
      Product.mockImplementation(() => {
        throw new Error('Database error');
      });

      // Act
      await createProduct(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Database error'
      });
    });
  });

  describe('updateProduct', () => {
    it('should update product successfully', async () => {
      // Arrange
      req.params.id = 'productId123';
      req.body = {
        name: 'Updated Product',
        description: 'Updated description'
      };
      
      const mockProduct = {
        _id: 'productId123',
        name: 'Old Product',
        description: 'Old description',
        category: 'category',
        price: 100,
        stock: 10,
        seller: 'mockUserId',
        save: jest.fn().mockResolvedValue({
          _id: 'productId123',
          name: 'Updated Product',
          description: 'Updated description',
          category: 'category',
          price: 100,
          stock: 10,
          seller: 'mockUserId'
        })
      };
      
      const mockPopulatedProduct = { 
        _id: 'productId123',
        name: 'Updated Product',
        description: 'Updated description',
        category: 'category',
        price: 100,
        stock: 10,
        seller: 'mockUserId'
      };
      
      // Mock Product.findById to return the mockProduct first, then the populated product
      Product.findById.mockReturnValue({
        populate: jest.fn()
          .mockResolvedValueOnce(mockProduct)  // First call returns the product to be updated
          .mockResolvedValueOnce(mockPopulatedProduct)  // Second call returns the populated product
      });

      // Act
      await updateProduct(req, res, next);

      // Assert
      expect(Product.findById).toHaveBeenCalledWith('productId123');
      expect(mockProduct.name).toBe('Updated Product');
      expect(mockProduct.description).toBe('Updated description');
      expect(mockProduct.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Product updated successfully',
        data: mockPopulatedProduct
      });
    });

    it('should return 404 if product not found', async () => {
      // Arrange
      req.params.id = 'productId123';
      req.body = { name: 'Updated Product' };
      
      Product.findById.mockResolvedValue(null);

      // Act
      await updateProduct(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Product not found'
      });
    });

    it('should return 403 if user is not the seller', async () => {
      // Arrange
      req.params.id = 'productId123';
      req.body = { name: 'Updated Product' };
      req.user._id = 'differentUserId';
      
      const mockProduct = {
        _id: 'productId123',
        seller: 'anotherSellerId'
      };
      
      Product.findById.mockResolvedValue(mockProduct);

      // Act
      await updateProduct(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Not authorized to update this product'
      });
    });

    it('should handle CastError', async () => {
      // Arrange
      req.params.id = 'invalidId';
      req.body = { name: 'Updated Product' };
      
      const mockError = new Error('Invalid ID');
      mockError.name = 'CastError';
      Product.findById.mockRejectedValue(mockError);

      // Act
      await updateProduct(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Product not found'
      });
    });

    it('should handle server errors', async () => {
      // Arrange
      req.params.id = 'productId123';
      req.body = { name: 'Updated Product' };
      
      Product.findById.mockRejectedValue(new Error('Database error'));

      // Act
      await updateProduct(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Database error'
      });
    });
  });

  describe('deleteProduct', () => {
    it('should delete product successfully', async () => {
      // Arrange
      req.params.id = 'productId123';
      
      const mockProduct = {
        _id: 'productId123',
        seller: 'mockUserId'
      };
      
      Product.findById.mockResolvedValue(mockProduct);
      Product.deleteOne.mockResolvedValue({ deletedCount: 1 });

      // Act
      await deleteProduct(req, res, next);

      // Assert
      expect(Product.findById).toHaveBeenCalledWith('productId123');
      expect(Product.deleteOne).toHaveBeenCalledWith({ _id: 'productId123' });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Product removed'
      });
    });

    it('should return 404 if product not found', async () => {
      // Arrange
      req.params.id = 'productId123';
      
      Product.findById.mockResolvedValue(null);

      // Act
      await deleteProduct(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Product not found'
      });
    });

    it('should return 403 if user is not the seller', async () => {
      // Arrange
      req.params.id = 'productId123';
      req.user._id = 'differentUserId';
      
      const mockProduct = {
        _id: 'productId123',
        seller: 'anotherSellerId'
      };
      
      Product.findById.mockResolvedValue(mockProduct);

      // Act
      await deleteProduct(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Not authorized to delete this product'
      });
    });

    it('should handle CastError', async () => {
      // Arrange
      req.params.id = 'invalidId';
      
      const mockError = new Error('Invalid ID');
      mockError.name = 'CastError';
      Product.findById.mockRejectedValue(mockError);

      // Act
      await deleteProduct(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Product not found'
      });
    });

    it('should handle server errors', async () => {
      // Arrange
      req.params.id = 'productId123';
      
      Product.findById.mockRejectedValue(new Error('Database error'));

      // Act
      await deleteProduct(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Database error'
      });
    });
  });

  describe('getMyProducts', () => {
    it('should return products for current user', async () => {
      // Arrange
      req.query = { pageNumber: '1' };
      
      const mockProducts = [
        { name: 'My Product 1', seller: 'mockUserId' },
        { name: 'My Product 2', seller: 'mockUserId' }
      ];
      
      Product.countDocuments.mockResolvedValue(2);
      // Mock the chained methods for Product.find
      Product.find.mockReturnValue({
        limit: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockProducts)
      });

      // Act
      await getMyProducts(req, res, next);

      // Assert
      expect(Product.countDocuments).toHaveBeenCalledWith({ seller: 'mockUserId' });
      expect(Product.find).toHaveBeenCalledWith({ seller: 'mockUserId' });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          products: mockProducts,
          page: 1,
          pages: 1,
          count: 2
        }
      });
    });

    it('should handle server errors', async () => {
      // Arrange
      Product.countDocuments.mockRejectedValue(new Error('Database error'));

      // Act
      await getMyProducts(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Database error'
      });
    });
  });
});