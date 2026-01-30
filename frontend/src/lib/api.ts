import axios from 'axios';

// Define interfaces/types
export interface User {
  _id: string;
  name: string;
  email: string;
  role: string; // 'buyer', 'seller', 'admin'
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
  profile?: {
    avatar: string;
  };
  verification?: {
    isVerified: boolean;
    verificationToken: string | null;
    verifiedAt: string;
  };
  sellerType?: 'manufacturer' | 'trader' | null;
}

export interface Product {
  _id: string;
  user: string;
  name: string;
  image: string;
  brand: string;
  category: string;
  description: string;
  reviews: Review[];
  rating: number;
  numReviews: number;
  price: number;
  countInStock: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Review {
  _id: string;
  name: string;
  rating: number;
  comment: string;
  user: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrderItem {
  name: string;
  qty: number;
  image: string;
  price: number;
  product: string;
}

export interface ShippingAddress {
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface Order {
  _id: string;
  orderItems: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  paymentResult?: {
    id: string;
    status: string;
    update_time: string;
    email_address: string;
  };
  taxPrice: number;
  shippingPrice: number;
  totalPrice: number;
  isPaid: boolean;
  paidAt?: string;
  isDelivered: boolean;
  deliveredAt?: string;
  user: string;
  createdAt?: string;
  updatedAt?: string;
}

// Base URL for the backend API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create an Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token to headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, remove it and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login'; // Or dispatch logout action
    }
    return Promise.reject(error);
  }
);

// Auth API functions
export const authAPI = {
  register: (userData: { name: string; email: string; password: string; role?: string }) =>
    api.post<{ success: boolean; message: string; data: { _id: string; name: string; email: string; role: string; token: string } }>('/users/register', userData)
      .then(response => ({
        token: response.data.data.token,
        user: {
          _id: response.data.data._id,
          name: response.data.data.name,
          email: response.data.data.email,
          role: response.data.data.role,
          isAdmin: response.data.data.role === 'admin',
          isSeller: response.data.data.role === 'seller'
        }
      })),

  login: (credentials: { email: string; password: string }) =>
    api.post<{ success: boolean; message: string; data: { _id: string; name: string; email: string; role: string; token: string } }>('/users/login', credentials)
      .then(response => ({
        token: response.data.data.token,
        user: {
          _id: response.data.data._id,
          name: response.data.data.name,
          email: response.data.data.email,
          role: response.data.data.role,
          isAdmin: response.data.data.role === 'admin',
          isSeller: response.data.data.role === 'seller'
        }
      })),

  getProfile: () =>
    api.get<{ success: boolean; data: User }>('/users/profile')
      .then(response => response.data.data),

  updateProfile: (profileData: { name?: string; email?: string }) =>
    api.put<{ success: boolean; data: User }>('/users/profile', profileData)
      .then(response => response.data.data),
};

// Product API functions
export const productAPI = {
  getProducts: (params?: { keyword?: string; pageNumber?: number; location?: string; minMOQ?: string; maxLeadTime?: string; currency?: string }) =>
    api.get<{ success: boolean; data: { products: Product[]; page: number; pages: number } }>('/products', { params })
      .then(response => response.data.data),

  getProductById: (id: string) =>
    api.get<{ success: boolean; data: Product }>(`/products/${id}`)
      .then(response => response.data.data),

  createProduct: (productData: Partial<Product>) =>
    api.post<{ success: boolean; data: Product }>('/products', productData)
      .then(response => response.data.data),

  updateProduct: (id: string, productData: Partial<Product>) =>
    api.put<{ success: boolean; data: Product }>(`/products/${id}`, productData)
      .then(response => response.data.data),

  deleteProduct: (id: string) => api.delete(`/products/${id}`),

  getMyProducts: () =>
    api.get<{ success: boolean; data: Product[] }>('/products/mine')
      .then(response => response.data.data),
};

// Order API functions
export const orderAPI = {
  createOrder: (orderData: Partial<Order>) =>
    api.post<{ success: boolean; data: Order }>('/orders', orderData)
      .then(response => response.data.data),

  getMyOrders: () =>
    api.get<{ success: boolean; data: Order[] }>('/orders/myorders')
      .then(response => response.data.data),

  getMySellerOrders: () =>
    api.get<{ success: boolean; data: Order[] }>('/orders/mysellerorders')
      .then(response => response.data.data),

  getOrderById: (id: string) =>
    api.get<{ success: boolean; data: Order }>(`/orders/${id}`)
      .then(response => response.data.data),

  payOrder: (id: string, paymentResult: any) =>
    api.put<{ success: boolean; data: Order }>(`/orders/${id}/pay`, paymentResult)
      .then(response => response.data.data),

  deliverOrder: (id: string) =>
    api.put<{ success: boolean; data: Order }>(`/orders/${id}/deliver`)
      .then(response => response.data.data),

  getOrders: () =>
    api.get<{ success: boolean; data: Order[] }>('/orders')
      .then(response => response.data.data), // Admin only
};

