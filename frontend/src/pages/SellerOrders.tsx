import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { orderAPI } from '@/lib/api';
import { Link } from 'react-router-dom';

const SellerOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await orderAPI.getMySellerOrders();
        // Handle the API response structure - it might be wrapped in a data object
        const data = Array.isArray(response) ? response : response?.data || [];
        setOrders(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (user && user.isSeller) {
      fetchOrders();
    }
  }, [user]);

  if (!user) {
    return (
      <div className="container mx-auto py-12">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Please Login to View Orders</h1>
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

  if (loading) return <div className="container mx-auto py-12">Loading orders...</div>;
  if (error) return <div className="container mx-auto py-12">Error: {error}</div>;

  return (
    <div className="container mx-auto py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Orders</h1>
        <Button asChild>
          <Link to="/seller-dashboard">Back to Dashboard</Link>
        </Button>
      </div>
      
      {orders.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">No Orders Found</h2>
          <p className="text-muted-foreground mb-6">You haven't received any orders yet</p>
          <Button asChild>
            <Link to="/seller-dashboard">Go to Dashboard</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <Card key={order._id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Order #{order._id.substring(0, 8)}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Placed on {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={order.isPaid ? "default" : "secondary"}>
                    {order.isPaid ? "Paid" : "Pending"}
                  </Badge>
                  <Badge variant={order.isDelivered ? "default" : "outline"}>
                    {order.isDelivered ? "Delivered" : "Not Delivered"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h3 className="font-semibold mb-2">Customer Information</h3>
                    <p>{order.user?.name || 'N/A'}</p>
                    <p>{order.user?.email || 'N/A'}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">Shipping Address</h3>
                    <p>{order.shippingAddress.address}</p>
                    <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
                    <p>{order.shippingAddress.country}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">Order Totals</h3>
                    <p>Items: {order.orderItems.reduce((acc, item) => acc + item.qty, 0)}</p>
                    <p className="font-semibold">Total: ${order.totalPrice}</p>
                  </div>
                </div>
                
                <div className="mt-4">
                  <h3 className="font-semibold mb-2">Order Items</h3>
                  <div className="space-y-2">
                    {order.orderItems.map((item, index) => (
                      <div key={index} className="flex justify-between">
                        <span>{item.name} x {item.qty}</span>
                        <span>${(item.price * item.qty).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end gap-2">
                  <Button variant="outline">
                    View Details
                  </Button>
                  {!order.isDelivered && (
                    <Button>
                      Mark as Delivered
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default SellerOrders;