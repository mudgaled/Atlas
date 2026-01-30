import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { productAPI, orderAPI } from '@/lib/api';
import { Link } from 'react-router-dom';
import { Package, ShoppingCart, TrendingUp, Users } from 'lucide-react';

const SellerDashboard = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalSales: 0,
    totalOrders: 0,
    pendingOrders: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch seller's products
        let productsResponse;
        try {
          productsResponse = await productAPI.getMyProducts();
        } catch (err) {
          console.error('Error fetching products:', err);
          productsResponse = [];
        }

        // Handle the API response structure - it might be wrapped in a data object
        const productsData = Array.isArray(productsResponse) ? productsResponse : productsResponse?.products || productsResponse?.data || [];
        setProducts(productsData);

        // Fetch seller's orders
        let ordersResponse;
        try {
          ordersResponse = await orderAPI.getMySellerOrders();
        } catch (err) {
          console.error('Error fetching orders:', err);
          ordersResponse = [];
        }

        const ordersData = Array.isArray(ordersResponse) ? ordersResponse : ordersResponse?.data || [];
        setOrders(ordersData);

        // Calculate stats
        const totalProducts = productsData.length;
        const totalOrders = ordersData.length;
        const pendingOrders = ordersData.filter(order => !order.isDelivered).length;
        const totalSales = ordersData.reduce((sum, order) => sum + order.totalPrice, 0);

        setStats({
          totalProducts,
          totalSales,
          totalOrders,
          pendingOrders
        });
      } catch (error) {
        console.error('Error fetching seller data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user && user.isSeller) {
      fetchData();
    }
  }, [user]);

  if (!user) {
    return (
      <div className="container mx-auto py-12">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Please Login to Access Seller Dashboard</h1>
          <p className="text-muted-foreground mb-8">You need to be logged in as a seller to access this page</p>
          <Button onClick={() => window.location.href = '/login'}>
            Login
          </Button>
        </div>
      </div>
    );
  }

  if (!user.isSeller) {
    return (
      <div className="container mx-auto py-12">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Seller Access Required</h1>
          <p className="text-muted-foreground mb-8">You need to be a verified seller to access this page</p>
          <Button asChild>
            <Link to="/">Go to Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (loading) return <div className="container mx-auto py-12">Loading dashboard...</div>;

  return (
    <div className="container mx-auto py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Seller Dashboard</h1>
          <div className="mt-2">
            <Badge variant="secondary" className="mr-2">
              {user?.sellerType?.charAt(0).toUpperCase() + user?.sellerType?.slice(1) || 'Seller'}
            </Badge>
            <Badge variant="default">
              Verified
            </Badge>
          </div>
        </div>
        <Button asChild>
          <Link to="/add-product">Add New Product</Link>
        </Button>
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalSales.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingOrders}</div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Recent Products */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Recent Products</h2>
            <Button size="sm" variant="outline" asChild>
              <Link to="/seller-products">View All</Link>
            </Button>
          </div>
          <div className="space-y-4">
            {products.slice(0, 3).map((product) => (
              <Card key={product._id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-muted rounded-lg w-16 h-16 flex items-center justify-center">
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-full" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold">{product.name}</h3>
                      <p className="text-sm text-muted-foreground">${product.price}</p>
                    </div>
                  </div>
                  <Badge variant="outline">{product.stock} in stock</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Recent Orders</h2>
            <Button size="sm" variant="outline" asChild>
              <Link to="/seller-orders">View All</Link>
            </Button>
          </div>
          <div className="space-y-4">
            {orders.slice(0, 3).map((order) => (
              <Card key={order._id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">Order #{order._id.substring(0, 8)}</h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${order.totalPrice}</p>
                      <Badge variant={order.isDelivered ? "default" : "secondary"}>
                        {order.isDelivered ? "Delivered" : "Pending"}
                      </Badge>
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm">
                      Items: {order.orderItems.reduce((acc, item) => acc + item.qty, 0)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Add New Product
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Add a new product to your inventory
            </p>
            <Button asChild className="w-full">
              <Link to="/add-product">Create Product</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Manage Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              View and manage your orders
            </p>
            <Button variant="outline" asChild className="w-full">
              <Link to="/seller-orders">View Orders</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Customer Messages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Respond to customer inquiries
            </p>
            <Button variant="outline" className="w-full" disabled>
              Coming Soon
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SellerDashboard;