// Health check
export const healthCheck = () => api.get('/health');

// Stats API functions
export const statsAPI = {
  getPlatformStats: () =>
    api.get<{ success: boolean; data: {
      verifiedSuppliers: number;
      buyers: number;
      products: number;
      countries: number;
      tradeVolume: number;
      totalOrders: number
    } }>('/stats')
      .then(response => response.data.data),
};

// Supplier API functions
export const supplierAPI = {
  getSuppliers: (params?: { keyword?: string; pageNumber?: number; country?: string }) =>
    api.get<{ success: boolean; data: { suppliers: User[]; page: number; pages: number; count: number } }>('/suppliers', { params })
      .then(response => response.data.data),

  getSupplierById: (id: string) =>
    api.get<{ success: boolean; data: User }>('/suppliers/' + id)
      .then(response => response.data.data),

  getSupplierVerification: (id: string) =>
    api.get<{ success: boolean; data: any }>('/suppliers/' + id + '/verification')
      .then(response => response.data.data),
};

// Logistics API functions
export const logisticsAPI = {
  getLogisticsInfo: () =>
    api.get<{ success: boolean; data: any }>('/logistics')
      .then(response => response.data.data),

  planShipment: (shipmentData: { origin: string; destination: string; weight: number; dimensions?: string; commodityType?: string }) =>
    api.post<{ success: boolean; data: any }>('/logistics', shipmentData)
      .then(response => response.data.data),

  getPortInfo: (portName: string) =>
    api.get<{ success: boolean; data: any }>('/logistics/ports/' + portName)
      .then(response => response.data.data),
};

// Admin API functions
export const adminAPI = {
  getUsers: (params?: { keyword?: string; pageNumber?: number }) =>
    api.get<{ success: boolean; data: { users: User[]; page: number; pages: number } }>('/admin/users', { params })
      .then(response => response.data.data),

  getUserById: (id: string) =>
    api.get<{ success: boolean; data: User }>('/admin/users/' + id)
      .then(response => response.data.data),

  updateUser: (id: string, userData: Partial<User>) =>
    api.put<{ success: boolean; data: User }>('/admin/users/' + id, userData)
      .then(response => response.data.data),

  deleteUser: (id: string) =>
    api.delete<{ success: boolean; message: string }>('/admin/users/' + id)
      .then(response => response.data),

  verifyUser: (id: string, sellerType?: 'manufacturer' | 'trader') =>
    api.put<{ success: boolean; data: User }>('/admin/users/' + id + '/verify', { sellerType })
      .then(response => response.data.data),

  unverifyUser: (id: string) =>
    api.put<{ success: boolean; data: User }>('/admin/users/' + id + '/unverify')
      .then(response => response.data.data),

  getDashboardStats: () =>
    api.get<{ success: boolean; data: any }>('/admin/dashboard')
      .then(response => response.data.data),

  getProducts: (params?: { keyword?: string; pageNumber?: number }) =>
    api.get<{ success: boolean; data: { products: any[]; page: number; pages: number } }>('/admin/products', { params })
      .then(response => response.data.data),

  getProductById: (id: string) =>
    api.get<{ success: boolean; data: any }>('/admin/products/' + id)
      .then(response => response.data.data),

  updateProduct: (id: string, productData: any) =>
    api.put<{ success: boolean; data: any }>('/admin/products/' + id, productData)
      .then(response => response.data.data),

  deleteProduct: (id: string) =>
    api.delete<{ success: boolean; message: string }>('/admin/products/' + id)
      .then(response => response.data),

  verifyProduct: (id: string) =>
    api.put<{ success: boolean; data: any }>('/admin/products/' + id + '/verify')
      .then(response => response.data.data),

  unverifyProduct: (id: string) =>
    api.put<{ success: boolean; data: any }>('/admin/products/' + id + '/unverify')
      .then(response => response.data.data),
};

export default api;