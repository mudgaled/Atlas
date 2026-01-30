const { 
  createOrder,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  getMyOrders,
  getMySellerOrders,
  getOrders
} = require('../../controllers/orderController');
const Order = require('../../models/Order');
const Product = require('../../models/Product');

// Mock the models
jest.mock('../../models/Order');
jest.mock('../../models/Product');

describe('Order Controller - Unit Tests', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      query: {},
      user: { _id: 'mockUserId', role: 'buyer' }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    
    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('createOrder', () => {
    it('should create order successfully', async () => {
      // Arrange
      req.body = {
        orderItems: [
          {
            product: 'productId123',
            name: 'Product Name',
            quantity: 2,
            price: 100,
            seller: 'sellerId123'
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
      
      const mockProduct = {
        _id: 'productId123',
        name: 'Product Name',
        stock: 10,
        save: jest.fn()
      };
      
      const mockOrder = {
        _id: 'orderId123',
        orderItems: req.body.orderItems,
        user: 'mockUserId',
        seller: 'sellerId123',
        save: jest.fn()
      };
      
      Order.mockImplementation((data) => ({
        ...data,
        save: jest.fn().mockResolvedValue(mockOrder)
      }));
      
      Product.findById.mockResolvedValue(mockProduct);

      // Act
      await createOrder(req, res, next);

      // Assert
      expect(Product.findById).toHaveBeenCalledWith('productId123');
      expect(mockProduct.save).toHaveBeenCalled(); // Stock update
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Order created successfully',
        data: mockOrder
      });
    });

    it('should return 400 if no order items', async () => {
      // Arrange
      req.body = {
        orderItems: [],
        shippingAddress: {},
        paymentMethod: 'CARD'
      };

      // Act
      await createOrder(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'No order items'
      });
    });

    it('should return 404 if product not found', async () => {
      // Arrange
      req.body = {
        orderItems: [
          {
            product: 'nonExistentId',
            name: 'Product Name',
            quantity: 1,
            price: 100
          }
        ],
        shippingAddress: {},
        paymentMethod: 'CARD',
        itemsPrice: 100,
        taxPrice: 10,
        shippingPrice: 5,
        totalPrice: 115
      };
      
      Product.findById.mockResolvedValue(null);

      // Act
      await createOrder(req, res, next);

      // Assert
      expect(Product.findById).toHaveBeenCalledWith('nonExistentId');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Product not found: nonExistentId'
      });
    });

    it('should return 400 if insufficient stock', async () => {
      // Arrange
      req.body = {
        orderItems: [
          {
            product: 'productId123',
            name: 'Product Name',
            quantity: 15, // More than available stock
            price: 100
          }
        ],
        shippingAddress: {},
        paymentMethod: 'CARD',
        itemsPrice: 1500,
        taxPrice: 150,
        shippingPrice: 5,
        totalPrice: 1655
      };
      
      const mockProduct = {
        _id: 'productId123',
        name: 'Product Name',
        stock: 10 // Only 10 available
      };
      
      Product.findById.mockResolvedValue(mockProduct);

      // Act
      await createOrder(req, res, next);

      // Assert
      expect(Product.findById).toHaveBeenCalledWith('productId123');
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Insufficient stock for Product Name. Available: 10, Requested: 15'
      });
    });

    it('should handle server errors', async () => {
      // Arrange
      req.body = {
        orderItems: [
          {
            product: 'productId123',
            name: 'Product Name',
            quantity: 2,
            price: 100
          }
        ],
        shippingAddress: {},
        paymentMethod: 'CARD',
        itemsPrice: 200,
        taxPrice: 20,
        shippingPrice: 10,
        totalPrice: 230
      };
      
      Product.findById.mockRejectedValue(new Error('Database error'));

      // Act
      await createOrder(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Database error'
      });
    });
  });

  describe('getOrderById', () => {
    it('should return order if user is buyer', async () => {
      // Arrange
      req.params.id = 'orderId123';
      
      const mockOrder = {
        _id: 'orderId123',
        user: 'mockUserId',
        seller: 'sellerId123'
      };
      
      Order.findById.mockReturnThis();
      Order.findById.mockResolvedValue(mockOrder);

      // Act
      await getOrderById(req, res, next);

      // Assert
      expect(Order.findById).toHaveBeenCalledWith('orderId123');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockOrder
      });
    });

    it('should return order if user is seller', async () => {
      // Arrange
      req.params.id = 'orderId123';
      req.user._id = 'sellerId123'; // User is the seller
      
      const mockOrder = {
        _id: 'orderId123',
        user: 'buyerId123',
        seller: 'sellerId123'
      };
      
      Order.findById.mockReturnThis();
      Order.findById.mockResolvedValue(mockOrder);

      // Act
      await getOrderById(req, res, next);

      // Assert
      expect(Order.findById).toHaveBeenCalledWith('orderId123');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockOrder
      });
    });

    it('should return order if user is admin', async () => {
      // Arrange
      req.params.id = 'orderId123';
      req.user._id = 'adminId123';
      req.user.role = 'admin';
      
      const mockOrder = {
        _id: 'orderId123',
        user: 'buyerId123',
        seller: 'sellerId123'
      };
      
      Order.findById.mockReturnThis();
      Order.findById.mockResolvedValue(mockOrder);

      // Act
      await getOrderById(req, res, next);

      // Assert
      expect(Order.findById).toHaveBeenCalledWith('orderId123');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockOrder
      });
    });

    it('should return 403 if user is not authorized', async () => {
      // Arrange
      req.params.id = 'orderId123';
      req.user._id = 'unauthorizedId';
      
      const mockOrder = {
        _id: 'orderId123',
        user: 'buyerId123',
        seller: 'sellerId123'
      };
      
      Order.findById.mockReturnThis();
      Order.findById.mockResolvedValue(mockOrder);

      // Act
      await getOrderById(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Not authorized to access this order'
      });
    });

    it('should return 404 if order not found', async () => {
      // Arrange
      req.params.id = 'orderId123';
      Order.findById.mockReturnThis();
      Order.findById.mockResolvedValue(null);

      // Act
      await getOrderById(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Order not found'
      });
    });

    it('should handle CastError', async () => {
      // Arrange
      req.params.id = 'invalidId';
      const mockError = new Error('Invalid ID');
      mockError.name = 'CastError';
      Order.findById.mockRejectedValue(mockError);

      // Act
      await getOrderById(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Order not found'
      });
    });

    it('should handle server errors', async () => {
      // Arrange
      req.params.id = 'orderId123';
      Order.findById.mockRejectedValue(new Error('Database error'));

      // Act
      await getOrderById(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Database error'
      });
    });
  });

  describe('updateOrderToPaid', () => {
    it('should update order to paid successfully', async () => {
      // Arrange
      req.params.id = 'orderId123';
      req.body = {
        id: 'paymentId123',
        status: 'completed',
        update_time: '2023-01-01',
        payer: {
          email_address: 'payer@example.com'
        }
      };
      
      const mockOrder = {
        _id: 'orderId123',
        isPaid: false,
        save: jest.fn()
      };
      
      Order.findById.mockResolvedValue(mockOrder);

      // Act
      await updateOrderToPaid(req, res, next);

      // Assert
      expect(Order.findById).toHaveBeenCalledWith('orderId123');
      expect(mockOrder.isPaid).toBe(true);
      expect(mockOrder.paidAt).toBeDefined();
      expect(mockOrder.paymentResult).toEqual({
        id: 'paymentId123',
        status: 'completed',
        update_time: '2023-01-01',
        email_address: 'payer@example.com'
      });
      expect(mockOrder.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Order updated to paid',
        data: mockOrder
      });
    });

    it('should return 404 if order not found', async () => {
      // Arrange
      req.params.id = 'orderId123';
      Order.findById.mockResolvedValue(null);

      // Act
      await updateOrderToPaid(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Order not found'
      });
    });

    it('should handle server errors', async () => {
      // Arrange
      req.params.id = 'orderId123';
      Order.findById.mockRejectedValue(new Error('Database error'));

      // Act
      await updateOrderToPaid(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Database error'
      });
    });
  });

  describe('updateOrderToDelivered', () => {
    it('should update order to delivered if user is seller', async () => {
      // Arrange
      req.params.id = 'orderId123';
      req.user._id = 'sellerId123';
      req.user.role = 'seller';
      
      const mockOrder = {
        _id: 'orderId123',
        seller: 'sellerId123',
        isDelivered: false,
        save: jest.fn()
      };
      
      Order.findById.mockResolvedValue(mockOrder);

      // Act
      await updateOrderToDelivered(req, res, next);

      // Assert
      expect(Order.findById).toHaveBeenCalledWith('orderId123');
      expect(mockOrder.isDelivered).toBe(true);
      expect(mockOrder.deliveredAt).toBeDefined();
      expect(mockOrder.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Order updated to delivered',
        data: mockOrder
      });
    });

    it('should update order to delivered if user is admin', async () => {
      // Arrange
      req.params.id = 'orderId123';
      req.user._id = 'adminId123';
      req.user.role = 'admin';
      
      const mockOrder = {
        _id: 'orderId123',
        seller: 'sellerId123',
        isDelivered: false,
        save: jest.fn()
      };
      
      Order.findById.mockResolvedValue(mockOrder);

      // Act
      await updateOrderToDelivered(req, res, next);

      // Assert
      expect(Order.findById).toHaveBeenCalledWith('orderId123');
      expect(mockOrder.isDelivered).toBe(true);
      expect(mockOrder.deliveredAt).toBeDefined();
      expect(mockOrder.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Order updated to delivered',
        data: mockOrder
      });
    });

    it('should return 403 if user is not seller or admin', async () => {
      // Arrange
      req.params.id = 'orderId123';
      req.user._id = 'unauthorizedId';
      req.user.role = 'buyer';
      
      const mockOrder = {
        _id: 'orderId123',
        seller: 'sellerId123'
      };
      
      Order.findById.mockResolvedValue(mockOrder);

      // Act
      await updateOrderToDelivered(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Not authorized to deliver this order'
      });
    });

    it('should return 404 if order not found', async () => {
      // Arrange
      req.params.id = 'orderId123';
      Order.findById.mockResolvedValue(null);

      // Act
      await updateOrderToDelivered(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Order not found'
      });
    });

    it('should handle server errors', async () => {
      // Arrange
      req.params.id = 'orderId123';
      Order.findById.mockRejectedValue(new Error('Database error'));

      // Act
      await updateOrderToDelivered(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Database error'
      });
    });
  });

  describe('getMyOrders', () => {
    it('should return orders for current user', async () => {
      // Arrange
      const mockOrders = [
        { _id: 'order1', user: 'mockUserId' },
        { _id: 'order2', user: 'mockUserId' }
      ];
      
      Order.find.mockReturnThis();
      Order.find.mockResolvedValue(mockOrders);

      // Act
      await getMyOrders(req, res, next);

      // Assert
      expect(Order.find).toHaveBeenCalledWith({ user: 'mockUserId' });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockOrders
      });
    });

    it('should handle server errors', async () => {
      // Arrange
      Order.find.mockRejectedValue(new Error('Database error'));

      // Act
      await getMyOrders(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Database error'
      });
    });
  });

  describe('getMySellerOrders', () => {
    it('should return orders for current seller', async () => {
      // Arrange
      const mockOrders = [
        { _id: 'order1', seller: 'mockUserId' },
        { _id: 'order2', seller: 'mockUserId' }
      ];
      
      Order.find.mockReturnThis();
      Order.find.mockResolvedValue(mockOrders);

      // Act
      await getMySellerOrders(req, res, next);

      // Assert
      expect(Order.find).toHaveBeenCalledWith({ seller: 'mockUserId' });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockOrders
      });
    });

    it('should handle server errors', async () => {
      // Arrange
      Order.find.mockRejectedValue(new Error('Database error'));

      // Act
      await getMySellerOrders(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Database error'
      });
    });
  });

  describe('getOrders', () => {
    it('should return all orders for admin', async () => {
      // Arrange
      req.user.role = 'admin';
      const mockOrders = [
        { _id: 'order1', user: 'user1', seller: 'seller1' },
        { _id: 'order2', user: 'user2', seller: 'seller2' }
      ];
      
      Order.find.mockReturnThis();
      Order.find.mockResolvedValue(mockOrders);

      // Act
      await getOrders(req, res, next);

      // Assert
      expect(Order.find).toHaveBeenCalledWith({});
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockOrders
      });
    });

    it('should handle server errors', async () => {
      // Arrange
      req.user.role = 'admin';
      Order.find.mockRejectedValue(new Error('Database error'));

      // Act
      await getOrders(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Database error'
      });
    });
  });
});